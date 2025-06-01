# TSK-011-TYP-User Issue仕様書

## 概要
**タスクID**: TSK-011-TYP-User  
**ファイル**: src/types/user.ts  
**複雑度**: 中  
**見積時間**: 3時間  
**優先度**: 🥇最重要（ユーザー型定義・プロファイル管理）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/user.ts`
- **型定義**: ユーザー・プロファイル・設定・アカウント関連型
- **レイヤー**: Types（型定義層）
- **責任範囲**: ユーザー情報構造・プロファイル・設定・認証関連型

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core, TSK-008-TYP-Error, TSK-009-TYP-Auth
- 参照設計書: `docs/step3/detailed-design/user-types.md`
- 技術スタック: TypeScript, User Management, Profile System

### ユーザー型システム設計

#### 1. Core User Types
```typescript
import { Brand, UserID, Timestamp, Email } from './core.js';
import { Role, Permission, SecuritySettings, UserPreferences } from './auth.js';
import { ErrorCode, ErrorMessage } from './error.js';

export type UserName = Brand<string, 'UserName'>;
export type DisplayName = Brand<string, 'DisplayName'>;
export type FirstName = Brand<string, 'FirstName'>;
export type LastName = Brand<string, 'LastName'>;
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type Address = Brand<string, 'Address'>;
export type Bio = Brand<string, 'Bio'>;
export type Website = Brand<string, 'Website'>;
export type AvatarUrl = Brand<string, 'AvatarUrl'>;

export interface User {
  id: UserID;
  email: Email;
  username?: UserName;
  profile: UserProfile;
  settings: UserSettings;
  security: UserSecurity;
  metadata: UserMetadata;
  status: UserStatus;
  roles: Role[];
  permissions: Permission[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  displayName: DisplayName;
  firstName?: FirstName;
  lastName?: LastName;
  bio?: Bio;
  avatar?: AvatarUrl;
  website?: Website;
  location?: UserLocation;
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
  demographics?: Demographics;
  visibility: ProfileVisibility;
}

export interface UserLocation {
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  custom?: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
}

export interface ContactInfo {
  phone?: PhoneNumber;
  alternateEmail?: Email;
  address?: Address;
  emergencyContact?: EmergencyContact;
  preferredContactMethod: ContactMethod;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: PhoneNumber;
  email?: Email;
}

export type ContactMethod = 'email' | 'phone' | 'sms' | 'push' | 'none';

export interface Demographics {
  birthDate?: string; // ISO 8601 date
  gender?: Gender;
  language: string; // ISO 639-1
  occupation?: string;
  company?: string;
  education?: EducationLevel;
}

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type EducationLevel = 'high_school' | 'bachelor' | 'master' | 'phd' | 'other';

export type ProfileVisibility = 'public' | 'private' | 'friends' | 'limited';
```

#### 2. User Settings & Preferences
```typescript
export interface UserSettings {
  preferences: UserPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  push: PushNotificationSettings;
  sms: SmsNotificationSettings;
  inApp: InAppNotificationSettings;
  digest: DigestSettings;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  frequency: NotificationFrequency;
  types: {
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    security: boolean;
    marketing: boolean;
    system: boolean;
  };
  unsubscribeToken?: string;
}

export interface PushNotificationSettings {
  enabled: boolean;
  deviceTokens: PushDeviceToken[];
  quietHours?: {
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
  types: {
    taskUpdates: boolean;
    mentions: boolean;
    deadlines: boolean;
    emergency: boolean;
  };
}

export interface PushDeviceToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceInfo: {
    name?: string;
    model?: string;
    os?: string;
    browser?: string;
  };
  registeredAt: Timestamp;
  lastUsed?: Timestamp;
  active: boolean;
}

export interface SmsNotificationSettings {
  enabled: boolean;
  phoneNumber?: PhoneNumber;
  verified: boolean;
  types: {
    security: boolean;
    urgent: boolean;
    verification: boolean;
  };
}

export interface InAppNotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  types: {
    taskUpdates: boolean;
    mentions: boolean;
    system: boolean;
  };
}

export interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  day?: number; // 1-7 for weekly, 1-31 for monthly
  time: string; // HH:mm format
  timezone: string;
  includeStats: boolean;
}

