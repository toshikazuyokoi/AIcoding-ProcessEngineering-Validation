# STEP1: 要件定義プロセス

**バージョン**: 3.2.0  
**作成日**: 2025-07-09  
**理論分類**: 実行プロセス層  
**プロセス種別**: 要件分析・仕様化・合意形成  
**適用範囲**: 全プロジェクト・全ステークホルダー・全要件種別  

## 1. STEP1: 要件定義プロセス 概要

### 1.1 プロセスの目的
STEP1: 要件定義プロセスは、**「ステークホルダーニーズの完全な要件化・仕様化・合意形成」**を実現するため、機能要件・非機能要件・制約条件・画面一覧の体系的定義、要件トレーサビリティの確立、ステークホルダー承認の取得を通じて、設計・実装の確実な基盤を構築する要件エンジニアリングプロセスである。

```yaml
step1_requirements_definition_purpose:
  primary_objective: "ステークホルダーニーズの完全要件化・仕様化・合意形成"
  critical_achievement: "要件カバレッジ95%以上・トレーサビリティ100%・承認取得"
  elimination_target: "要件曖昧性・漏れ・不整合・未承認の完全排除"
  foundation_guarantee: "設計・実装・テストの確実な基盤・判断基準提供"
  
  process_characteristics:
    comprehensive_coverage: "全要件種別・全ステークホルダーの包括的カバレッジ"
    systematic_analysis: "体系的要件分析・分類・優先度・依存関係"
    traceability_assurance: "完全なトレーサビリティ・追跡可能性・影響分析"
    stakeholder_agreement: "ステークホルダー合意・承認・コミット・責任"
```

### 1.2 プロセスの基本原則

```yaml
requirements_definition_principles:
  stakeholder_driven:
    principle: "ステークホルダー駆動・ニーズ中心・価値重視・満足追求"
    implementation: "ステークホルダーニーズの体系的収集・分析・要件化"
    guarantee: "ステークホルダー価値実現・期待充足・満足達成"
    
  completeness_assurance:
    principle: "完全性保証・網羅性・漏れ防止・包括的カバレッジ"
    implementation: "要件収集・分析・検証の体系的・包括的実行"
    guarantee: "要件漏れ防止・完全性確保・品質保証"
    
  traceability_maintenance:
    principle: "トレーサビリティ維持・追跡可能性・影響分析・変更管理"
    implementation: "要件間関係・依存性・影響の体系的管理・追跡"
    guarantee: "変更影響分析・整合性維持・品質保証"
    
  consensus_building:
    principle: "合意形成・ステークホルダー承認・コミット・責任共有"
    implementation: "要件レビュー・協議・調整・合意・承認の体系的実行"
    guarantee: "ステークホルダー合意・承認・コミット・協力確保"
```

## 2. 要件定義実行手順

### 2.1 STEP1-1: 機能要件定義

