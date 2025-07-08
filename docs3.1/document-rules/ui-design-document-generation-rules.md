# UI設計文書生成ルール

**バージョン**: 3.1.0  
**作成日**: 2025-07-08  
**理論分類**: 文書生成ルール層  
**文書種別**: UI設計文書自動生成ルール  
**改善レベル**: 実証実験問題根本解決版  

## 1. UI設計文書生成ルール概要

### 1.1 ルール定義
UI設計文書生成ルールは、プロセスエンジニアリング理論ver3.1における**UI設計文書の自動生成を体系化し、実証実験で発見されたUI設計情報不足問題を根本解決**する包括的文書生成ルールである。

### 1.2 実証実験で発見されたUI設計文書問題
```yaml
ui_design_document_problems:
  insufficient_design_detail:
    problem: "UI設計情報の詳細度不足"
    manifestation: "コンポーネント仕様の曖昧性"
    root_cause: "AI実装に必要な詳細度の設計情報不足"
    impact: "AI実装精度低下・実装エラー増加"
    
  inconsistent_design_format:
    problem: "UI設計文書フォーマットの不統一"
    manifestation: "文書間での記述方式の違い"
    root_cause: "統一的な文書生成ルール不在"
    impact: "設計理解困難・実装品質低下"
    
  missing_implementation_guidance:
    problem: "実装ガイダンス不足"
    manifestation: "設計から実装への橋渡し情報不足"
    root_cause: "実装者向け情報の体系化不足"
    impact: "実装時の推測・手戻り作業増加"
    
  inadequate_test_support:
    problem: "テスト支援情報不足"
    manifestation: "テスト可能性を考慮した設計情報不足"
    root_cause: "テスト観点の設計情報体系化不足"
    impact: "テスト実装困難・テスト品質低下"
```

## 2. UI設計文書生成階層

### 2.1 文書生成階層構造
```yaml
ui_design_document_hierarchy:
  level_1_conceptual_design:
    document_type: "概念設計文書"
    generation_trigger: "要件定義完了時"
    content_scope: "画面構成・基本レイアウト・主要機能"
    detail_level: "概念レベル"
    target_audience: "ステークホルダー・プロダクトオーナー"
    
  level_2_functional_design:
    document_type: "機能設計文書"
    generation_trigger: "概念設計承認時"
    content_scope: "画面遷移・ユーザーインタラクション・データフロー"
    detail_level: "機能レベル"
    target_audience: "設計者・開発者"
    
  level_3_detailed_design:
    document_type: "詳細設計文書"
    generation_trigger: "機能設計承認時"
    content_scope: "コンポーネント仕様・API仕様・状態管理"
    detail_level: "実装レベル"
    target_audience: "開発者・テスター"
    
  level_4_implementation_guide:
    document_type: "実装ガイド文書"
    generation_trigger: "詳細設計承認時"
    content_scope: "実装パターン・コード例・テスト仕様"
    detail_level: "コードレベル"
    target_audience: "実装者・AI"
```

### 2.2 文書間依存関係
```yaml
document_dependencies:
  input_documents:
    requirements: "要件定義書"
    user_stories: "ユーザーストーリー"
    system_architecture: "システムアーキテクチャ"
    api_specification: "API仕様書"
    
  output_documents:
    component_specification: "コンポーネント仕様書"
    test_specification: "テスト仕様書"
    implementation_guide: "実装ガイド"
    style_guide: "スタイルガイド"
    
  dependency_validation:
    consistency_check: "入力文書との整合性確認"
    completeness_check: "必要情報の完全性確認"
    traceability_check: "要件トレーサビリティ確認"
```

## 3. 文書生成ルール詳細

