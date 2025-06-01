# TSK-017-REP-User Issue仕様書

## 概要
**タスクID**: TSK-017-REP-User  
**ファイル**: src/infrastructure/repositories/UserRepository.ts  
**複雑度**: 高  
**見積時間**: 5時間  
**優先度**: 🥇最重要（ユーザーデータアクセス・永続化）  
**フェーズ**: Phase 4: インフラストラクチャ層構築  

## 実装対象
- **ファイル**: `src/infrastructure/repositories/UserRepository.ts`
- **クラス**: UserRepository・UserMapper・UserQueryBuilder・UserSpecification
- **レイヤー**: Infrastructure（インフラストラクチャ層）
- **責任範囲**: ユーザーデータ永続化・クエリ実行・データマッピング・キャッシュ管理

## 実装仕様

### 前提条件
- 依存タスク: TSK-004-DAL-Connection, TSK-015-ENT-User, TSK-011-TYP-User
- 参照設計書: `docs/step3/detailed-design/user-repository.md`
- 技術スタック: SQLite, TypeScript, Repository Pattern, Data Mapper

### ユーザーリポジトリ設計

#### 1. User Repository Interface & Implementation
```typescript
import { Repository, IRepository } from '../base/Repository.js';
import { DatabaseConnection, Transaction } from '../database/Connection.js';
import { User } from '../../domain/entities/User.js';
import { UserID, Email, Timestamp, Result, Ok, Err, PaginatedResult } from '../../types/core.js';
import { UserSearchCriteria, UserSortOptions, UserFilterOptions } from '../../types/user.js';
import { RepositoryError, RepositoryErrorCode } from '../errors/RepositoryError.js';
import { Logger } from '../../config/logger.js';

export interface IUserRepository extends IRepository<User, UserID> {
  // Basic CRUD operations
  findById(id: UserID): Promise<Result<User | null, RepositoryError>>;
  findByEmail(email: Email): Promise<Result<User | null, RepositoryError>>;
  findByIds(ids: UserID[]): Promise<Result<User[], RepositoryError>>;
  save(user: User): Promise<Result<User, RepositoryError>>;
  update(user: User): Promise<Result<User, RepositoryError>>;
  delete(id: UserID): Promise<Result<void, RepositoryError>>;
  
  // Advanced query operations
  findAll(options?: UserQueryOptions): Promise<Result<PaginatedResult<User>, RepositoryError>>;
  search(criteria: UserSearchCriteria): Promise<Result<PaginatedResult<User>, RepositoryError>>;
  findByRole(role: Role): Promise<Result<User[], RepositoryError>>;
  findByStatus(status: AccountStatus): Promise<Result<User[], RepositoryError>>;
  findActiveUsers(since?: Timestamp): Promise<Result<User[], RepositoryError>>;
  
  // Specialized queries
  existsByEmail(email: Email): Promise<Result<boolean, RepositoryError>>;
  existsByUsername(username: string): Promise<Result<boolean, RepositoryError>>;
  countByRole(role: Role): Promise<Result<number, RepositoryError>>;
  getStatistics(): Promise<Result<UserStatistics, RepositoryError>>;
  
  // Batch operations
  saveBatch(users: User[]): Promise<Result<User[], RepositoryError>>;
  updateBatch(users: User[]): Promise<Result<User[], RepositoryError>>;
  deleteBatch(ids: UserID[]): Promise<Result<void, RepositoryError>>;
  
  // Transaction support
  withinTransaction<T>(operation: (repo: IUserRepository) => Promise<T>): Promise<Result<T, RepositoryError>>;
}

export class UserRepository extends Repository<User, UserID> implements IUserRepository {
  private readonly logger = Logger.getInstance();
  private readonly cache = new Map<UserID, CacheEntry<User>>();
  private readonly mapper = new UserMapper();
  private readonly queryBuilder = new UserQueryBuilder();

  constructor(
    connection: DatabaseConnection,
    private readonly cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG
  ) {
    super(connection);
  }

  // Basic CRUD Operations
  public async findById(id: UserID): Promise<Result<User | null, RepositoryError>> {
    try {
      // Check cache first
      const cached = this.getFromCache(id);
      if (cached) {
        this.logger.debug('User found in cache', { userId: id });
        return Ok(cached);
      }

      const query = this.queryBuilder
        .select()
        .from('users')
        .leftJoinProfile()
        .leftJoinSettings()
        .leftJoinSecurity()
        .where('u.id = ?')
        .build();

      const result = await this.connection.query<UserRow>(query, [id]);
      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to find user by ID',
          { userId: id, error: result.error }
        ));
      }

      if (result.data.length === 0) {
        return Ok(null);
      }

      const user = this.mapper.toDomain(result.data[0]);
      this.setCache(id, user);
      
      return Ok(user);
    } catch (error) {
      this.logger.error('Error finding user by ID', error, { userId: id });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding user',
        { userId: id, error: error.message }
      ));
    }
  }

  public async findByEmail(email: Email): Promise<Result<User | null, RepositoryError>> {
    try {
      const query = this.queryBuilder
        .select()
        .from('users')
        .leftJoinProfile()
        .leftJoinSettings()
        .leftJoinSecurity()
        .where('u.email = ?')
        .build();

      const result = await this.connection.query<UserRow>(query, [email]);
      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to find user by email',
          { email, error: result.error }
        ));
      }

      if (result.data.length === 0) {
        return Ok(null);
      }

      const user = this.mapper.toDomain(result.data[0]);
      this.setCache(user.id, user);
      
      return Ok(user);
    } catch (error) {
      this.logger.error('Error finding user by email', error, { email });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding user by email',
        { email, error: error.message }
      ));
    }
  }

  public async findByIds(ids: UserID[]): Promise<Result<User[], RepositoryError>> {
    if (ids.length === 0) {
      return Ok([]);
    }

    try {
      // Check cache for all IDs
      const users: User[] = [];
      const uncachedIds: UserID[] = [];

      for (const id of ids) {
        const cached = this.getFromCache(id);
        if (cached) {
          users.push(cached);
        } else {
          uncachedIds.push(id);
        }
      }

      // Query database for uncached users
      if (uncachedIds.length > 0) {
        const placeholders = uncachedIds.map(() => '?').join(',');
        const query = this.queryBuilder
          .select()
          .from('users')
          .leftJoinProfile()
          .leftJoinSettings()
          .leftJoinSecurity()
          .where(`u.id IN (${placeholders})`)
          .build();

        const result = await this.connection.query<UserRow>(query, uncachedIds);
        if (!result.success) {
          return Err(new RepositoryError(
            RepositoryErrorCode.QUERY_FAILED,
            'Failed to find users by IDs',
            { userIds: uncachedIds, error: result.error }
          ));
        }

        const dbUsers = result.data.map(row => {
          const user = this.mapper.toDomain(row);
          this.setCache(user.id, user);
          return user;
        });

        users.push(...dbUsers);
      }

      // Sort users to maintain order of input IDs
      const userMap = new Map(users.map(u => [u.id, u]));
      const orderedUsers = ids.map(id => userMap.get(id)).filter(Boolean) as User[];

      return Ok(orderedUsers);
    } catch (error) {
      this.logger.error('Error finding users by IDs', error, { userIds: ids });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding users by IDs',
        { userIds: ids, error: error.message }
      ));
    }
  }

  public async save(user: User): Promise<Result<User, RepositoryError>> {
    try {
      const userData = this.mapper.toPersistence(user);
      
      // Check if user already exists
      const existsResult = await this.existsByEmail(user.email);
      if (!existsResult.success) {
        return Err(existsResult.error);
      }

      if (existsResult.data) {
        return Err(new RepositoryError(
          RepositoryErrorCode.DUPLICATE_ENTITY,
          'User with this email already exists',
          { email: user.email }
        ));
      }

      return await this.withinTransaction(async (txRepo) => {
        // Insert main user record
        const insertUserQuery = `
          INSERT INTO users (
            id, email, username, password_hash, email_verified, 
            phone_verified, account_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const userParams = [
          userData.id,
          userData.email,
          userData.username,
          userData.passwordHash,
          userData.emailVerified,
          userData.phoneVerified,
          userData.accountStatus,
          userData.createdAt,
          userData.updatedAt
        ];

        const userResult = await this.connection.execute(insertUserQuery, userParams);
        if (!userResult.success) {
          throw new RepositoryError(
            RepositoryErrorCode.INSERT_FAILED,
            'Failed to insert user',
            { userId: user.id, error: userResult.error }
          );
        }

        // Insert profile
        if (userData.profile) {
          await this.insertUserProfile(userData.id, userData.profile);
        }

        // Insert settings
        if (userData.settings) {
          await this.insertUserSettings(userData.id, userData.settings);
        }

        // Insert security data
        if (userData.security) {
          await this.insertUserSecurity(userData.id, userData.security);
        }

        // Insert roles
        if (userData.roles.length > 0) {
          await this.insertUserRoles(userData.id, userData.roles);
        }

        this.setCache(user.id, user);
        return user;
      });
    } catch (error) {
      this.logger.error('Error saving user', error, { userId: user.id });
      if (error instanceof RepositoryError) {
        return Err(error);
      }
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error saving user',
        { userId: user.id, error: error.message }
      ));
    }
  }

  public async update(user: User): Promise<Result<User, RepositoryError>> {
    try {
      const userData = this.mapper.toPersistence(user);

      return await this.withinTransaction(async (txRepo) => {
        // Update main user record
        const updateUserQuery = `
          UPDATE users SET
            email = ?, username = ?, password_hash = ?, email_verified = ?,
            phone_verified = ?, account_status = ?, updated_at = ?
          WHERE id = ?
        `;

        const userParams = [
          userData.email,
          userData.username,
          userData.passwordHash,
          userData.emailVerified,
          userData.phoneVerified,
          userData.accountStatus,
          userData.updatedAt,
          userData.id
        ];

        const userResult = await this.connection.execute(updateUserQuery, userParams);
        if (!userResult.success) {
          throw new RepositoryError(
            RepositoryErrorCode.UPDATE_FAILED,
            'Failed to update user',
            { userId: user.id, error: userResult.error }
          );
        }

        if (userResult.data.changes === 0) {
          throw new RepositoryError(
            RepositoryErrorCode.ENTITY_NOT_FOUND,
            'User not found for update',
            { userId: user.id }
          );
        }

        // Update profile
        await this.updateUserProfile(userData.id, userData.profile);

        // Update settings
        await this.updateUserSettings(userData.id, userData.settings);

        // Update security
        await this.updateUserSecurity(userData.id, userData.security);

        // Update roles
        await this.updateUserRoles(userData.id, userData.roles);

        this.setCache(user.id, user);
        return user;
      });
    } catch (error) {
      this.logger.error('Error updating user', error, { userId: user.id });
      if (error instanceof RepositoryError) {
        return Err(error);
      }
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error updating user',
        { userId: user.id, error: error.message }
      ));
    }
  }

  public async delete(id: UserID): Promise<Result<void, RepositoryError>> {
    try {
      return await this.withinTransaction(async (txRepo) => {
        // Delete in reverse order of dependencies
        await this.deleteUserRoles(id);
        await this.deleteUserSecurity(id);
        await this.deleteUserSettings(id);
        await this.deleteUserProfile(id);

        // Delete main user record
        const deleteQuery = 'DELETE FROM users WHERE id = ?';
        const result = await this.connection.execute(deleteQuery, [id]);

        if (!result.success) {
          throw new RepositoryError(
            RepositoryErrorCode.DELETE_FAILED,
            'Failed to delete user',
            { userId: id, error: result.error }
          );
        }

        if (result.data.changes === 0) {
          throw new RepositoryError(
            RepositoryErrorCode.ENTITY_NOT_FOUND,
            'User not found for deletion',
            { userId: id }
          );
        }

        this.invalidateCache(id);
      });
    } catch (error) {
      this.logger.error('Error deleting user', error, { userId: id });
      if (error instanceof RepositoryError) {
        return Err(error);
      }
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error deleting user',
        { userId: id, error: error.message }
      ));
    }
  }

  // Advanced Query Operations
  public async findAll(options: UserQueryOptions = {}): Promise<Result<PaginatedResult<User>, RepositoryError>> {
    try {
      const query = this.queryBuilder
        .select()
        .from('users')
        .leftJoinProfile()
        .leftJoinSettings()
        .leftJoinSecurity()
        .applyFilters(options.filters)
        .applySorting(options.sort)
        .applyPagination(options.pagination)
        .build();

      const countQuery = this.queryBuilder
        .count()
        .from('users')
        .applyFilters(options.filters)
        .build();

      const [dataResult, countResult] = await Promise.all([
        this.connection.query<UserRow>(query.sql, query.params),
        this.connection.query<{ count: number }>(countQuery.sql, countQuery.params)
      ]);

      if (!dataResult.success || !countResult.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to find users',
          { 
            dataError: dataResult.success ? null : dataResult.error,
            countError: countResult.success ? null : countResult.error
          }
        ));
      }

      const users = dataResult.data.map(row => this.mapper.toDomain(row));
      const total = countResult.data[0].count;

      const pagination = options.pagination || { page: 1, limit: 10 };
      const result: PaginatedResult<User> = {
        data: users,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page * pagination.limit < total,
          hasPrevious: pagination.page > 1
        }
      };

      return Ok(result);
    } catch (error) {
      this.logger.error('Error finding all users', error, { options });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding users',
        { options, error: error.message }
      ));
    }
  }

  public async search(criteria: UserSearchCriteria): Promise<Result<PaginatedResult<User>, RepositoryError>> {
    try {
      const searchQuery = this.queryBuilder
        .select()
        .from('users')
        .leftJoinProfile()
        .leftJoinSettings()
        .leftJoinSecurity()
        .addSearchCriteria(criteria)
        .applySorting(criteria.sort)
        .applyPagination(criteria.pagination)
        .build();

      const countQuery = this.queryBuilder
        .count()
        .from('users')
        .addSearchCriteria(criteria)
        .build();

      const [dataResult, countResult] = await Promise.all([
        this.connection.query<UserRow>(searchQuery.sql, searchQuery.params),
        this.connection.query<{ count: number }>(countQuery.sql, countQuery.params)
      ]);

      if (!dataResult.success || !countResult.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to search users',
          { 
            criteria,
            dataError: dataResult.success ? null : dataResult.error,
            countError: countResult.success ? null : countResult.error
          }
        ));
      }

      const users = dataResult.data.map(row => this.mapper.toDomain(row));
      const total = countResult.data[0].count;

      const pagination = criteria.pagination || { page: 1, limit: 10 };
      const result: PaginatedResult<User> = {
        data: users,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
          hasNext: pagination.page * pagination.limit < total,
          hasPrevious: pagination.page > 1
        }
      };

      return Ok(result);
    } catch (error) {
      this.logger.error('Error searching users', error, { criteria });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error searching users',
        { criteria, error: error.message }
      ));
    }
  }

  // Specialized Queries
  public async existsByEmail(email: Email): Promise<Result<boolean, RepositoryError>> {
    try {
      const query = 'SELECT 1 FROM users WHERE email = ? LIMIT 1';
      const result = await this.connection.query(query, [email]);

      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to check email existence',
          { email, error: result.error }
        ));
      }

      return Ok(result.data.length > 0);
    } catch (error) {
      this.logger.error('Error checking email existence', error, { email });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error checking email existence',
        { email, error: error.message }
      ));
    }
  }

  public async getStatistics(): Promise<Result<UserStatistics, RepositoryError>> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN account_status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= datetime('now', '-30 days') THEN 1 END) as new_users_30d,
          AVG(CASE WHEN last_login_at IS NOT NULL THEN 
            (julianday('now') - julianday(last_login_at)) 
          END) as avg_days_since_login
        FROM users
      `;

      const result = await this.connection.query<UserStatisticsRow>(statsQuery);
      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to get user statistics',
          { error: result.error }
        ));
      }

      const stats: UserStatistics = {
        totalUsers: result.data[0].total_users,
        activeUsers: result.data[0].active_users,
        verifiedUsers: result.data[0].verified_users,
        newUsers30Days: result.data[0].new_users_30d,
        averageDaysSinceLogin: result.data[0].avg_days_since_login
      };

      return Ok(stats);
    } catch (error) {
      this.logger.error('Error getting user statistics', error);
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error getting user statistics',
        { error: error.message }
      ));
    }
  }

  // Cache Management
  private getFromCache(id: UserID): User | null {
    if (!this.cacheConfig.enabled) return null;

    const entry = this.cache.get(id);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(id);
      return null;
    }

    return entry.data;
  }

  private setCache(id: UserID, user: User): void {
    if (!this.cacheConfig.enabled) return;

    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(id, {
      data: user,
      timestamp: Date.now()
    });
  }

  private invalidateCache(id: UserID): void {
    this.cache.delete(id);
  }

  // Helper methods for complex operations
  private async insertUserProfile(userId: UserID, profile: UserProfileData): Promise<void> {
    const query = `
      INSERT INTO user_profiles (
        user_id, display_name, first_name, last_name, bio, avatar_url,
        website, timezone, location_country, location_city, visibility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId, profile.displayName, profile.firstName, profile.lastName,
      profile.bio, profile.avatarUrl, profile.website, profile.timezone,
      profile.locationCountry, profile.locationCity, profile.visibility
    ];

    const result = await this.connection.execute(query, params);
    if (!result.success) {
      throw new RepositoryError(
        RepositoryErrorCode.INSERT_FAILED,
        'Failed to insert user profile',
        { userId, error: result.error }
      );
    }
  }

  private async updateUserProfile(userId: UserID, profile: UserProfileData): Promise<void> {
    const query = `
      UPDATE user_profiles SET
        display_name = ?, first_name = ?, last_name = ?, bio = ?, avatar_url = ?,
        website = ?, timezone = ?, location_country = ?, location_city = ?, visibility = ?
      WHERE user_id = ?
    `;

    const params = [
      profile.displayName, profile.firstName, profile.lastName,
      profile.bio, profile.avatarUrl, profile.website, profile.timezone,
      profile.locationCountry, profile.locationCity, profile.visibility,
      userId
    ];

    const result = await this.connection.execute(query, params);
    if (!result.success) {
      throw new RepositoryError(
        RepositoryErrorCode.UPDATE_FAILED,
        'Failed to update user profile',
        { userId, error: result.error }
      );
    }
  }

  // Additional helper methods would be implemented similarly...
}