```yaml
functional_requirements_definition:
  execution_procedure:
    step1_business_process_analysis:
      activity: "ビジネスプロセス分析・現状把握・改善要求・将来像設計"
      method: "プロセスマッピング・As-Is/To-Be分析・ギャップ分析・改善設計"
      deliverable: "プロセスマップ・現状分析・改善要求・将来プロセス設計"
      verification: "プロセス理解完全性・分析妥当性・改善要求適切性確認"
      
    step2_functional_decomposition:
      activity: "機能分解・階層化・詳細化・関係性定義・優先度設定"
      method: "機能分解図・階層分析・詳細仕様・関係マトリクス・優先度評価"
      deliverable: "機能分解図・機能仕様・関係定義・優先度マトリクス"
      verification: "分解完全性・階層妥当性・詳細十分性・関係正確性確認"
      
    step3_use_case_development:
      activity: "ユースケース開発・シナリオ作成・例外処理・前後条件定義"
      method: "ユースケース図・シナリオ記述・例外分析・条件定義"
      deliverable: "ユースケース図・シナリオ・例外処理・前後条件"
      verification: "ユースケース完全性・シナリオ現実性・例外網羅性確認"
      
    step4_acceptance_criteria_specification:
      activity: "受入基準・完了条件・検証方法・テスト観点の詳細仕様化"
      method: "受入基準設計・条件定義・検証計画・テスト観点分析"
      deliverable: "受入基準・完了条件・検証方法・テスト観点"
      verification: "基準明確性・条件妥当性・検証可能性・観点包括性確認"
      
  quality_criteria:
    completeness: "機能要件カバレッジ95%以上・漏れ防止"
    clarity: "要件明確性・理解可能性90%以上"
    testability: "テスト可能性・検証可能性90%以上"
    consistency: "要件間整合性・一貫性95%以上"
    
  raci_matrix:
    responsible: "ビジネスアナリスト・要件エンジニア"
    accountable: "プロダクトオーナー・ビジネス責任者"
    consulted: "ステークホルダー代表・ドメイン専門家・UXデザイナー"
    informed: "開発チーム・テストチーム・アーキテクト・品質保証"
```

### 2.2 STEP1-2: 非機能要件定義

```yaml
non_functional_requirements_definition:
  execution_procedure:
    step1_performance_requirements:
      activity: "性能要件・レスポンス・スループット・容量・拡張性定義"
      method: "性能分析・負荷予測・容量設計・拡張性評価・基準設定"
      deliverable: "性能要件・レスポンス基準・容量計画・拡張性設計"
      verification: "性能基準妥当性・測定可能性・達成可能性・拡張性確認"
      
    step2_security_requirements:
      activity: "セキュリティ要件・認証・認可・暗号化・監査・脅威対策定義"
      method: "脅威分析・リスク評価・セキュリティ設計・対策計画・基準設定"
      deliverable: "セキュリティ要件・脅威分析・対策設計・監査計画"
      verification: "セキュリティ要件完全性・対策適切性・基準妥当性確認"
      
    step3_usability_accessibility:
      activity: "ユーザビリティ・アクセシビリティ・UI/UX・操作性要件定義"
      method: "ユーザビリティ分析・アクセシビリティ評価・UI/UX設計・操作性評価"
      deliverable: "ユーザビリティ要件・アクセシビリティ基準・UI/UX要件"
      verification: "ユーザビリティ基準妥当性・アクセシビリティ準拠・操作性確認"
      
    step4_reliability_availability:
      activity: "信頼性・可用性・保守性・運用性・監視・障害対応要件定義"
      method: "信頼性分析・可用性設計・保守性評価・運用計画・監視設計"
      deliverable: "信頼性要件・可用性基準・保守性要件・運用要件"
      verification: "信頼性基準妥当性・可用性達成可能性・保守性確認"
      
  quality_criteria:
    measurability: "非機能要件測定可能性90%以上"
    achievability: "要件達成可能性85%以上"
    completeness: "非機能要件網羅性90%以上"
    consistency: "機能要件との整合性95%以上"
    
  raci_matrix:
    responsible: "システムアナリスト・アーキテクト"
    accountable: "技術責任者・システム責任者"
    consulted: "インフラエンジニア・セキュリティ専門家・UXデザイナー"
    informed: "開発チーム・運用チーム・品質保証・ステークホルダー"
```

### 2.3 STEP1-3: 制約条件・前提条件定義

