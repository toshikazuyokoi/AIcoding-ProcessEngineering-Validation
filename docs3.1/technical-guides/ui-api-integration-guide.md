# UI-API統合ガイド

**バージョン**: 3.1.0  
**作成日**: 2025-07-08  
**理論分類**: 技術ガイド層  
**文書種別**: UI-API統合・エラーハンドリング・状態同期ガイド  
**改善レベル**: 実証実験問題根本解決版  

## 1. UI-API統合ガイド概要

### 1.1 ガイド定義
UI-API統合ガイドは、プロセスエンジニアリング理論ver3.1における**UI層とAPI層の統合を体系化し、実証実験で発見されたUI-API統合問題を根本解決**する包括的統合ガイドである。

### 1.2 実証実験で発見されたUI-API統合問題
```yaml
ui_api_integration_problems:
  interface_mismatch_errors:
    problem: "UI-APIインターフェース不整合"
    manifestation: "認証APIレスポンス形式の不一致"
    root_cause: "設計文書とバックエンド実装の乖離"
    impact: "E2E認証テスト全18テスト失敗"
    specific_example: "tokens オブジェクト vs 直接フィールド形式"
    
  error_handling_inconsistency:
    problem: "エラーハンドリングの不統一"
    manifestation: "API エラーレスポンスの処理方式不一致"
    root_cause: "統一的なエラーハンドリング戦略不在"
    impact: "ユーザー体験の不一致・デバッグ困難"
    
  state_synchronization_issues:
    problem: "状態同期の問題"
    manifestation: "UI状態とサーバー状態の不整合"
    root_cause: "状態同期戦略の体系化不足"
    impact: "データ整合性問題・ユーザー混乱"
    
  loading_state_management_problems:
    problem: "ローディング状態管理の問題"
    manifestation: "非同期処理中のUI状態不明確"
    root_cause: "ローディング状態設計の標準化不足"
    impact: "UX品質低下・操作性問題"
```

## 2. API統合アーキテクチャ

### 2.1 統合アーキテクチャ設計
```yaml
integration_architecture_design:
  layer_separation:
    presentation_layer:
      responsibility: "UI表示・ユーザーインタラクション"
      components: ["React Components", "Vue Components", "Angular Components"]
      state_management: ["Local State", "Component State"]
      
    integration_layer:
      responsibility: "API統合・データ変換・エラーハンドリング"
      components: ["API Clients", "Data Adapters", "Error Handlers"]
      state_management: ["Global State", "Cache State"]
      
    api_layer:
      responsibility: "HTTP通信・認証・レスポンス処理"
      components: ["HTTP Client", "Auth Manager", "Response Parser"]
      state_management: ["Request State", "Auth State"]
      
  data_flow_design:
    request_flow:
      step1: "UI Action Trigger"
      step2: "Integration Layer Processing"
      step3: "API Layer HTTP Request"
      step4: "Server Processing"
      step5: "Response Processing"
      step6: "State Update"
      step7: "UI Re-render"
      
    error_flow:
      step1: "Error Detection"
      step2: "Error Classification"
      step3: "Error Transformation"
      step4: "Error State Update"
      step5: "Error UI Display"
      
  state_management_design:
    local_state: "コンポーネント固有の一時的状態"
    global_state: "アプリケーション全体で共有する状態"
    server_state: "サーバーから取得したデータの状態"
    cache_state: "パフォーマンス向上のためのキャッシュ状態"
```