// Supporting Classes
export class UserMapper {
  public toDomain(row: UserRow): User {
    // Implementation would map database row to User entity
    // This is a simplified version
    return new User({
      id: row.id as UserID,
      email: row.email as Email,
      username: row.username,
      profile: this.mapProfile(row),
      settings: this.mapSettings(row),
      security: this.mapSecurity(row),
      status: this.mapStatus(row),
      roles: this.mapRoles(row),
      metadata: this.mapMetadata(row),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  public toPersistence(user: User): UserData {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.security.passwordHash,
      emailVerified: user.status.emailVerified,
      phoneVerified: user.status.phoneVerified,
      accountStatus: user.status.accountStatus,
      profile: this.mapProfileToPersistence(user.profile),
      settings: this.mapSettingsToPersistence(user.settings),
      security: this.mapSecurityToPersistence(user.security),
      roles: user.roles,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  private mapProfile(row: UserRow): UserProfile {
    // Implementation details...
  }

  private mapSettings(row: UserRow): UserSettings {
    // Implementation details...
  }

  private mapSecurity(row: UserRow): UserSecurity {
    // Implementation details...
  }

  // Additional mapping methods...
}

export class UserQueryBuilder {
  private selectClause = '';
  private fromClause = '';
  private joinClauses: string[] = [];
  private whereConditions: string[] = [];
  private orderByClause = '';
  private limitClause = '';
  private parameters: any[] = [];

  public select(columns: string = '*'): this {
    this.selectClause = `SELECT ${columns}`;
    return this;
  }

  public count(): this {
    this.selectClause = 'SELECT COUNT(*) as count';
    return this;
  }

  public from(table: string, alias?: string): this {
    this.fromClause = `FROM ${table}${alias ? ` ${alias}` : ''}`;
    return this;
  }

  public leftJoinProfile(): this {
    this.joinClauses.push('LEFT JOIN user_profiles up ON u.id = up.user_id');
    return this;
  }

  public leftJoinSettings(): this {
    this.joinClauses.push('LEFT JOIN user_settings us ON u.id = us.user_id');
    return this;
  }

  public leftJoinSecurity(): this {
    this.joinClauses.push('LEFT JOIN user_security usr ON u.id = usr.user_id');
    return this;
  }

  public where(condition: string): this {
    this.whereConditions.push(condition);
    return this;
  }

  public applyFilters(filters?: UserFilterOptions): this {
    if (!filters) return this;

    if (filters.roles && filters.roles.length > 0) {
      const placeholders = filters.roles.map(() => '?').join(',');
      this.joinClauses.push('JOIN user_roles ur ON u.id = ur.user_id');
      this.whereConditions.push(`ur.role IN (${placeholders})`);
      this.parameters.push(...filters.roles);
    }

    if (filters.status) {
      this.whereConditions.push('u.account_status = ?');
      this.parameters.push(filters.status);
    }

    if (filters.verified !== undefined) {
      this.whereConditions.push('u.email_verified = ?');
      this.parameters.push(filters.verified ? 1 : 0);
    }

    return this;
  }

  public applySorting(sort?: UserSortOptions): this {
    if (!sort) {
      this.orderByClause = 'ORDER BY u.created_at DESC';
      return this;
    }

    const direction = sort.direction === 'asc' ? 'ASC' : 'DESC';
    switch (sort.field) {
      case 'name':
        this.orderByClause = `ORDER BY up.display_name ${direction}`;
        break;
      case 'email':
        this.orderByClause = `ORDER BY u.email ${direction}`;
        break;
      case 'created_at':
        this.orderByClause = `ORDER BY u.created_at ${direction}`;
        break;
      default:
        this.orderByClause = 'ORDER BY u.created_at DESC';
    }

    return this;
  }

  public applyPagination(pagination?: PaginationOptions): this {
    if (!pagination) return this;

    const offset = (pagination.page - 1) * pagination.limit;
    this.limitClause = `LIMIT ${pagination.limit} OFFSET ${offset}`;
    return this;
  }

  public addSearchCriteria(criteria: UserSearchCriteria): this {
    if (criteria.query) {
      this.whereConditions.push(`(
        u.email LIKE ? OR 
        up.display_name LIKE ? OR 
        up.first_name LIKE ? OR 
        up.last_name LIKE ?
      )`);
      const searchTerm = `%${criteria.query}%`;
      this.parameters.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    return this;
  }

  public build(): { sql: string; params: any[] } {
    const clauses = [
      this.selectClause,
      this.fromClause,
      ...this.joinClauses,
      this.whereConditions.length > 0 ? `WHERE ${this.whereConditions.join(' AND ')}` : '',
      this.orderByClause,
      this.limitClause
    ].filter(clause => clause.length > 0);

    return {
      sql: clauses.join(' '),
      params: this.parameters
    };
  }
}

// Supporting Types
interface UserRow {
  id: string;
  email: string;
  username?: string;
  password_hash: string;
  email_verified: number;
  phone_verified: number;
  account_status: string;
  created_at: string;
  updated_at: string;
  // Profile fields
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  timezone?: string;
  location_country?: string;
  location_city?: string;
  visibility?: string;
  // Additional fields...
}

interface UserData {
  id: UserID;
  email: Email;
  username?: string;
  passwordHash: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountStatus: AccountStatus;
  profile: UserProfileData;
  settings: UserSettingsData;
  security: UserSecurityData;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

interface UserProfileData {
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  timezone: string;
  locationCountry?: string;
  locationCity?: string;
  visibility: string;
}

interface UserStatisticsRow {
  total_users: number;
  active_users: number;
  verified_users: number;
  new_users_30d: number;
  avg_days_since_login: number;
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsers30Days: number;
  averageDaysSinceLogin: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000
};

interface UserQueryOptions {
  filters?: UserFilterOptions;
  sort?: UserSortOptions;
  pagination?: PaginationOptions;
}

interface UserFilterOptions {
  roles?: Role[];
  status?: AccountStatus;
  verified?: boolean;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
}

interface UserSortOptions {
  field: 'name' | 'email' | 'created_at' | 'last_login';
  direction: 'asc' | 'desc';
}

interface PaginationOptions {
  page: number;
  limit: number;
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] Repository Pattern・Data Mapper Pattern理解
  - [ ] データベース設計・正規化・インデックス戦略
  - [ ] キャッシュ戦略・パフォーマンス最適化
  - [ ] トランザクション管理・データ整合性
  - [ ] クエリ最適化・N+1問題対策
- [ ] 2. コーディング
  - [ ] IUserRepository Interface実装
    - [ ] 基本CRUD・高度クエリ・専用クエリ定義
    - [ ] バッチ操作・トランザクション・統計メソッド
    - [ ] 型安全性・Result型・エラーハンドリング
  - [ ] UserRepository Implementation実装
    - [ ] 基本CRUD操作・クエリ実行・エラー処理
    - [ ] キャッシュ機能・パフォーマンス最適化
    - [ ] トランザクション・データ整合性保証
  - [ ] UserMapper実装
    - [ ] Domain Entity ↔ Database Row変換
    - [ ] 複雑なマッピング・ネストデータ処理
    - [ ] 型変換・バリデーション・エラー処理
  - [ ] UserQueryBuilder実装
    - [ ] 動的クエリ生成・条件組み立て
    - [ ] JOIN・フィルタ・ソート・ページネーション
    - [ ] SQLインジェクション対策・パラメータバインディング
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全CRUD操作・クエリ・マッピング正常動作
    - [ ] キャッシュ機能・トランザクション・バッチ操作
    - [ ] 複雑クエリ・検索・統計・ページネーション
  - [ ] 異常系テスト
    - [ ] データベース接続エラー・制約違反・重複エラー
    - [ ] トランザクション失敗・ロールバック・データ破損
    - [ ] 大量データ・メモリ不足・タイムアウト
  - [ ] パフォーマンステスト
    - [ ] 大量データ・同時アクセス・スループット
    - [ ] クエリ実行時間・メモリ使用量・キャッシュ効率
    - [ ] N+1問題・インデックス効果・最適化
  - [ ] 統合テスト
    - [ ] データベース連携・他リポジトリ連携
    - [ ] トランザクション統合・データ整合性
- [ ] 4. 単体テスト実行
  - [ ] 全メソッド・クエリ・マッピングテスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] パフォーマンス・メモリリーク確認
  - [ ] データ整合性・制約チェック確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#017): ユーザーリポジトリ実装
  - [ ] データアクセス・永続化・キャッシュ機能
  - [ ] パフォーマンス最適化・クエリ改善
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] Repository品質・パフォーマンス確認
  - [ ] データ整合性・セキュリティ確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] パフォーマンス・負荷テスト完了
  - [ ] データベース・アーキテクチャレビュー完了

## テスト要件
- [ ] 正常系テスト：全CRUD操作・クエリ・マッピング・キャッシュ動作確認
- [ ] 異常系テスト：DB接続エラー・制約違反・トランザクション失敗・データ破損
- [ ] パフォーマンステスト：大量データ・同時アクセス・クエリ実行時間・メモリ効率
- [ ] 統合テスト：データベース連携・他システム連携・トランザクション整合性
- [ ] セキュリティテスト：SQLインジェクション・データ漏洩・アクセス制御
- [ ] 負荷テスト：高負荷・ストレステスト・限界値・復旧テスト

## 完了条件
- [ ] UserRepository・UserMapper・UserQueryBuilder実装完了
- [ ] 全CRUD・高度クエリ・バッチ操作・統計機能実装完了
- [ ] キャッシュ・パフォーマンス最適化・トランザクション実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] パフォーマンステスト・負荷テスト合格
- [ ] データ整合性・セキュリティテスト100%通過
- [ ] TypeScript厳密モード エラー0件
- [ ] Repository Pattern・DDD原則100%準拠

## 関連情報
- **設計書**: `docs/step3/detailed-design/user-repository.md`
- **依存タスク**: TSK-004 (DB接続), TSK-015 (Userエンティティ), TSK-011 (ユーザー型)
- **後続タスク**: TSK-019 (UserService), TSK-022 (認証サービス)
- **パターン**: Repository Pattern, Data Mapper, Query Object
- **データベース**: SQLite, インデックス戦略, クエリ最適化

## 備考
- Repository Pattern厳格準拠・ドメイン分離
- パフォーマンス・スケーラビリティ最優先
- データ整合性・トランザクション安全性重視
- キャッシュ戦略・メモリ効率性考慮
- 将来的なデータベース移行・拡張性対応 
</rewritten_file> 