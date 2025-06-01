# TSK-010-TYP-Api Issue仕様書

## 概要
**タスクID**: TSK-010-TYP-Api  
**ファイル**: src/types/api.ts  
**複雑度**: 中  
**見積時間**: 2.5時間  
**優先度**: 🥇最重要（API型定義・リクエスト/レスポンス）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/api.ts`
- **型定義**: API リクエスト/レスポンス・ページネーション・フィルタ型
- **レイヤー**: Types（型定義層）
- **責任範囲**: HTTP API型・統一レスポンス・エラーレスポンス・メタデータ

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core, TSK-008-TYP-Error
- 参照設計書: `docs/step3/detailed-design/api-types.md`
- 技術スタック: REST API, HTTP, TypeScript, OpenAPI 3.0

### API型システム設計

#### 1. Base API Types
```typescript
import { Result, PaginationParams, PaginatedResult } from './core.js';
import { ErrorResponse, ErrorCode, ErrorMessage } from './error.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ContentType = 
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'text/html'
  | 'application/xml';

export type HttpStatusCode = 
  | 200 // OK
  | 201 // Created
  | 202 // Accepted
  | 204 // No Content
  | 400 // Bad Request
  | 401 // Unauthorized
  | 403 // Forbidden
  | 404 // Not Found
  | 405 // Method Not Allowed
  | 409 // Conflict
  | 422 // Unprocessable Entity
  | 429 // Too Many Requests
  | 500 // Internal Server Error
  | 502 // Bad Gateway
  | 503 // Service Unavailable
  | 504; // Gateway Timeout

export interface ApiRequest {
  path: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  query?: Record<string, unknown>;
  body?: unknown;
  contentType?: ContentType;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = unknown> {
  status: HttpStatusCode;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  requestId?: string;
  timestamp: string;
  version?: string;
}

export interface ApiError {
  status: HttpStatusCode;
  error: ErrorResponse['error'];
  requestId?: string;
  timestamp: string;
}
```

#### 2. Standard Response Wrappers
```typescript
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMetadata;
  links?: ApiLinks;
  included?: unknown[];
}

export interface ErrorResponseWrapper {
  success: false;
  error: {
    code: ErrorCode;
    message: ErrorMessage;
    details?: unknown;
    trace?: string;
  };
  meta?: ResponseMetadata;
}

export type ApiResponseWrapper<T = unknown> = SuccessResponse<T> | ErrorResponseWrapper;

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  executionTime: number; // milliseconds
  rateLimit?: RateLimitMetadata;
  pagination?: PaginationMetadata;
  cache?: CacheMetadata;
}