### 2.2 API クライアント設計
```yaml
api_client_design:
  base_client_structure:
    configuration:
      base_url: "string"
      timeout: "number"
      retry_policy: "object"
      auth_strategy: "object"
      
    request_interceptors:
      - name: "auth_interceptor"
        purpose: "認証トークン自動付与"
        implementation: "Authorization ヘッダー設定"
        
      - name: "request_logging"
        purpose: "リクエストログ記録"
        implementation: "リクエスト詳細のログ出力"
        
    response_interceptors:
      - name: "response_transformer"
        purpose: "レスポンス形式統一"
        implementation: "統一レスポンス形式への変換"
        
      - name: "error_handler"
        purpose: "エラーレスポンス処理"
        implementation: "エラー分類・変換・通知"
        
  typed_api_client:
    implementation_example: |
      interface ApiResponse<T> {
        data: T;
        status: number;
        message: string;
        errors?: string[];
      }
      
      class TypedApiClient {
        private httpClient: AxiosInstance;
        
        constructor(config: ApiConfig) {
          this.httpClient = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
          });
          
          this.setupInterceptors();
        }
        
        async get<T>(url: string): Promise<ApiResponse<T>> {
          try {
            const response = await this.httpClient.get<T>(url);
            return this.transformResponse(response);
          } catch (error) {
            throw this.transformError(error);
          }
        }
        
        async post<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
          try {
            const response = await this.httpClient.post<T>(url, data);
            return this.transformResponse(response);
          } catch (error) {
            throw this.transformError(error);
          }
        }
        
        private transformResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
          return {
            data: response.data,
            status: response.status,
            message: 'Success'
          };
        }
        
        private transformError(error: AxiosError): ApiError {
          return new ApiError(
            error.response?.status || 500,
            error.response?.data?.message || 'Unknown error',
            error.response?.data?.errors || []
          );
        }
      }
```

## 3. エラーハンドリング戦略

### 3.1 エラー分類システム
```yaml
error_classification_system:
  network_errors:
    error_types:
      - "connection_timeout"
      - "network_unreachable"
      - "dns_resolution_failed"
    handling_strategy: "自動再試行 + ユーザー通知"
    user_message: "ネットワーク接続を確認してください"
    
  authentication_errors:
    error_types:
      - "invalid_credentials"
      - "token_expired"
      - "insufficient_permissions"
    handling_strategy: "認証フロー誘導"
    user_message: "再度ログインしてください"
    
  validation_errors:
    error_types:
      - "invalid_input_format"
      - "required_field_missing"
      - "business_rule_violation"
    handling_strategy: "フィールド固有エラー表示"
    user_message: "入力内容を確認してください"
    
  server_errors:
    error_types:
      - "internal_server_error"
      - "service_unavailable"
      - "database_error"
    handling_strategy: "エラー報告 + 代替案提示"
    user_message: "一時的な問題が発生しています"
    
  client_errors:
    error_types:
      - "resource_not_found"
      - "method_not_allowed"
      - "rate_limit_exceeded"
    handling_strategy: "適切な代替アクション提示"
    user_message: "操作を確認してください"
```

### 3.2 統一エラーハンドリング実装
```yaml
unified_error_handling:
  error_handler_implementation: |
    interface ApiError {
      code: string;
      message: string;
      details?: any;
      timestamp: Date;
      requestId?: string;
    }
    
    class ErrorHandler {
      static handle(error: any): ApiError {
        if (error.response) {
          // サーバーエラーレスポンス
          return this.handleServerError(error.response);
        } else if (error.request) {
          // ネットワークエラー
          return this.handleNetworkError(error.request);
        } else {
          // クライアントエラー
          return this.handleClientError(error);
        }
      }
      
      private static handleServerError(response: any): ApiError {
        const status = response.status;
        const data = response.data;
        
        switch (status) {
          case 400:
            return new ApiError('VALIDATION_ERROR', data.message, data.errors);
          case 401:
            return new ApiError('AUTHENTICATION_ERROR', 'Authentication required');
          case 403:
            return new ApiError('AUTHORIZATION_ERROR', 'Insufficient permissions');
          case 404:
            return new ApiError('NOT_FOUND_ERROR', 'Resource not found');
          case 500:
            return new ApiError('SERVER_ERROR', 'Internal server error');
          default:
            return new ApiError('UNKNOWN_ERROR', 'Unknown server error');
        }
      }
      
      private static handleNetworkError(request: any): ApiError {
        return new ApiError('NETWORK_ERROR', 'Network connection failed');
      }
      
      private static handleClientError(error: any): ApiError {
        return new ApiError('CLIENT_ERROR', error.message || 'Client error');
      }
    }
    
  error_display_strategy: |
    interface ErrorDisplayConfig {
      type: 'toast' | 'inline' | 'modal' | 'banner';
      duration?: number;
      dismissible?: boolean;
      actions?: ErrorAction[];
    }
    
    class ErrorDisplayManager {
      static display(error: ApiError, config: ErrorDisplayConfig) {
        switch (config.type) {
          case 'toast':
            this.showToast(error, config);
            break;
          case 'inline':
            this.showInlineError(error, config);
            break;
          case 'modal':
            this.showModal(error, config);
            break;
          case 'banner':
            this.showBanner(error, config);
            break;
        }
      }
      
      private static showToast(error: ApiError, config: ErrorDisplayConfig) {
        // トースト通知の実装
      }
      
      private static showInlineError(error: ApiError, config: ErrorDisplayConfig) {
        // インラインエラーの実装
      }
    }
```