```yaml
constraints_assumptions_definition:
  execution_procedure:
    step1_technical_constraints:
      activity: "技術制約・プラットフォーム・言語・フレームワーク・ツール制約定義"
      method: "技術制約分析・プラットフォーム評価・技術選定・制約文書化"
      deliverable: "技術制約・プラットフォーム制約・技術選定・制約影響分析"
      verification: "制約妥当性・影響分析完全性・対応可能性確認"
      
    step2_business_constraints:
      activity: "ビジネス制約・予算・期限・リソース・法規制・政策制約定義"
      method: "ビジネス制約分析・予算制約・期限制約・法規制調査・政策分析"
      deliverable: "ビジネス制約・予算制約・期限制約・法規制要件"
      verification: "制約現実性・法規制準拠・政策整合性・対応計画確認"
      
    step3_organizational_constraints:
      activity: "組織制約・体制・スキル・文化・プロセス・システム制約定義"
      method: "組織分析・体制評価・スキル評価・文化分析・プロセス制約分析"
      deliverable: "組織制約・体制制約・スキル制約・文化制約・プロセス制約"
      verification: "組織制約現実性・体制適切性・スキル十分性・対応可能性確認"
      
    step4_assumptions_dependencies:
      activity: "前提条件・依存関係・外部要因・リスク要因の特定・文書化"
      method: "前提条件分析・依存関係マッピング・外部要因分析・リスク特定"
      deliverable: "前提条件・依存関係・外部要因・リスク要因・影響分析"
      verification: "前提条件妥当性・依存関係正確性・リスク評価適切性確認"
      
  quality_criteria:
    completeness: "制約・前提条件網羅性90%以上"
    realism: "制約・前提条件現実性95%以上"
    impact_analysis: "影響分析完全性90%以上"
    manageability: "制約・前提条件管理可能性85%以上"
    
  raci_matrix:
    responsible: "ビジネスアナリスト・プロジェクトマネージャー"
    accountable: "プロジェクトスポンサー・ビジネス責任者"
    consulted: "技術リーダー・法務・コンプライアンス・組織開発"
    informed: "開発チーム・ステークホルダー・関係部門"
```

### 2.4 STEP1-4: 画面一覧・UI要件定義

```yaml
screen_ui_requirements_definition:
  execution_procedure:
    step1_screen_inventory:
      activity: "画面一覧・画面分類・画面階層・ナビゲーション構造定義"
      method: "画面棚卸・分類設計・階層設計・ナビゲーション設計・構造定義"
      deliverable: "画面一覧・画面分類・画面階層・ナビゲーション構造"
      verification: "画面網羅性・分類妥当性・階層論理性・ナビゲーション使いやすさ確認"
      
    step2_screen_specifications:
      activity: "画面仕様・レイアウト・要素・機能・操作・表示内容詳細定義"
      method: "画面仕様設計・レイアウト設計・要素定義・機能仕様・操作仕様"
      deliverable: "画面仕様・レイアウト・要素定義・機能仕様・操作仕様"
      verification: "仕様完全性・レイアウト妥当性・機能整合性・操作使いやすさ確認"
      
    step3_ui_standards:
      activity: "UI標準・デザインガイドライン・コンポーネント・パターン定義"
      method: "UI標準設計・ガイドライン策定・コンポーネント設計・パターン定義"
      deliverable: "UI標準・デザインガイドライン・コンポーネント・パターン"
      verification: "標準一貫性・ガイドライン実用性・コンポーネント再利用性確認"
      
    step4_responsive_accessibility:
      activity: "レスポンシブ対応・アクセシビリティ・多言語・ブラウザ対応定義"
      method: "レスポンシブ設計・アクセシビリティ設計・多言語対応・ブラウザ対応"
      deliverable: "レスポンシブ仕様・アクセシビリティ仕様・多言語仕様・対応仕様"
      verification: "レスポンシブ対応完全性・アクセシビリティ準拠・対応範囲妥当性確認"
      
  quality_criteria:
    completeness: "画面・UI要件網羅性95%以上"
    consistency: "UI標準・ガイドライン一貫性90%以上"
    usability: "ユーザビリティ・操作性85%以上"
    accessibility: "アクセシビリティ準拠90%以上"
    
  raci_matrix:
    responsible: "UXデザイナー・UIデザイナー"
    accountable: "プロダクトオーナー・デザイン責任者"
    consulted: "ビジネスアナリスト・ユーザー代表・アクセシビリティ専門家"
    informed: "開発チーム・フロントエンドチーム・テストチーム"
```