export interface RateLimitMetadata {
  limit: number;
  remaining: number;
  resetTime: string;
  retryAfter?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CacheMetadata {
  cached: boolean;
  cacheKey?: string;
  ttl?: number;
  lastModified?: string;
  etag?: string;
}

export interface ApiLinks {
  self?: string;
  first?: string;
  last?: string;
  next?: string;
  previous?: string;
  related?: Record<string, string>;
}
```

#### 3. Request/Response Generic Types
```typescript
export interface ListRequest {
  pagination?: PaginationParams;
  sort?: SortParams;
  filter?: FilterParams;
  include?: string[];
  fields?: Record<string, string[]>;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface FilterParams {
  [key: string]: FilterValue | FilterCondition;
}

export type FilterValue = string | number | boolean | Date | null;

export interface FilterCondition {
  operator: FilterOperator;
  value: FilterValue | FilterValue[];
}

export type FilterOperator =
  | 'eq'     // equals
  | 'ne'     // not equals
  | 'gt'     // greater than
  | 'gte'    // greater than or equal
  | 'lt'     // less than
  | 'lte'    // less than or equal
  | 'in'     // in array
  | 'nin'    // not in array
  | 'like'   // contains (case-insensitive)
  | 'ilike'  // contains (case-insensitive)
  | 'regex'  // regex match
  | 'exists' // field exists
  | 'null'   // is null
  | 'range'; // between values

export interface CreateRequest<T> {
  data: T;
  options?: CreateOptions;
}

export interface UpdateRequest<T> {
  data: Partial<T>;
  options?: UpdateOptions;
}

export interface DeleteRequest {
  options?: DeleteOptions;
}

export interface CreateOptions {
  validate?: boolean;
  dryRun?: boolean;
  returnResource?: boolean;
}

export interface UpdateOptions {
  validate?: boolean;
  dryRun?: boolean;
  returnResource?: boolean;
  allowPartial?: boolean;
  conflictResolution?: 'error' | 'merge' | 'replace';
}

export interface DeleteOptions {
  soft?: boolean;
  cascade?: boolean;
  returnResource?: boolean;
}

export interface BulkRequest<T> {
  operations: BulkOperation<T>[];
  options?: BulkOptions;
}

export interface BulkOperation<T> {
  operation: 'create' | 'update' | 'delete';
  id?: string;
  data?: T | Partial<T>;
}

export interface BulkOptions {
  atomic?: boolean;
  continueOnError?: boolean;
  maxOperations?: number;
  batchSize?: number;
}

export interface BulkResponse<T> {
  results: BulkOperationResult<T>[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    errors: BulkError[];
  };
}

export interface BulkOperationResult<T> {
  operation: BulkOperation<T>;
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: ErrorMessage;
  };
}

export interface BulkError {
  index: number;
  operation: BulkOperation<unknown>;
  error: {
    code: ErrorCode;
    message: ErrorMessage;
  };
}
```

#### 4. Resource-Specific Types
```typescript
export interface ResourceResponse<T> {
  data: T;
  meta: {
    id: string;
    type: string;
    version?: number;
    createdAt: string;
    updatedAt: string;
    etag?: string;
  };
  relationships?: Record<string, ResourceRelationship>;
}

export interface ResourceRelationship {
  data: ResourceIdentifier | ResourceIdentifier[] | null;
  links?: {
    self?: string;
    related?: string;
  };
  meta?: Record<string, unknown>;
}

export interface ResourceIdentifier {
  id: string;
  type: string;
}

export interface CollectionResponse<T> {
  data: T[];
  meta: PaginationMetadata & {
    total: number;
    filtered: number;
  };
  links: ApiLinks;
}

export interface SearchRequest {
  query: string;
  filters?: FilterParams;
  pagination?: PaginationParams;
  sort?: SortParams;
  fields?: string[];
  highlight?: boolean;
  facets?: string[];
}

export interface SearchResponse<T> {
  data: SearchResult<T>[];
  meta: {
    query: string;
    total: number;
    maxScore: number;
    executionTime: number;
    facets?: SearchFacet[];
  };
  pagination: PaginationMetadata;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
  explanation?: SearchExplanation;
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface SearchExplanation {
  value: number;
  description: string;
  details?: SearchExplanation[];
}
```

#### 5. Upload/Download Types
```typescript
export interface FileUploadRequest {
  file: File | Buffer;
  filename: string;
  contentType: string;
  metadata?: Record<string, unknown>;
  options?: FileUploadOptions;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  encryption?: boolean;
  compression?: boolean;
  thumbnail?: boolean;
  virusScan?: boolean;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  contentType: string;
  url: string;
  thumbnailUrl?: string;
  metadata: {
    uploadedAt: string;
    checksum: string;
    encrypted: boolean;
    compressed: boolean;
  };
}

export interface FileDownloadRequest {
  id: string;
  options?: FileDownloadOptions;
}

export interface FileDownloadOptions {
  version?: string;
  format?: string;
  quality?: 'low' | 'medium' | 'high' | 'original';
  resize?: {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'fill';
  };
}

export interface FileDownloadResponse {
  stream: ReadableStream;
  filename: string;
  contentType: string;
  size: number;
  lastModified?: string;
  etag?: string;
}
```

#### 6. Health Check & Status Types
```typescript
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  time?: string;
  output?: string;
  details?: Record<string, unknown>;
}

export interface StatusResponse {
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  stats: {
    totalRequests: number;
    activeRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
  dependencies: DependencyStatus[];
}

export interface DependencyStatus {
  name: string;
  status: 'available' | 'unavailable' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  version?: string;
}

export interface ApiInfo {
  name: string;
  description: string;
  version: string;
  documentation: string;
  endpoints: EndpointInfo[];
  authentication: {
    type: 'bearer' | 'apiKey' | 'oauth2';
    description: string;
  };
  rateLimit: {
    requests: number;
    window: string;
    description: string;
  };
}

export interface EndpointInfo {
  path: string;
  method: HttpMethod;
  summary: string;
  description?: string;
  parameters?: ParameterInfo[];
  responses: Record<string, ResponseInfo>;
  security?: string[];
  tags?: string[];
}

export interface ParameterInfo {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description?: string;
  example?: unknown;
}

export interface ResponseInfo {
  description: string;
  contentType: string;
  schema?: string;
  example?: unknown;
}
```

#### 7. Webhook & Event Types
```typescript
export interface WebhookEvent {
  id: string;
  type: string;
  source: string;
  timestamp: string;
  data: unknown;
  signature?: string;
  delivery: {
    attempt: number;
    maxAttempts: number;
    nextRetry?: string;
  };
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  filters?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout: number;
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    maxDelay: number;
  };
  createdAt: string;
  lastDelivery?: {
    timestamp: string;
    status: number;
    duration: number;
  };
}

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  eventId: string;
  url: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  attempt: number;
  deliveredAt?: string;
  duration?: number;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] REST API設計原則・OpenAPI 3.0仕様理解
  - [ ] HTTPステータスコード・レスポンス形式統一
  - [ ] ページネーション・フィルタリング・ソート戦略
  - [ ] エラーハンドリング・レート制限・セキュリティ要件
  - [ ] API versioning・backward compatibility考慮
