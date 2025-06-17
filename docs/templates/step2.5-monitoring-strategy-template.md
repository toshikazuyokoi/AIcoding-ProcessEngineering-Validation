# 監視戦略書

## メタデータ
- **文書ID**: MON-001
- **関連文書**: 
  - AUTO-001（自動化機会リスト）
  - QCP-001（品質チェックポイント定義書）
  - NFR-001（非機能要件リスト）
- **作成日**: YYYY-MM-DD
- **最終更新日**: YYYY-MM-DD
- **作成者**: [名前]
- **承認者**: [運用責任者名]

## 1. 監視戦略概要

### 1.1 監視の目的と原則
| 目的 | 説明 | 期待効果 |
|------|------|----------|
| 早期問題検知 | 障害の予兆を早期に発見 | MTTR（平均復旧時間）の短縮 |
| 品質の可視化 | リアルタイムで品質状態を把握 | 継続的な品質改善 |
| 自動対応 | 定型的な問題の自動解決 | 運用負荷の軽減 |
| 予防保守 | 問題発生前の対処 | 可用性の向上 |

### 1.2 監視アーキテクチャ
````mermaid
graph TB
    subgraph "アプリケーション層"
        A1[Webアプリ]
        A2[APIサーバー]
        A3[バッチ処理]
    end
    
    subgraph "収集層"
        B1[メトリクス収集]
        B2[ログ収集]
        B3[トレース収集]
        B4[イベント収集]
    end
    
    subgraph "処理層"
        C1[データ集約]
        C2[異常検知]
        C3[相関分析]
    end
    
    subgraph "通知層"
        D1[アラート]
        D2[ダッシュボード]
        D3[レポート]
    end
    
    A1 --> B1
    A1 --> B2
    A2 --> B1
    A2 --> B2
    A2 --> B3
    A3 --> B2
    A3 --> B4
    
    B1 --> C1
    B2 --> C1
    B3 --> C1
    B4 --> C1
    
    C1 --> C2
    C1 --> C3
    
    C2 --> D1
    C3 --> D2
    C1 --> D3
````

## 2. 監視対象と指標

### 2.1 インフラストラクチャ監視
| 監視対象 | 主要メトリクス | 閾値 | アラートレベル |
|----------|--------------|------|---------------|
| CPU使用率 | 使用率(%) | >80% | Warning |
| | | >90% | Critical |
| メモリ使用率 | 使用率(%) | >85% | Warning |
| | | >95% | Critical |
| ディスク使用率 | 使用率(%) | >80% | Warning |
| | | >90% | Critical |
| ネットワーク | パケットロス率 | >1% | Warning |
| | | >5% | Critical |

### 2.2 アプリケーション監視
| 監視対象 | 主要メトリクス | 閾値 | アラートレベル |
|----------|--------------|------|---------------|
| レスポンス時間 | 平均(ms) | >500ms | Warning |
| | 95パーセンタイル | >1000ms | Critical |
| エラー率 | 5xx/総リクエスト | >1% | Warning |
| | | >5% | Critical |
| スループット | req/sec | <10 | Warning |
| | | <5 | Critical |
| 同時接続数 | アクティブ接続 | >800 | Warning |
| | | >950 | Critical |

### 2.3 ビジネスメトリクス監視
| 監視対象 | 主要メトリクス | 閾値 | アラートレベル |
|----------|--------------|------|---------------|
| ユーザー登録 | 登録数/時 | <1 | Info |
| | | 0 | Warning |
| ログイン成功率 | 成功/試行 | <95% | Warning |
| | | <90% | Critical |
| 取引完了率 | 完了/開始 | <98% | Warning |
| | | <95% | Critical |

## 3. 監視ツール選定

### 3.1 メトリクス監視
| ツール | 用途 | 選定理由 | コスト |
|--------|------|----------|--------|
| **Prometheus** | メトリクス収集・保存 | OSS、柔軟性高い | 無料 |
| Grafana | 可視化 | Prometheusとの親和性 | 無料 |
| AlertManager | アラート管理 | Prometheus統合 | 無料 |

### 3.2 ログ監視
| ツール | 用途 | 選定理由 | コスト |
|--------|------|----------|--------|
| **ELK Stack** | ログ収集・分析 | 統合環境、実績豊富 | OSS版無料 |
| Fluentd | ログ転送 | 軽量、プラグイン豊富 | 無料 |
| CloudWatch Logs | AWS環境ログ | AWS統合 | 従量課金 |

### 3.3 APM（Application Performance Monitoring）
| ツール | 用途 | 選定理由 | コスト |
|--------|------|----------|--------|
| **OpenTelemetry** | トレース収集 | ベンダー中立、標準化 | 無料 |
| Jaeger | 分散トレース | OSS、OpenTelemetry対応 | 無料 |
| New Relic | 統合APM | 包括的機能 | 有料 |

## 4. アラート設計

### 4.1 アラートレベル定義
| レベル | 定義 | 対応時間 | 通知先 | 例 |
|--------|------|----------|--------|-----|
| Critical | サービス停止の恐れ | 即時 | 全員+管理者 | DBダウン |
| Warning | 性能劣化・要注意 | 1時間以内 | 担当者 | CPU高負荷 |
| Info | 情報共有 | 営業時間内 | チーム | デプロイ完了 |

### 4.2 アラートルール設計
```yaml
# prometheus/alerts/application.yml
groups:
  - name: application
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} (threshold: 5%)"
          
      - alert: SlowResponse
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1.0
        for: 10m
        labels:
          severity: warning
          team: backend
        annotations:
          summary: "Slow response time"
          description: "95th percentile response time is {{ $value }}s"
```