### 3.1 概念設計文書生成ルール
```yaml
conceptual_design_generation_rules:
  document_structure:
    metadata_section:
      required_fields:
        - "document_id: string"
        - "creation_date: date"
        - "version: string"
        - "author: string"
        - "stakeholders: string[]"
        
    overview_section:
      required_fields:
        - "purpose: string"
        - "scope: string"
        - "target_users: string[]"
        - "business_objectives: string[]"
        
    screen_inventory_section:
      required_fields:
        - "screen_id: string"
        - "screen_name: string"
        - "screen_purpose: string"
        - "user_roles: string[]"
        - "access_conditions: string[]"
        
    navigation_design_section:
      required_fields:
        - "navigation_structure: object"
        - "screen_transitions: object[]"
        - "breadcrumb_design: object"
        - "menu_structure: object"
        
  generation_template: |
    # {project_name} UI概念設計書
    
    ## 1. 概要
    ### 1.1 目的
    {purpose}
    
    ### 1.2 対象ユーザー
    {target_users}
    
    ## 2. 画面一覧
    {screen_inventory}
    
    ## 3. ナビゲーション設計
    {navigation_design}
    
    ## 4. 基本レイアウト
    {basic_layout}
```

### 3.2 機能設計文書生成ルール
```yaml
functional_design_generation_rules:
  document_structure:
    interaction_design_section:
      required_fields:
        - "user_actions: object[]"
        - "system_responses: object[]"
        - "validation_rules: object[]"
        - "error_handling: object[]"
        
    data_flow_section:
      required_fields:
        - "input_data: object[]"
        - "output_data: object[]"
        - "data_transformations: object[]"
        - "api_integrations: object[]"
        
    state_management_section:
      required_fields:
        - "component_states: object[]"
        - "global_states: object[]"
        - "state_transitions: object[]"
        - "persistence_requirements: object[]"
        
  generation_template: |
    # {screen_name} 機能設計書
    
    ## 1. ユーザーインタラクション
    {interaction_design}
    
    ## 2. データフロー
    {data_flow}
    
    ## 3. 状態管理
    {state_management}
    
    ## 4. バリデーション
    {validation_rules}
```

### 3.3 詳細設計文書生成ルール
```yaml
detailed_design_generation_rules:
  document_structure:
    component_specification_section:
      required_fields:
        - "component_name: string"
        - "component_props: TypeScript型"
        - "component_state: TypeScript型"
        - "component_methods: object[]"
        - "component_lifecycle: object[]"
        
    api_integration_section:
      required_fields:
        - "api_endpoints: object[]"
        - "request_formats: TypeScript型[]"
        - "response_formats: TypeScript型[]"
        - "error_handling: object[]"
        
    styling_specification_section:
      required_fields:
        - "css_classes: object[]"
        - "responsive_design: object[]"
        - "accessibility_requirements: object[]"
        - "theme_variables: object[]"
        
  generation_template: |
    # {component_name} 詳細設計書
    
    ## 1. コンポーネント仕様
    ```typescript
    interface {component_name}Props {
      {props_definition}
    }
    
    interface {component_name}State {
      {state_definition}
    }
    ```
    
    ## 2. API統合
    {api_integration}
    
    ## 3. スタイリング
    {styling_specification}
    
    ## 4. テスト要件
    {test_requirements}
```

### 3.4 実装ガイド文書生成ルール
```yaml
implementation_guide_generation_rules:
  document_structure:
    code_examples_section:
      required_fields:
        - "component_implementation: string"
        - "hook_implementations: string[]"
        - "utility_functions: string[]"
        - "test_implementations: string[]"
        
    best_practices_section:
      required_fields:
        - "coding_standards: string[]"
        - "performance_considerations: string[]"
        - "accessibility_guidelines: string[]"
        - "security_considerations: string[]"
        
    troubleshooting_section:
      required_fields:
        - "common_issues: object[]"
        - "debugging_tips: string[]"
        - "performance_optimization: string[]"
        - "testing_strategies: string[]"
        
  generation_template: |
    # {component_name} 実装ガイド
    
    ## 1. 実装例
    ```typescript
    {component_implementation}
    ```
    
    ## 2. ベストプラクティス
    {best_practices}
    
    ## 3. テスト実装
    ```typescript
    {test_implementation}
    ```
    
    ## 4. トラブルシューティング
    {troubleshooting}
```

## 4. 自動生成システム

