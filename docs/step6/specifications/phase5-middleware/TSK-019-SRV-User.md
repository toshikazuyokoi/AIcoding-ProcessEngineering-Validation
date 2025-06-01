# TSK-019-SRV-User Issue仕様書

## 概要
**タスクID**: TSK-019-SRV-User  
**ファイル**: src/application/services/UserService.ts  
**複雑度**: 高  
**見積時間**: 4時間  
**優先度**: 🥇最重要（ユーザービジネスロジック・アプリケーションサービス）  
**フェーズ**: Phase 5: ミドルウェア・サービス層構築  

## 実装対象
- **ファイル**: `src/application/services/UserService.ts`
- **クラス**: UserService・UserCommandHandler・UserQueryHandler・UserEventHandler
- **レイヤー**: Application Service（アプリケーションサービス層）
- **責任範囲**: ユーザービジネスロジック・ワークフロー・トランザクション調整

## 実装仕様

### 前提条件
- 依存タスク: TSK-017-REP-User, TSK-015-ENT-User, TSK-009-TYP-Auth
- 参照設計書: `docs/step3/detailed-design/user-service.md`
- 技術スタック: TypeScript, CQRS, Domain Events, Dependency Injection

### ユーザーサービス設計

#### 1. User Service Interface & Implementation
```typescript
import { IUserRepository } from '../../infrastructure/repositories/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import { UserID, Email, Result, Ok, Err, PaginatedResult } from '../../types/core.js';
import { CreateUserRequest, UpdateUserRequest, UserSearchCriteria } from '../../types/user.js';
import { ValidationFramework } from '../../config/validation.js';
import { Logger } from '../../config/logger.js';
import { EventBus } from '../../infrastructure/events/EventBus.js';
import { PasswordHasher } from '../../infrastructure/security/PasswordHasher.js';
import { ServiceError, ServiceErrorCode } from '../errors/ServiceError.js';

export interface IUserService {
  // Command operations (writes)
  createUser(request: CreateUserRequest): Promise<Result<User, ServiceError>>;
  updateUser(id: UserID, request: UpdateUserRequest): Promise<Result<User, ServiceError>>;
  updatePassword(id: UserID, currentPassword: string, newPassword: string): Promise<Result<void, ServiceError>>;
  updateEmail(id: UserID, newEmail: Email, password: string): Promise<Result<void, ServiceError>>;
  activateUser(id: UserID): Promise<Result<void, ServiceError>>;
  deactivateUser(id: UserID, reason: string): Promise<Result<void, ServiceError>>;
  deleteUser(id: UserID, password: string): Promise<Result<void, ServiceError>>;
  
  // Query operations (reads)
  findById(id: UserID): Promise<Result<User | null, ServiceError>>;
  findByEmail(email: Email): Promise<Result<User | null, ServiceError>>;
  searchUsers(criteria: UserSearchCriteria): Promise<Result<PaginatedResult<User>, ServiceError>>;
  getUserStatistics(): Promise<Result<UserStatistics, ServiceError>>;
  
  // Authentication related
  verifyPassword(id: UserID, password: string): Promise<Result<boolean, ServiceError>>;
  requestPasswordReset(email: Email): Promise<Result<void, ServiceError>>;
  resetPassword(token: string, newPassword: string): Promise<Result<void, ServiceError>>;
  verifyEmail(token: string): Promise<Result<void, ServiceError>>;
  
  // Profile and settings
  updateProfile(id: UserID, profileData: Partial<UserProfile>): Promise<Result<User, ServiceError>>;
  updateSettings(id: UserID, settingsData: Partial<UserSettings>): Promise<Result<User, ServiceError>>;
  updateSecuritySettings(id: UserID, securityData: Partial<SecuritySettings>): Promise<Result<User, ServiceError>>;
}

export class UserService implements IUserService {
  private readonly logger = Logger.getInstance();
  private readonly validator = ValidationFramework.getInstance();

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventBus: EventBus
  ) {}

  // Command Operations
  public async createUser(request: CreateUserRequest): Promise<Result<User, ServiceError>> {
    try {
      // Validate request
      const validationResult = this.validator.validate(request, 'USER_REGISTRATION');
      if (!validationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.VALIDATION_FAILED,
          'User registration validation failed',
          { validationErrors: validationResult.error }
        ));
      }

      // Check if user already exists
      const existingUserResult = await this.userRepository.findByEmail(request.email);
      if (!existingUserResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to check existing user',
          { email: request.email, error: existingUserResult.error }
        ));
      }

      if (existingUserResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.USER_ALREADY_EXISTS,
          'User with this email already exists',
          { email: request.email }
        ));
      }

      // Hash password
      const hashedPasswordResult = await this.passwordHasher.hash(request.password);
      if (!hashedPasswordResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.PASSWORD_HASHING_FAILED,
          'Failed to hash password',
          { error: hashedPasswordResult.error }
        ));
      }

      // Create user entity
      const userCreationResult = User.create({
        email: request.email,
        hashedPassword: hashedPasswordResult.data,
        profile: {
          displayName: request.profile.displayName,
          firstName: request.profile.firstName,
          lastName: request.profile.lastName
        },
        source: request.source || 'direct',
        inviteCode: request.inviteCode
      });

      if (!userCreationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.DOMAIN_ERROR,
          'Failed to create user entity',
          { error: userCreationResult.error }
        ));
      }

      const user = userCreationResult.data;

      // Save to repository
      const saveResult = await this.userRepository.save(user);
      if (!saveResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to save user',
          { userId: user.id, error: saveResult.error }
        ));
      }

      // Publish domain events
      await this.publishDomainEvents(user);

      this.logger.info('User created successfully', { 
        userId: user.id, 
        email: user.email 
      });

      return Ok(user);
    } catch (error) {
      this.logger.error('Error creating user', error, { request });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error creating user',
        { error: error.message }
      ));
    }
  }

  public async updateUser(id: UserID, request: UpdateUserRequest): Promise<Result<User, ServiceError>> {
    try {
      // Validate request
      const validationResult = this.validator.validate(request, 'USER_UPDATE');
      if (!validationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.VALIDATION_FAILED,
          'User update validation failed',
          { validationErrors: validationResult.error }
        ));
      }

      // Find existing user
      const userResult = await this.userRepository.findById(id);
      if (!userResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to find user',
          { userId: id, error: userResult.error }
        ));
      }

      if (!userResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.USER_NOT_FOUND,
          'User not found',
          { userId: id }
        ));
      }

      const user = userResult.data;

      // Apply updates
      if (request.profile) {
        const updateProfileResult = user.updateProfile(request.profile);
        if (!updateProfileResult.success) {
          return Err(new ServiceError(
            ServiceErrorCode.DOMAIN_ERROR,
            'Failed to update user profile',
            { userId: id, error: updateProfileResult.error }
          ));
        }
      }

      if (request.settings) {
        const updateSettingsResult = user.updateSettings(request.settings);
        if (!updateSettingsResult.success) {
          return Err(new ServiceError(
            ServiceErrorCode.DOMAIN_ERROR,
            'Failed to update user settings',
            { userId: id, error: updateSettingsResult.error }
          ));
        }
      }

      // Save updated user
      const saveResult = await this.userRepository.update(user);
      if (!saveResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to update user',
          { userId: id, error: saveResult.error }
        ));
      }

      // Publish domain events
      await this.publishDomainEvents(user);

      this.logger.info('User updated successfully', { userId: id });
      return Ok(user);
    } catch (error) {
      this.logger.error('Error updating user', error, { userId: id, request });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error updating user',
        { userId: id, error: error.message }
      ));
    }
  }

  public async updatePassword(
    id: UserID, 
    currentPassword: string, 
    newPassword: string
  ): Promise<Result<void, ServiceError>> {
    try {
      // Find user
      const userResult = await this.userRepository.findById(id);
      if (!userResult.success || !userResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.USER_NOT_FOUND,
          'User not found',
          { userId: id }
        ));
      }

      const user = userResult.data;

      // Verify current password
      const passwordVerificationResult = await this.passwordHasher.verify(
        currentPassword,
        user.security.passwordHash
      );

      if (!passwordVerificationResult.success || !passwordVerificationResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.INVALID_CREDENTIALS,
          'Current password is incorrect',
          { userId: id }
        ));
      }

      // Validate new password strength
      const passwordValidationResult = this.validator.validate(
        { password: newPassword },
        'PASSWORD_STRENGTH'
      );

      if (!passwordValidationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.WEAK_PASSWORD,
          'New password does not meet security requirements',
          { validationErrors: passwordValidationResult.error }
        ));
      }

      // Hash new password
      const hashedPasswordResult = await this.passwordHasher.hash(newPassword);
      if (!hashedPasswordResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.PASSWORD_HASHING_FAILED,
          'Failed to hash new password',
          { error: hashedPasswordResult.error }
        ));
      }

      // Update password
      const updatePasswordResult = user.updatePassword(hashedPasswordResult.data);
      if (!updatePasswordResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.DOMAIN_ERROR,
          'Failed to update password',
          { userId: id, error: updatePasswordResult.error }
        ));
      }

      // Save user
      const saveResult = await this.userRepository.update(user);
      if (!saveResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to save password update',
          { userId: id, error: saveResult.error }
        ));
      }

      // Publish domain events
      await this.publishDomainEvents(user);

      this.logger.info('Password updated successfully', { userId: id });
      return Ok(undefined);
    } catch (error) {
      this.logger.error('Error updating password', error, { userId: id });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error updating password',
        { userId: id, error: error.message }
      ));
    }
  }

  // Query Operations
  public async findById(id: UserID): Promise<Result<User | null, ServiceError>> {
    try {
      const result = await this.userRepository.findById(id);
      if (!result.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to find user',
          { userId: id, error: result.error }
        ));
      }

      return Ok(result.data);
    } catch (error) {
      this.logger.error('Error finding user', error, { userId: id });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding user',
        { userId: id, error: error.message }
      ));
    }
  }

  public async findByEmail(email: Email): Promise<Result<User | null, ServiceError>> {
    try {
      const result = await this.userRepository.findByEmail(email);
      if (!result.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to find user by email',
          { email, error: result.error }
        ));
      }

      return Ok(result.data);
    } catch (error) {
      this.logger.error('Error finding user by email', error, { email });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding user by email',
        { email, error: error.message }
      ));
    }
  }

  public async searchUsers(criteria: UserSearchCriteria): Promise<Result<PaginatedResult<User>, ServiceError>> {
    try {
      // Validate search criteria
      const validationResult = this.validator.validate(criteria, 'USER_SEARCH');
      if (!validationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.VALIDATION_FAILED,
          'User search validation failed',
          { validationErrors: validationResult.error }
        ));
      }

      const result = await this.userRepository.search(criteria);
      if (!result.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to search users',
          { criteria, error: result.error }
        ));
      }

      return Ok(result.data);
    } catch (error) {
      this.logger.error('Error searching users', error, { criteria });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error searching users',
        { criteria, error: error.message }
      ));
    }
  }

  // Authentication Operations
  public async verifyPassword(id: UserID, password: string): Promise<Result<boolean, ServiceError>> {
    try {
      const userResult = await this.userRepository.findById(id);
      if (!userResult.success || !userResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.USER_NOT_FOUND,
          'User not found',
          { userId: id }
        ));
      }

      const user = userResult.data;
      const verificationResult = await this.passwordHasher.verify(password, user.security.passwordHash);

      if (!verificationResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.PASSWORD_VERIFICATION_FAILED,
          'Password verification failed',
          { userId: id, error: verificationResult.error }
        ));
      }

      return Ok(verificationResult.data);
    } catch (error) {
      this.logger.error('Error verifying password', error, { userId: id });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error verifying password',
        { userId: id, error: error.message }
      ));
    }
  }

  // Event handling
  private async publishDomainEvents(user: User): Promise<void> {
    try {
      const events = user.getUncommittedEvents();
      for (const event of events) {
        await this.eventBus.publish(event);
      }
      user.markEventsAsCommitted();
    } catch (error) {
      this.logger.error('Error publishing domain events', error, { userId: user.id });
      // Don't throw here as the main operation succeeded
    }
  }

  // Profile and Settings Operations
  public async updateProfile(
    id: UserID, 
    profileData: Partial<UserProfile>
  ): Promise<Result<User, ServiceError>> {
    try {
      const userResult = await this.userRepository.findById(id);
      if (!userResult.success || !userResult.data) {
        return Err(new ServiceError(
          ServiceErrorCode.USER_NOT_FOUND,
          'User not found',
          { userId: id }
        ));
      }

      const user = userResult.data;
      const updateResult = user.updateProfile(profileData);

      if (!updateResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.DOMAIN_ERROR,
          'Failed to update profile',
          { userId: id, error: updateResult.error }
        ));
      }

      const saveResult = await this.userRepository.update(user);
      if (!saveResult.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to save profile update',
          { userId: id, error: saveResult.error }
        ));
      }

      await this.publishDomainEvents(user);
      return Ok(user);
    } catch (error) {
      this.logger.error('Error updating profile', error, { userId: id });
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error updating profile',
        { userId: id, error: error.message }
      ));
    }
  }

  public async getUserStatistics(): Promise<Result<UserStatistics, ServiceError>> {
    try {
      const result = await this.userRepository.getStatistics();
      if (!result.success) {
        return Err(new ServiceError(
          ServiceErrorCode.REPOSITORY_ERROR,
          'Failed to get user statistics',
          { error: result.error }
        ));
      }

      return Ok(result.data);
    } catch (error) {
      this.logger.error('Error getting user statistics', error);
      return Err(new ServiceError(
        ServiceErrorCode.UNEXPECTED_ERROR,
        'Unexpected error getting user statistics',
        { error: error.message }
      ));
    }
  }
}

// Supporting Types
export enum ServiceErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  PASSWORD_HASHING_FAILED = 'PASSWORD_HASHING_FAILED',
  PASSWORD_VERIFICATION_FAILED = 'PASSWORD_VERIFICATION_FAILED',
  DOMAIN_ERROR = 'DOMAIN_ERROR',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
}

export class ServiceError {
  constructor(
    public readonly code: ServiceErrorCode,
    public readonly message: string,
    public readonly context?: Record<string, unknown>
  ) {}
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] Application Service・CQRS・Domain Event Pattern理解
  - [ ] ユーザービジネスロジック・ワークフロー・制約理解
  - [ ] セキュリティ要件・認証認可・データ保護
  - [ ] トランザクション・データ整合性・エラーハンドリング
- [ ] 2. コーディング
  - [ ] IUserService Interface実装
  - [ ] UserService Core Implementation実装
  - [ ] Command Operations実装（Create・Update・Delete）
  - [ ] Query Operations実装（Find・Search・Statistics）
  - [ ] Authentication Operations実装
  - [ ] Profile & Settings Management実装
- [ ] 3. テストコーディング
  - [ ] 正常系・異常系・境界値・セキュリティテスト
  - [ ] ビジネスロジック・ワークフロー・制約テスト
  - [ ] トランザクション・データ整合性・並行性テスト
- [ ] 4. 単体テスト実行（カバレッジ95%以上）
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：全操作・ワークフロー・ビジネスロジック確認
- [ ] 異常系テスト：バリデーション・認証・エラーハンドリング
- [ ] セキュリティテスト：認証・認可・データ保護・攻撃対策
- [ ] 統合テスト：Repository連携・Event発行・トランザクション

## 完了条件
- [ ] UserService・Command/Query Handler実装完了
- [ ] 全ビジネスロジック・ワークフロー実装完了
- [ ] セキュリティ・認証・バリデーション実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] セキュリティテスト100%通過
- [ ] TypeScript厳密モード エラー0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/user-service.md`
- **依存タスク**: TSK-017 (UserRepository), TSK-015 (Userエンティティ), TSK-009 (認証型)
- **後続タスク**: TSK-024 (Controller), TSK-025 (API Routes)
- **パターン**: Application Service, CQRS, Domain Events

## 備考
- ビジネスロジック・ワークフロー最優先
- セキュリティ・データ保護厳格実装
- パフォーマンス・スケーラビリティ考慮
- 将来的な機能拡張・複雑化対応 