export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowDirectMessages: 'everyone' | 'friends' | 'none';
  searchable: boolean;
  dataCollection: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
    thirdParty: boolean;
  };
  shareUsageData: boolean;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  animations: 'full' | 'reduced' | 'none';
  colorScheme: 'light' | 'dark' | 'auto' | 'high-contrast';
  keyboardNavigation: boolean;
  voiceControl: boolean;
  autoplay: boolean;
}

export interface IntegrationSettings {
  calendar: CalendarIntegration[];
  thirdPartyApps: ThirdPartyApp[];
  webhooks: WebhookIntegration[];
  apiAccess: ApiAccessSettings;
}

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'apple' | 'caldav';
  accountEmail: Email;
  calendarId?: string;
  syncTasks: boolean;
  syncDeadlines: boolean;
  reminderOffset: number; // minutes
  enabled: boolean;
  lastSync?: Timestamp;
}

export interface ThirdPartyApp {
  id: string;
  name: string;
  provider: string;
  scopes: string[];
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Timestamp;
  enabled: boolean;
  connectedAt: Timestamp;
  lastUsed?: Timestamp;
}

export interface WebhookIntegration {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  active: boolean;
  createdAt: Timestamp;
  lastTriggered?: Timestamp;
}

export interface ApiAccessSettings {
  enabled: boolean;
  keys: ApiKeyInfo[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  ipWhitelist?: string[];
  allowedOrigins?: string[];
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPreview: string; // First 8 characters
  permissions: Permission[];
  createdAt: Timestamp;
  lastUsed?: Timestamp;
  expiresAt?: Timestamp;
  active: boolean;
}
```

#### 3. User Security & Authentication
```typescript
export interface UserSecurity {
  authentication: AuthenticationSecurity;
  sessions: SessionSecurity;
  devices: DeviceSecurity;
  audit: SecurityAudit;
}

export interface AuthenticationSecurity {
  passwordLastChanged: Timestamp;
  passwordExpiresAt?: Timestamp;
  requirePasswordChange: boolean;
  twoFactorAuth: TwoFactorAuthSettings;
  backupCodes: BackupCode[];
  loginAttempts: LoginAttemptInfo;
  accountLocked: boolean;
  lockedUntil?: Timestamp;
  lockReason?: string;
}

export interface TwoFactorAuthSettings {
  enabled: boolean;
  method: TwoFactorMethod[];
  backupMethod?: TwoFactorMethod;
  setupAt?: Timestamp;
  lastUsed?: Timestamp;
  trustedDevices: TrustedDevice[];
}

export type TwoFactorMethod = 'totp' | 'sms' | 'email' | 'hardware_key' | 'biometric';

export interface BackupCode {
  code: string; // Encrypted
  used: boolean;
  usedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface LoginAttemptInfo {
  successful: number;
  failed: number;
  lastSuccess?: Timestamp;
  lastFailure?: Timestamp;
  recentFailures: number; // Last 24 hours
  consecutiveFailures: number;
}

export interface TrustedDevice {
  id: string;
  fingerprint: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  userAgent: string;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
  trustedAt: Timestamp;
  lastSeen: Timestamp;
  active: boolean;
}

export interface SessionSecurity {
  activeSessions: number;
  maxConcurrentSessions: number;
  sessionTimeout: number; // minutes
  rememberMeEnabled: boolean;
  forceLogoutAt?: Timestamp;
  lastPasswordAuth?: Timestamp;
}

export interface DeviceSecurity {
  registeredDevices: RegisteredDevice[];
  maxDevices: number;
  requireDeviceVerification: boolean;
  deviceLockEnabled: boolean;
}

export interface RegisteredDevice {
  id: string;
  name: string;
  fingerprint: string;
  deviceType: string;
  platform: string;
  registeredAt: Timestamp;
  lastUsed: Timestamp;
  verified: boolean;
  active: boolean;
}

export interface SecurityAudit {
  lastSecurityReview?: Timestamp;
  securityScore: number; // 0-100
  vulnerabilities: SecurityVulnerability[];
  recommendations: SecurityRecommendation[];
}

export interface SecurityVulnerability {
  type: VulnerabilityType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
}

export type VulnerabilityType =
  | 'weak_password'
  | 'no_2fa'
  | 'suspicious_login'
  | 'compromised_device'
  | 'unusual_activity'
  | 'outdated_session'
  | 'insecure_connection';

export interface SecurityRecommendation {
  type: 'password' | '2fa' | 'device' | 'session' | 'privacy';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionUrl?: string;
  dismissible: boolean;
  createdAt: Timestamp;
  dismissed?: boolean;
  dismissedAt?: Timestamp;
}
```

#### 4. User Status & Metadata
```typescript
export interface UserStatus {
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileComplete: boolean;
  onboardingComplete: boolean;
  subscription: SubscriptionInfo;
  limits: UserLimits;
}

export type AccountStatus = 
  | 'active'
  | 'pending_verification'
  | 'suspended'
  | 'deactivated'
  | 'deleted'
  | 'banned';

export interface SubscriptionInfo {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Timestamp;
  endDate?: Timestamp;
  autoRenew: boolean;
  paymentMethod?: PaymentMethod;
  features: string[];
  usage: UsageInfo;
}

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'other';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  default: boolean;
}

export interface UsageInfo {
  tasksCreated: number;
  storageUsed: number; // bytes
  apiCalls: number;
  collaborators: number;
  resetDate: Timestamp; // Monthly reset
}

export interface UserLimits {
  maxTasks: number;
  maxStorage: number; // bytes
  maxApiCalls: number;
  maxCollaborators: number;
  canCreateTeams: boolean;
  canUseIntegrations: boolean;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

export interface UserMetadata {
  source: RegistrationSource;
  referrer?: UserID;
  inviteCode?: string;
  firstLogin?: Timestamp;
  lastLogin?: Timestamp;
  loginCount: number;
  tags: string[];
  notes?: string;
  customFields: Record<string, unknown>;
  flags: UserFlag[];
}

export type RegistrationSource = 
  | 'direct'
  | 'invite'
  | 'google'
  | 'microsoft'
  | 'github'
  | 'linkedin'
  | 'import'
  | 'api';

export interface UserFlag {
  name: string;
  value: boolean;
  setAt: Timestamp;
  setBy: UserID | 'system';
  expiresAt?: Timestamp;
  reason?: string;
}
```

#### 5. User Request/Response Types
```typescript
export interface CreateUserRequest {
  email: Email;
  password: string;
  profile: {
    displayName: DisplayName;
    firstName?: FirstName;
    lastName?: LastName;
  };
  acceptTerms: boolean;
  inviteCode?: string;
  source?: RegistrationSource;
}

export interface UpdateUserRequest {
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
  preferences?: Partial<UserPreferences>;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  logoutOtherSessions?: boolean;
}

export interface UpdateEmailRequest {
  newEmail: Email;
  password: string;
}

export interface DeactivateUserRequest {
  reason: string;
  password: string;
  deleteData?: boolean;
  transferDataTo?: UserID;
}

export interface UserSearchRequest {
  query?: string;
  filters?: {
    roles?: Role[];
    status?: AccountStatus[];
    verified?: boolean;
    lastLoginAfter?: Timestamp;
    lastLoginBefore?: Timestamp;
  };
  sort?: {
    field: 'name' | 'email' | 'createdAt' | 'lastLogin';
    direction: 'asc' | 'desc';
  };
}

export interface UserListResponse {
  users: UserSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface UserSummary {
  id: UserID;
  email: Email;
  displayName: DisplayName;
  avatar?: AvatarUrl;
  roles: Role[];
  status: AccountStatus;
  lastLogin?: Timestamp;
  createdAt: Timestamp;
}

export interface UserDetailResponse extends User {
  stats: UserStats;
  activity: RecentActivity[];
}

export interface UserStats {
  tasksTotal: number;
  tasksCompleted: number;
  tasksOverdue: number;
  collaborations: number;
  loginStreak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Timestamp;
  progress?: {
    current: number;
    total: number;
  };
}

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}

export type ActivityType =
  | 'login'
  | 'task_created'
  | 'task_completed'
  | 'profile_updated'
  | 'settings_changed'
  | 'password_changed'
  | 'device_added'
  | 'integration_connected';
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] ユーザー管理要件・プロファイル仕様理解
  - [ ] プライバシー・セキュリティ・GDPR要件
  - [ ] 設定・通知・アクセシビリティ要件
  - [ ] サブスクリプション・制限・使用量管理
  - [ ] 国際化・多言語・タイムゾーン対応
- [ ] 2. コーディング
  - [ ] Core User Types実装
    - [ ] User・UserProfile・UserLocation型
    - [ ] SocialLinks・ContactInfo・Demographics型
    - [ ] ブランド型活用・バリデーション考慮
  - [ ] Settings & Preferences実装
    - [ ] NotificationSettings・PrivacySettings型
    - [ ] AccessibilitySettings・IntegrationSettings型
    - [ ] きめ細かい設定・ユーザビリティ考慮
  - [ ] Security & Authentication実装
    - [ ] UserSecurity・TwoFactorAuth・SessionSecurity型
    - [ ] DeviceSecurity・SecurityAudit・Vulnerability型
    - [ ] セキュリティベストプラクティス準拠
  - [ ] Status & Metadata実装
    - [ ] UserStatus・SubscriptionInfo・UserLimits型
    - [ ] UserMetadata・UserFlag・Achievement型
    - [ ] 拡張性・カスタマイゼーション対応
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全ユーザー型の生成・変換・バリデーション
    - [ ] 設定・プリファレンス・セキュリティ機能
    - [ ] プロファイル管理・メタデータ操作
  - [ ] 異常系テスト
    - [ ] 不正データ・制約違反・境界値
    - [ ] プライバシー設定・セキュリティ制約
    - [ ] 大量ユーザー・パフォーマンス限界
  - [ ] セキュリティテスト
    - [ ] 個人情報保護・データ漏洩防止
    - [ ] プライバシー設定・アクセス制御
    - [ ] GDPR・データ保護法準拠
  - [ ] ユーザビリティテスト
    - [ ] 設定画面・プロファイル編集UX
    - [ ] アクセシビリティ・国際化対応
- [ ] 4. 単体テスト実行
  - [ ] 全ユーザー型・設定型テスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] プライバシー・セキュリティテスト
  - [ ] パフォーマンス・メモリ使用量確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#011): ユーザー型システム実装
  - [ ] プライバシー・セキュリティ機能強化
  - [ ] ドキュメント・設定ガイド更新
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] プライバシー・セキュリティ基準確認
  - [ ] ユーザビリティ・アクセシビリティ確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] プライバシー監査・GDPR準拠確認
  - [ ] ユーザー体験・品質テスト完了