### 4.3 エスカレーション設計
````mermaid
graph TD
    A[アラート発生] --> B{レベル判定}
    B -->|Critical| C[即時通知]
    B -->|Warning| D[担当者通知]
    B -->|Info| E[ログ記録]
    
    C --> F[Slack + PagerDuty]
    D --> G[Slack]
    E --> H[ログファイル]
    
    F --> I{応答確認}
    I -->|なし| J[エスカレーション]
    I -->|あり| K[対応開始]
    
    J --> L[管理者通知]
````

## 5. ダッシュボード設計

### 5.1 運用ダッシュボード
| ダッシュボード | 目的 | 主要ウィジェット | 更新頻度 |
|--------------|------|----------------|----------|
| システム概要 | 全体状況把握 | ・サービス稼働状況<br>・主要メトリクス<br>・アラート一覧 | 1分 |
| パフォーマンス | 性能監視 | ・レスポンス時間<br>・スループット<br>・エラー率 | 30秒 |
| インフラ | リソース監視 | ・CPU/メモリ<br>・ディスク<br>・ネットワーク | 1分 |
| ビジネス | KPI監視 | ・ユーザー数<br>・取引量<br>・売上 | 5分 |

### 5.2 分析ダッシュボード
```json
{
  "dashboard": {
    "title": "Application Performance Analysis",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "query": "sum(rate(http_requests_total[5m])) by (method)"
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "query": "sum(rate(http_requests_total{status=~'5..'}[5m]))"
      },
      {
        "title": "Response Time Heatmap",
        "type": "heatmap",
        "query": "http_request_duration_seconds"
      }
    ]
  }
}
```

## 6. ログ管理戦略

### 6.1 ログレベルと用途
| レベル | 用途 | 保存期間 | 例 |
|--------|------|----------|-----|
| ERROR | エラー調査 | 90日 | 例外、エラー応答 |
| WARN | 異常動作調査 | 30日 | 性能劣化、リトライ |
| INFO | 一般情報 | 7日 | API呼び出し、状態変更 |
| DEBUG | 詳細調査 | 1日 | 変数値、処理フロー |

### 6.2 構造化ログ形式
```typescript
interface LogFormat {
  timestamp: string;        // ISO 8601形式
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;          // サービス名
  traceId: string;         // トレースID
  userId?: string;         // ユーザーID
  message: string;         // ログメッセージ
  context: {               // 追加コンテキスト
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    error?: {
      name: string;
      message: string;
      stack?: string;
    };
  };
}

// 実装例
logger.info('API request completed', {
  traceId: req.traceId,
  userId: req.user?.id,
  context: {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: Date.now() - req.startTime
  }
});
```

## 7. 自動対応設計

### 7.1 自動スケーリング
| トリガー | 条件 | アクション | クールダウン |
|----------|------|-----------|-------------|
| CPU高負荷 | >70% for 5min | インスタンス追加 | 5分 |
| メモリ不足 | >85% for 5min | インスタンス追加 | 5分 |
| 低負荷 | <30% for 15min | インスタンス削減 | 10分 |

### 7.2 自動復旧
```yaml
# kubernetes/health-check.yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
  
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

## 8. 監視体制と運用

### 8.1 監視体制
| 時間帯 | 体制 | 対応レベル | 連絡方法 |
|--------|------|-----------|----------|
| 平日9-18時 | 専任2名 | 全レベル | Slack |
| 平日18-9時 | オンコール1名 | Critical/Warning | PagerDuty |
| 休日 | オンコール1名 | Criticalのみ | PagerDuty |

### 8.2 定期レビュー
| レビュー項目 | 頻度 | 参加者 | 成果物 |
|------------|------|--------|--------|
| アラート分析 | 週次 | 開発・運用 | 改善提案 |
| SLO評価 | 月次 | 全ステークホルダー | SLOレポート |
| 監視設定見直し | 四半期 | アーキテクト・運用 | 設定更新 |

## 9. 災害対策（DR）

### 9.1 バックアップ戦略
| 対象 | 頻度 | 保存期間 | 保存先 | RPO |
|------|------|----------|--------|-----|
| データベース | 日次（差分）| 30日 | S3 | 24時間 |
| | 週次（完全）| 90日 | S3 Glacier | 1週間 |
| アプリケーションログ | リアルタイム | 90日 | CloudWatch | 1分 |
| 設定ファイル | 変更時 | 永続 | Git | 0 |

### 9.2 復旧手順
1. **障害検知**: 自動アラート → 担当者確認
2. **影響範囲特定**: ダッシュボード確認
3. **初動対応**: 自動フェイルオーバー or 手動切替
4. **根本原因調査**: ログ分析、トレース確認
5. **恒久対策**: 修正、テスト、デプロイ
6. **事後分析**: レポート作成、改善実施

## 10. 完了チェックリスト

- [ ] 監視対象と指標を定義した
- [ ] 監視ツールを選定した
- [ ] アラートルールを設計した
- [ ] ダッシュボードを設計した
- [ ] ログ管理方針を決定した
- [ ] 自動対応を設計した
- [ ] 運用体制を確立した
- [ ] 災害対策を策定した
- [ ] 監視環境を構築した
- [ ] 運用手順書を作成した

## 11. 承認

| 役割 | 氏名 | 承認日 | 署名 |
|------|------|--------|------|
| 運用責任者 | | | |
| インフラマネージャー | | | |
| 開発マネージャー | | | |
| セキュリティ責任者 | | | |