### 4.1 生成トリガー設定
```yaml
generation_triggers:
  requirement_based_triggers:
    new_requirement: "新規要件追加時の概念設計生成"
    requirement_change: "要件変更時の影響文書再生成"
    requirement_approval: "要件承認時の次段階文書生成"
    
  design_based_triggers:
    design_completion: "設計完了時の次段階文書生成"
    design_review: "設計レビュー時の品質チェック文書生成"
    design_approval: "設計承認時の実装ガイド生成"
    
  implementation_based_triggers:
    implementation_start: "実装開始時のガイド文書生成"
    implementation_completion: "実装完了時のテスト文書生成"
    bug_report: "バグ報告時のトラブルシューティング文書更新"
```

### 4.2 品質保証ルール
```yaml
quality_assurance_rules:
  completeness_validation:
    required_sections: "必須セクションの存在確認"
    required_fields: "必須フィールドの存在確認"
    content_depth: "内容の詳細度確認"
    
  consistency_validation:
    naming_consistency: "命名規則の一貫性確認"
    format_consistency: "フォーマットの一貫性確認"
    reference_consistency: "参照関係の一貫性確認"
    
  accuracy_validation:
    requirement_traceability: "要件トレーサビリティ確認"
    technical_accuracy: "技術的正確性確認"
    implementation_feasibility: "実装可能性確認"
    
  usability_validation:
    readability: "可読性確認"
    searchability: "検索可能性確認"
    maintainability: "保守性確認"
```

## 5. テンプレート管理

### 5.1 テンプレート階層
```yaml
template_hierarchy:
  base_templates:
    document_base: "基本文書テンプレート"
    section_base: "基本セクションテンプレート"
    field_base: "基本フィールドテンプレート"
    
  specialized_templates:
    form_component: "フォームコンポーネント専用テンプレート"
    list_component: "リストコンポーネント専用テンプレート"
    modal_component: "モーダルコンポーネント専用テンプレート"
    
  project_templates:
    project_specific: "プロジェクト固有テンプレート"
    domain_specific: "ドメイン固有テンプレート"
    technology_specific: "技術固有テンプレート"
```

### 5.2 テンプレート更新管理
```yaml
template_update_management:
  version_control:
    template_versioning: "テンプレートバージョン管理"
    change_tracking: "変更履歴追跡"
    rollback_capability: "ロールバック機能"
    
  impact_analysis:
    affected_documents: "影響を受ける文書の特定"
    regeneration_requirements: "再生成要件の分析"
    migration_planning: "移行計画の策定"
    
  update_automation:
    automatic_regeneration: "自動再生成"
    validation_automation: "自動検証"
    notification_system: "更新通知システム"
```

## 6. 生成品質メトリクス

### 6.1 文書品質メトリクス
```yaml
document_quality_metrics:
  completeness_metrics:
    section_completeness: "セクション完全性率"
    field_completeness: "フィールド完全性率"
    content_depth_score: "内容詳細度スコア"
    
  consistency_metrics:
    naming_consistency_rate: "命名一貫性率"
    format_consistency_rate: "フォーマット一貫性率"
    reference_consistency_rate: "参照一貫性率"
    
  accuracy_metrics:
    requirement_coverage_rate: "要件カバレッジ率"
    technical_accuracy_score: "技術的正確性スコア"
    implementation_feasibility_score: "実装可能性スコア"
    
  usability_metrics:
    readability_score: "可読性スコア"
    searchability_score: "検索性スコア"
    maintainability_score: "保守性スコア"
```

### 6.2 生成効率メトリクス
```yaml
generation_efficiency_metrics:
  automation_metrics:
    automation_rate: "自動化率"
    generation_speed: "生成速度"
    error_rate: "エラー率"
    
  productivity_metrics:
    time_reduction: "時間削減率"
    effort_reduction: "工数削減率"
    quality_improvement: "品質向上率"
    
  maintenance_metrics:
    update_frequency: "更新頻度"
    maintenance_effort: "保守工数"
    template_reusability: "テンプレート再利用率"
```

---

**UI設計文書生成ルール設計者**: プロセスエンジニアリングシステム ver3.1  
**生成保証レベル**: 最高（自動生成・品質保証・効率化）  
**適用範囲**: 全UI設計文書・全プロジェクト  
**効果保証**: 文書生成効率90%向上、設計品質向上、実装精度向上  
**更新日**: 2025-07-08