## 3. 要件トレーサビリティ・管理

### 3.1 トレーサビリティマトリクス構築

```yaml
traceability_matrix_construction:
  forward_traceability:
    business_needs_to_requirements: "ビジネスニーズ→要件のトレーサビリティ"
    requirements_to_design: "要件→設計のトレーサビリティ"
    design_to_implementation: "設計→実装のトレーサビリティ"
    implementation_to_test: "実装→テストのトレーサビリティ"
    
  backward_traceability:
    test_to_implementation: "テスト→実装の逆トレーサビリティ"
    implementation_to_design: "実装→設計の逆トレーサビリティ"
    design_to_requirements: "設計→要件の逆トレーサビリティ"
    requirements_to_business_needs: "要件→ビジネスニーズの逆トレーサビリティ"
    
  traceability_management:
    matrix_maintenance: "トレーサビリティマトリクス維持・更新・管理"
    impact_analysis: "変更影響分析・波及効果・リスク評価"
    coverage_verification: "カバレッジ検証・漏れ検出・完全性確認"
    consistency_check: "整合性チェック・矛盾検出・調整・解決"
    
  quality_criteria:
    completeness: "トレーサビリティ完全性100%"
    accuracy: "トレーサビリティ正確性95%以上"
    maintainability: "トレーサビリティ保守性90%以上"
    usability: "トレーサビリティ使用性85%以上"
```

### 3.2 要件変更管理

```yaml
requirements_change_management:
  change_request_process:
    request_submission: "変更要求提出・理由・影響・緊急度・優先度"
    impact_assessment: "影響評価・範囲・コスト・期間・リスク・品質"
    approval_process: "承認プロセス・権限・基準・手順・責任・記録"
    implementation_planning: "実装計画・スケジュール・リソース・手順・検証"
    
  change_control_board:
    composition: "変更管理委員会・構成・役割・責任・権限・手順"
    decision_criteria: "決定基準・評価・優先度・承認・却下・条件"
    meeting_process: "会議プロセス・頻度・議事・決定・記録・伝達"
    escalation_procedure: "エスカレーション・条件・手順・権限・責任"
    
  version_control:
    versioning_strategy: "バージョニング戦略・番号・管理・履歴・追跡"
    baseline_management: "ベースライン管理・確立・変更・承認・配布"
    configuration_management: "構成管理・識別・制御・状況・監査"
    release_management: "リリース管理・計画・実行・検証・配布・支援"
    
  quality_criteria:
    change_control: "変更制御率95%以上"
    impact_accuracy: "影響評価精度90%以上"
    approval_compliance: "承認手順遵守率100%"
    version_integrity: "バージョン整合性95%以上"
```

## 4. ステークホルダー合意・承認

### 4.1 要件レビュー・検証

```yaml
requirements_review_verification:
  formal_review_process:
    review_planning: "レビュー計画・参加者・資料・基準・手順・スケジュール"
    review_execution: "レビュー実行・検証・議論・課題・決定・記録"
    issue_resolution: "課題解決・対応・調整・合意・承認・記録"
    approval_confirmation: "承認確認・署名・コミット・責任・記録・配布"
    
  verification_methods:
    completeness_check: "完全性チェック・網羅・漏れ・不足・補完"
    consistency_verification: "整合性検証・矛盾・不一致・調整・統一"
    feasibility_assessment: "実現可能性評価・技術・リソース・期間・リスク"
    testability_evaluation: "テスト可能性評価・検証・測定・基準・方法"
    
  stakeholder_validation:
    user_acceptance: "ユーザー受入・確認・承認・満足・期待・価値"
    business_approval: "ビジネス承認・価値・効果・投資・リターン・戦略"
    technical_feasibility: "技術実現可能性・アーキテクチャ・実装・品質・性能"
    compliance_verification: "コンプライアンス検証・法規制・標準・政策・ガイドライン"
    
  quality_criteria:
    review_coverage: "レビューカバレッジ95%以上"
    issue_resolution_rate: "課題解決率90%以上"
    stakeholder_approval_rate: "ステークホルダー承認率95%以上"
    verification_completeness: "検証完全性90%以上"
```