## 4. 状態同期戦略

### 4.1 状態同期パターン
```yaml
state_synchronization_patterns:
  optimistic_updates:
    description: "楽観的更新パターン"
    use_case: "ユーザー体験重視の操作"
    implementation: |
      const optimisticUpdate = async (updateData) => {
        // 1. UI状態を即座に更新
        setLocalState(updateData);
        
        try {
          // 2. サーバーに更新リクエスト
          const result = await api.update(updateData);
          
          // 3. サーバーレスポンスで状態確定
          setLocalState(result.data);
        } catch (error) {
          // 4. エラー時は元の状態に戻す
          setLocalState(previousState);
          handleError(error);
        }
      };
      
  pessimistic_updates:
    description: "悲観的更新パターン"
    use_case: "データ整合性重視の操作"
    implementation: |
      const pessimisticUpdate = async (updateData) => {
        // 1. ローディング状態設定
        setLoading(true);
        
        try {
          // 2. サーバーに更新リクエスト
          const result = await api.update(updateData);
          
          // 3. 成功時のみUI状態更新
          setLocalState(result.data);
        } catch (error) {
          // 4. エラーハンドリング
          handleError(error);
        } finally {
          // 5. ローディング状態解除
          setLoading(false);
        }
      };
      
  cache_invalidation:
    description: "キャッシュ無効化パターン"
    use_case: "データ更新後の整合性確保"
    implementation: |
      const invalidateCache = async (updateData) => {
        try {
          // 1. サーバー更新
          await api.update(updateData);
          
          // 2. 関連キャッシュ無効化
          cache.invalidate(['user', 'profile', 'settings']);
          
          // 3. 必要なデータ再取得
          await refetchData();
        } catch (error) {
          handleError(error);
        }
      };
```

### 4.2 リアルタイム同期
```yaml
realtime_synchronization:
  websocket_integration:
    connection_management: |
      class WebSocketManager {
        private ws: WebSocket;
        private reconnectAttempts = 0;
        private maxReconnectAttempts = 5;
        
        connect(url: string) {
          this.ws = new WebSocket(url);
          
          this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
          };
          
          this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          };
          
          this.ws.onclose = () => {
            this.handleReconnect();
          };
          
          this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
          };
        }
        
        private handleReconnect() {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect(this.url);
            }, Math.pow(2, this.reconnectAttempts) * 1000);
          }
        }
        
        private handleMessage(data: any) {
          // メッセージタイプに応じた状態更新
          switch (data.type) {
            case 'DATA_UPDATE':
              updateGlobalState(data.payload);
              break;
            case 'USER_NOTIFICATION':
              showNotification(data.payload);
              break;
          }
        }
      }
      
  server_sent_events:
    implementation: |
      class SSEManager {
        private eventSource: EventSource;
        
        connect(url: string) {
          this.eventSource = new EventSource(url);
          
          this.eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleUpdate(data);
          };
          
          this.eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            this.handleReconnect();
          };
        }
        
        private handleUpdate(data: any) {
          // サーバーからの更新をローカル状態に反映
          updateLocalState(data);
        }
      }
```

## 5. ローディング状態管理