## テスト要件
- [ ] 正常系テスト：全ユーザー型生成・プロファイル管理・設定操作確認
- [ ] 異常系テスト：不正データ・制約違反・プライバシー設定・セキュリティ制約
- [ ] セキュリティテスト：個人情報保護・アクセス制御・データ漏洩防止
- [ ] プライバシーテスト：GDPR準拠・データ処理・同意管理・削除権利
- [ ] ユーザビリティテスト：設定UX・プロファイル編集・アクセシビリティ
- [ ] 国際化テスト：多言語・タイムゾーン・文字エンコーディング

## 完了条件
- [ ] 全ユーザー型・プロファイル・設定型実装完了
- [ ] セキュリティ・プライバシー・監査型実装完了
- [ ] サブスクリプション・制限・メタデータ型実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] プライバシーテスト・GDPR準拠100%
- [ ] アクセシビリティ・国際化対応完了
- [ ] TypeScript厳密モード エラー0件
- [ ] セキュリティ・プライバシー監査合格

## 関連情報
- **設計書**: `docs/step3/detailed-design/user-types.md`
- **依存タスク**: TSK-007 (コア型), TSK-008 (エラー型), TSK-009 (認証型)
- **後続タスク**: TSK-015 (Userエンティティ), TSK-022 (UserService)
- **プライバシー**: GDPR, CCPA, データ保護法
- **セキュリティ**: OWASP, 個人情報保護, アクセス制御
- **アクセシビリティ**: WCAG 2.1, Section 508

## 備考
- プライバシーファースト・GDPR完全準拠
- ユーザー体験・アクセシビリティ最優先
- セキュリティ・個人情報保護徹底
- 国際化・多様性・インクルーシブ設計
- 継続的なプライバシー・セキュリティ監査 