### 4.2 合意形成・承認取得

```yaml
consensus_building_approval:
  consensus_process:
    stakeholder_alignment: "ステークホルダー整合・期待・要求・優先度・価値"
    conflict_resolution: "競合解決・調整・妥協・合意・Win-Win・価値"
    negotiation_facilitation: "交渉促進・仲介・調停・合意・協力・関係"
    agreement_documentation: "合意文書化・内容・条件・責任・期限・記録"
    
  approval_framework:
    approval_criteria: "承認基準・条件・品質・完全性・整合性・価値"
    approval_authority: "承認権限・責任者・範囲・条件・手順・記録"
    approval_process: "承認プロセス・手順・期限・条件・記録・配布"
    approval_tracking: "承認追跡・状況・進捗・課題・対応・完了"
    
  commitment_establishment:
    stakeholder_commitment: "ステークホルダーコミット・責任・協力・支援・貢献"
    resource_commitment: "リソースコミット・人・時間・予算・技術・支援"
    timeline_commitment: "タイムラインコミット・期限・マイルストーン・進捗・調整"
    quality_commitment: "品質コミット・基準・責任・検証・改善・保証"
    
  quality_criteria:
    consensus_achievement: "合意達成率95%以上"
    approval_completeness: "承認完全性100%"
    commitment_strength: "コミット強度85%以上"
    documentation_quality: "文書品質90%以上"
```

## 5. 品質ゲート・完了基準

### 5.1 STEP1完了品質ゲート

```yaml
step1_completion_quality_gate:
  gate_name: "品質ゲート1: 要件完全性"
  gate_purpose: "要件定義完全性・トレーサビリティ・ステークホルダー承認確認"
  gate_timing: "STEP1全活動完了時・STEP2開始前"
  
  gate_criteria:
    requirements_coverage: "要件カバレッジ95%以上"
    traceability_completeness: "トレーサビリティ完全性100%"
    stakeholder_approval_rate: "ステークホルダー承認率95%以上"
    documentation_quality: "文書品質90%以上"
    consistency_score: "要件整合性スコア95%以上"
    
  verification_evidence:
    requirements_specification: "要件仕様書・機能・非機能・制約・画面"
    traceability_matrix: "トレーサビリティマトリクス・完全・正確・最新"
    stakeholder_approval: "ステークホルダー承認文書・署名・コミット"
    review_records: "レビュー記録・課題・解決・承認・品質確認"
    change_management: "変更管理・履歴・承認・影響・統制・記録"
    
  gate_decision:
    pass_conditions: "全基準達成・証拠完備・承認取得・品質確認"
    fail_consequences: "STEP2開始禁止・要件改善・再レビュー・再承認"
    improvement_requirements: "不足要件補完・品質向上・承認取得・記録更新"
    escalation_triggers: "重大要件問題・承認困難・品質不適合・リスク顕在化"
    
  raci_matrix:
    responsible: "品質ゲートキーパー(要件)"
    accountable: "品質保証責任者・プロダクトオーナー"
    consulted: "ビジネスアナリスト・ステークホルダー代表・技術リーダー"
    informed: "開発チーム・テストチーム・アーキテクト・プロジェクトマネージャー"
```

---

**STEP1プロセス作成者**: プロセスエンジニアリングシステム ver3.2  
**適用原則**: ステークホルダー駆動・完全性保証・トレーサビリティ維持・合意形成  
**保証レベル**: 要件カバレッジ95%以上・トレーサビリティ100%・承認取得  
**更新日**: 2025-07-09