### 5.1 ローディング状態設計
```yaml
loading_state_design:
  loading_state_types:
    global_loading:
      description: "アプリケーション全体のローディング"
      use_case: "初期データ読み込み・認証処理"
      implementation: "グローバル状態管理"
      
    page_loading:
      description: "ページレベルのローディング"
      use_case: "ページ遷移・大量データ読み込み"
      implementation: "ページコンポーネント状態"
      
    component_loading:
      description: "コンポーネントレベルのローディング"
      use_case: "フォーム送信・部分更新"
      implementation: "ローカル状態管理"
      
    action_loading:
      description: "特定アクションのローディング"
      use_case: "ボタンクリック・API呼び出し"
      implementation: "アクション固有状態"
      
  loading_state_implementation: |
    interface LoadingState {
      isLoading: boolean;
      loadingType?: 'initial' | 'refresh' | 'more' | 'submit';
      progress?: number;
      message?: string;
    }
    
    const useLoadingState = () => {
      const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: false
      });
      
      const startLoading = (type?: string, message?: string) => {
        setLoadingState({
          isLoading: true,
          loadingType: type,
          message
        });
      };
      
      const updateProgress = (progress: number) => {
        setLoadingState(prev => ({
          ...prev,
          progress
        }));
      };
      
      const stopLoading = () => {
        setLoadingState({
          isLoading: false
        });
      };
      
      return {
        loadingState,
        startLoading,
        updateProgress,
        stopLoading
      };
    };
```

### 5.2 ローディングUI パターン
```yaml
loading_ui_patterns:
  skeleton_loading:
    description: "スケルトンローディング"
    use_case: "コンテンツ形状が予測可能な場合"
    implementation: |
      const SkeletonLoader = ({ lines = 3, height = 20 }) => (
        <div className="skeleton-container">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className="skeleton-line"
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      );
      
  spinner_loading:
    description: "スピナーローディング"
    use_case: "処理時間が不明な場合"
    implementation: |
      const SpinnerLoader = ({ size = 'medium', message }) => (
        <div className="spinner-container">
          <div className={`spinner spinner-${size}`} />
          {message && <p className="spinner-message">{message}</p>}
        </div>
      );
      
  progress_loading:
    description: "プログレスローディング"
    use_case: "進捗が測定可能な場合"
    implementation: |
      const ProgressLoader = ({ progress, message }) => (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-message">{message}</p>
          <span className="progress-percentage">{progress}%</span>
        </div>
      );
```

## 6. パフォーマンス最適化

### 6.1 API呼び出し最適化
```yaml
api_call_optimization:
  request_deduplication:
    description: "重複リクエストの排除"
    implementation: |
      class RequestDeduplicator {
        private pendingRequests = new Map<string, Promise<any>>();
        
        async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
          if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
          }
          
          const promise = requestFn().finally(() => {
            this.pendingRequests.delete(key);
          });
          
          this.pendingRequests.set(key, promise);
          return promise;
        }
      }
      
  request_batching:
    description: "リクエストのバッチ処理"
    implementation: |
      class RequestBatcher {
        private batchQueue: any[] = [];
        private batchTimer: NodeJS.Timeout | null = null;
        
        addToBatch(request: any) {
          this.batchQueue.push(request);
          
          if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
              this.processBatch();
            }, 100); // 100ms でバッチ処理
          }
        }
        
        private async processBatch() {
          const batch = [...this.batchQueue];
          this.batchQueue = [];
          this.batchTimer = null;
          
          try {
            const results = await api.batchRequest(batch);
            this.distributeBatchResults(batch, results);
          } catch (error) {
            this.handleBatchError(batch, error);
          }
        }
      }
      
  response_caching:
    description: "レスポンスキャッシュ"
    implementation: |
      class ResponseCache {
        private cache = new Map<string, CacheEntry>();
        
        get<T>(key: string): T | null {
          const entry = this.cache.get(key);
          
          if (!entry) return null;
          
          if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
          }
          
          return entry.data;
        }
        
        set<T>(key: string, data: T, ttl: number = 300000) {
          this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
          });
        }
      }
```

---

**UI-API統合ガイド設計者**: プロセスエンジニアリングシステム ver3.1  
**統合保証レベル**: 最高（インターフェース統一・エラーハンドリング・状態同期）  
**適用範囲**: 全UI-API統合・全プロジェクト  
**効果保証**: 統合品質向上、エラー処理統一、パフォーマンス最適化  
**更新日**: 2025-07-08