- [ ] 2. コーディング
  - [ ] Base API Types実装
    - [ ] HttpMethod・ContentType・StatusCode定義
    - [ ] ApiRequest・ApiResponse・ApiError型
    - [ ] ブランド型活用・型安全性確保
  - [ ] Standard Response Wrappers実装
    - [ ] SuccessResponse・ErrorResponse統一形式
    - [ ] Metadata・Links・Pagination型
    - [ ] キャッシュ・レート制限メタデータ
  - [ ] Generic Request/Response Types実装
    - [ ] List・Create・Update・Delete・Bulk操作型
    - [ ] Filter・Sort・Search・Pagination型
    - [ ] 型安全性・再利用性・拡張性考慮
  - [ ] Resource & Specialized Types実装
    - [ ] Resource・Collection・Upload・Health型
    - [ ] Webhook・Event・Subscription型
    - [ ] API documentation・info型
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全API型の生成・変換・シリアライズ
    - [ ] ページネーション・フィルタ・ソート動作
    - [ ] レスポンス形式・メタデータ整合性
  - [ ] 異常系テスト
    - [ ] 不正データ・型違反・境界値
    - [ ] 大量データ・メモリ不足・タイムアウト
    - [ ] ネットワークエラー・サーバーエラー
  - [ ] 統合テスト
    - [ ] 実際のAPI呼び出し・E2Eテスト
    - [ ] OpenAPI仕様との整合性
    - [ ] 他システム連携・互換性確認
- [ ] 4. 単体テスト実行
  - [ ] 全型定義・ユーティリティテスト
  - [ ] カバレッジ90%以上達成確認
  - [ ] 型安全性・制約チェック
  - [ ] パフォーマンス・メモリ使用量確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#010): API型定義システム実装
  - [ ] OpenAPI仕様・ドキュメント生成対応
  - [ ] 使用例・ガイド・ベストプラクティス
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] API設計品質・一貫性確認
  - [ ] ドキュメント・仕様書整合性確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] API仕様レビュー・承認完了
  - [ ] フロントエンド・クライアント連携確認

## テスト要件
- [ ] 正常系テスト：全API型生成・変換・レスポンス形式確認
- [ ] 異常系テスト：不正データ・型違反・境界値・エラーハンドリング
- [ ] 統合テスト：実際のAPI実装・OpenAPI仕様・E2Eテスト
- [ ] パフォーマンステスト：大量データ・同時リクエスト・メモリ使用量
- [ ] 互換性テスト：バージョン互換性・クライアント対応・後方互換性

## 完了条件
- [ ] 全API型定義・レスポンス形式実装完了
- [ ] ページネーション・フィルタ・ソート型実装完了
- [ ] エラーハンドリング・メタデータ型実装完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] OpenAPI 3.0仕様準拠・自動生成対応
- [ ] TypeScript厳密モード エラー0件
- [ ] API設計レビュー・品質チェック合格

## 関連情報
- **設計書**: `docs/step3/detailed-design/api-types.md`
- **依存タスク**: TSK-007 (コア型), TSK-008 (エラー型)
- **後続タスク**: TSK-024 (Controller実装)
- **API仕様**: REST API, OpenAPI 3.0, JSON API
- **HTTP仕様**: RFC 7231, RFC 6585, RFC 7807

## 備考
- RESTful API設計原則・ベストプラクティス準拠
- OpenAPI 3.0仕様完全対応・自動ドキュメント生成
- 型安全性・開発者体験・保守性最優先
- 将来的なAPI進化・バージョニング・拡張性考慮
- クライアント開発効率・デバッグ支援重視 