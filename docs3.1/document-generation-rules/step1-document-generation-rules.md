# STEP1 要件定義文書生成ルール

**バージョン**: 3.1.0  
**作成日**: 2025-07-08  
**理論分類**: 文書生成ルール層  
**文書種別**: STEP1要件定義文書自動生成ルール  
**改善レベル**: 実証実験問題根本解決版  

## 1. STEP1文書生成ルール概要

### 1.1 ルール定義
STEP1要件定義文書生成ルールは、プロセスエンジニアリング理論ver3.1における**STEP1要件定義段階の文書自動生成を体系化し、実証実験で発見された要件定義品質問題を根本解決**する包括的文書生成ルールである。

### 1.2 実証実験で発見された要件定義文書問題
```yaml
requirements_definition_problems:
  incomplete_requirements_specification:
    problem: "要件仕様の不完全性"
    manifestation: "機能要件・非機能要件の記述不足"
    root_cause: "体系的な要件抽出プロセス不在"
    impact: "設計・実装段階での要件解釈違い"
    
  inconsistent_requirements_format:
    problem: "要件記述フォーマットの不統一"
    manifestation: "文書間での記述方式・詳細度の違い"
    root_cause: "統一的な要件記述テンプレート不在"
    impact: "要件理解困難・トレーサビリティ低下"
    
  missing_acceptance_criteria:
    problem: "受入基準の不明確性"
    manifestation: "テスト可能な受入基準の不足"
    root_cause: "受入基準定義プロセスの体系化不足"
    impact: "テスト設計困難・品質評価基準不明確"
    
  inadequate_stakeholder_analysis:
    problem: "ステークホルダー分析不足"
    manifestation: "利害関係者の要求分析不十分"
    root_cause: "ステークホルダー分析手法の標準化不足"
    impact: "要件漏れ・利害関係者満足度低下"
```

## 2. STEP1文書生成階層

### 2.1 要件定義文書階層
```yaml
requirements_document_hierarchy:
  level_1_stakeholder_analysis:
    document_type: "ステークホルダー分析書"
    generation_trigger: "プロジェクト開始時"
    content_scope: "利害関係者特定・要求分析・影響度評価"
    detail_level: "分析レベル"
    dependencies: ["プロジェクト憲章", "ビジネス要求"]
    
  level_2_business_requirements:
    document_type: "ビジネス要件定義書"
    generation_trigger: "ステークホルダー分析完了時"
    content_scope: "ビジネス目標・制約条件・成功基準"
    detail_level: "ビジネスレベル"
    dependencies: ["ステークホルダー分析書"]
    
  level_3_functional_requirements:
    document_type: "機能要件定義書"
    generation_trigger: "ビジネス要件承認時"
    content_scope: "機能仕様・ユーザーストーリー・ユースケース"
    detail_level: "機能レベル"
    dependencies: ["ビジネス要件定義書"]
    
  level_4_non_functional_requirements:
    document_type: "非機能要件定義書"
    generation_trigger: "機能要件定義完了時"
    content_scope: "性能・セキュリティ・可用性・保守性要件"
    detail_level: "技術レベル"
    dependencies: ["機能要件定義書"]
    
  level_5_acceptance_criteria:
    document_type: "受入基準定義書"
    generation_trigger: "要件定義完了時"
    content_scope: "テスト可能な受入基準・検証方法"
    detail_level: "検証レベル"
    dependencies: ["機能要件定義書", "非機能要件定義書"]
```

### 2.2 文書間依存関係管理
```yaml
document_dependency_management:
  forward_traceability:
    stakeholder_to_business: "ステークホルダー要求 → ビジネス要件"
    business_to_functional: "ビジネス要件 → 機能要件"
    functional_to_acceptance: "機能要件 → 受入基準"
    
  backward_traceability:
    acceptance_to_functional: "受入基準 → 機能要件"
    functional_to_business: "機能要件 → ビジネス要件"
    business_to_stakeholder: "ビジネス要件 → ステークホルダー要求"
    
  cross_reference_validation:
    consistency_check: "文書間の整合性確認"
    completeness_check: "要件カバレッジ確認"
    conflict_detection: "要件競合の検出"
```

## 3. 文書生成ルール詳細

### 3.1 ステークホルダー分析書生成ルール
```yaml
stakeholder_analysis_generation_rules:
  document_structure:
    metadata_section:
      required_fields:
        - "document_id: string"
        - "project_name: string"
        - "analysis_date: date"
        - "analyst_name: string"
        - "review_cycle: string"
        
    stakeholder_inventory_section:
      required_fields:
        - "stakeholder_id: string"
        - "stakeholder_name: string"
        - "stakeholder_type: enum"
        - "organization: string"
        - "role_responsibility: string"
        - "contact_information: object"
        
    influence_analysis_section:
      required_fields:
        - "influence_level: enum"
        - "interest_level: enum"
        - "decision_authority: enum"
        - "communication_preference: string"
        - "engagement_strategy: string"
        
    requirements_analysis_section:
      required_fields:
        - "primary_needs: string[]"
        - "success_criteria: string[]"
        - "constraints: string[]"
        - "assumptions: string[]"
        - "risks: string[]"
        
  generation_template: |
    # {project_name} ステークホルダー分析書
    
    ## 1. 分析概要
    ### 1.1 分析目的
    {analysis_purpose}
    
    ### 1.2 分析範囲
    {analysis_scope}
    
    ## 2. ステークホルダー一覧
    {stakeholder_inventory}
    
    ## 3. 影響度・関心度分析
    {influence_interest_matrix}
    
    ## 4. 要求分析
    {requirements_analysis}
    
    ## 5. エンゲージメント戦略
    {engagement_strategy}
    
  validation_rules:
    completeness_validation:
      - "全ステークホルダーの特定完了"
      - "影響度・関心度の評価完了"
      - "要求分析の実施完了"
      
    consistency_validation:
      - "ステークホルダー分類の一貫性"
      - "要求間の整合性"
      - "エンゲージメント戦略の適切性"
```

### 3.2 機能要件定義書生成ルール
```yaml
functional_requirements_generation_rules:
  document_structure:
    requirements_overview_section:
      required_fields:
        - "requirement_id: string"
        - "requirement_name: string"
        - "requirement_category: enum"
        - "priority: enum"
        - "complexity: enum"
        - "effort_estimate: number"
        
    detailed_specification_section:
      required_fields:
        - "description: string"
        - "rationale: string"
        - "assumptions: string[]"
        - "constraints: string[]"
        - "dependencies: string[]"
        
    user_story_section:
      required_fields:
        - "user_role: string"
        - "user_goal: string"
        - "user_benefit: string"
        - "acceptance_criteria: string[]"
        - "definition_of_done: string[]"
        
    use_case_section:
      required_fields:
        - "use_case_id: string"
        - "use_case_name: string"
        - "actors: string[]"
        - "preconditions: string[]"
        - "main_flow: string[]"
        - "alternative_flows: object[]"
        - "postconditions: string[]"
        
  generation_template: |
    # {project_name} 機能要件定義書
    
    ## 1. 要件概要
    ### 1.1 機能要件一覧
    {requirements_overview}
    
    ### 1.2 要件分類
    {requirements_categorization}
    
    ## 2. 詳細仕様
    {detailed_specifications}
    
    ## 3. ユーザーストーリー
    {user_stories}
    
    ## 4. ユースケース
    {use_cases}
    
    ## 5. 機能マップ
    {functional_map}
    
  quality_criteria:
    testability: "テスト可能な形式での記述"
    measurability: "測定可能な基準の設定"
    completeness: "必要な情報の完全性"
    consistency: "要件間の整合性"
    traceability: "上位要件との追跡可能性"
```

### 3.3 非機能要件定義書生成ルール
```yaml
non_functional_requirements_generation_rules:
  document_structure:
    performance_requirements_section:
      required_fields:
        - "response_time: object"
        - "throughput: object"
        - "resource_utilization: object"
        - "scalability: object"
        - "load_capacity: object"
        
    security_requirements_section:
      required_fields:
        - "authentication: object"
        - "authorization: object"
        - "data_protection: object"
        - "communication_security: object"
        - "audit_logging: object"
        
    availability_requirements_section:
      required_fields:
        - "uptime_target: number"
        - "recovery_time: object"
        - "backup_strategy: object"
        - "disaster_recovery: object"
        - "maintenance_windows: object"
        
    usability_requirements_section:
      required_fields:
        - "user_experience: object"
        - "accessibility: object"
        - "internationalization: object"
        - "browser_compatibility: object"
        - "mobile_responsiveness: object"
        
    maintainability_requirements_section:
      required_fields:
        - "code_quality: object"
        - "documentation: object"
        - "monitoring: object"
        - "deployment: object"
        - "support: object"
        
  generation_template: |
    # {project_name} 非機能要件定義書
    
    ## 1. パフォーマンス要件
    {performance_requirements}
    
    ## 2. セキュリティ要件
    {security_requirements}
    
    ## 3. 可用性要件
    {availability_requirements}
    
    ## 4. ユーザビリティ要件
    {usability_requirements}
    
    ## 5. 保守性要件
    {maintainability_requirements}
    
    ## 6. その他の品質要件
    {other_quality_requirements}
    
  measurement_criteria:
    quantitative_metrics: "定量的な測定基準の設定"
    verification_methods: "検証方法の明確化"
    acceptance_thresholds: "受入閾値の定義"
    monitoring_strategy: "監視戦略の策定"
```

### 3.4 受入基準定義書生成ルール
```yaml
acceptance_criteria_generation_rules:
  document_structure:
    functional_acceptance_section:
      required_fields:
        - "feature_id: string"
        - "feature_name: string"
        - "acceptance_scenarios: object[]"
        - "test_conditions: string[]"
        - "expected_results: string[]"
        - "verification_methods: string[]"
        
    non_functional_acceptance_section:
      required_fields:
        - "performance_criteria: object[]"
        - "security_criteria: object[]"
        - "usability_criteria: object[]"
        - "reliability_criteria: object[]"
        
    business_acceptance_section:
      required_fields:
        - "business_value: string"
        - "success_metrics: object[]"
        - "roi_criteria: object"
        - "stakeholder_satisfaction: object[]"
        
  generation_template: |
    # {project_name} 受入基準定義書
    
    ## 1. 機能受入基準
    {functional_acceptance_criteria}
    
    ## 2. 非機能受入基準
    {non_functional_acceptance_criteria}
    
    ## 3. ビジネス受入基準
    {business_acceptance_criteria}
    
    ## 4. 受入テスト計画
    {acceptance_test_plan}
    
    ## 5. 受入プロセス
    {acceptance_process}
    
  testability_requirements:
    automated_testing: "自動テスト可能な基準"
    manual_testing: "手動テスト要件"
    performance_testing: "性能テスト基準"
    security_testing: "セキュリティテスト基準"
    user_acceptance_testing: "ユーザー受入テスト基準"
```

## 4. 自動生成システム

### 4.1 生成プロセス設計
```yaml
generation_process_design:
  input_analysis:
    stakeholder_interviews: "ステークホルダーインタビュー結果"
    business_documents: "既存ビジネス文書"
    system_constraints: "システム制約条件"
    regulatory_requirements: "法規制要件"
    
  content_extraction:
    requirement_mining: "要件マイニング"
    priority_analysis: "優先度分析"
    dependency_analysis: "依存関係分析"
    risk_assessment: "リスク評価"
    
  document_generation:
    template_application: "テンプレート適用"
    content_population: "コンテンツ生成"
    cross_reference_creation: "相互参照作成"
    validation_execution: "検証実行"
    
  quality_assurance:
    completeness_check: "完全性チェック"
    consistency_validation: "整合性検証"
    traceability_verification: "追跡可能性確認"
    stakeholder_review: "ステークホルダーレビュー"
```

### 4.2 品質保証メカニズム
```yaml
quality_assurance_mechanisms:
  automated_validation:
    structure_validation: "文書構造の検証"
    content_validation: "コンテンツの検証"
    reference_validation: "参照関係の検証"
    format_validation: "フォーマットの検証"
    
  manual_review_process:
    peer_review: "同僚レビュー"
    expert_review: "専門家レビュー"
    stakeholder_review: "ステークホルダーレビュー"
    final_approval: "最終承認"
    
  continuous_improvement:
    feedback_collection: "フィードバック収集"
    template_refinement: "テンプレート改善"
    process_optimization: "プロセス最適化"
    metrics_analysis: "メトリクス分析"
```

## 5. 品質メトリクス

### 5.1 要件品質メトリクス
```yaml
requirements_quality_metrics:
  completeness_metrics:
    requirement_coverage: "要件カバレッジ率"
    stakeholder_coverage: "ステークホルダーカバレッジ率"
    functional_coverage: "機能カバレッジ率"
    non_functional_coverage: "非機能要件カバレッジ率"
    
  consistency_metrics:
    terminology_consistency: "用語一貫性率"
    format_consistency: "フォーマット一貫性率"
    level_consistency: "詳細度一貫性率"
    
  traceability_metrics:
    forward_traceability: "前方追跡可能性率"
    backward_traceability: "後方追跡可能性率"
    cross_reference_accuracy: "相互参照正確性率"
    
  testability_metrics:
    testable_requirements: "テスト可能要件率"
    measurable_criteria: "測定可能基準率"
    verifiable_acceptance: "検証可能受入基準率"
```

### 5.2 生成効率メトリクス
```yaml
generation_efficiency_metrics:
  automation_metrics:
    generation_automation_rate: "生成自動化率"
    validation_automation_rate: "検証自動化率"
    review_automation_rate: "レビュー自動化率"
    
  productivity_metrics:
    generation_speed: "生成速度"
    review_efficiency: "レビュー効率"
    revision_frequency: "修正頻度"
    
  quality_metrics:
    first_time_quality: "初回品質率"
    defect_density: "欠陥密度"
    stakeholder_satisfaction: "ステークホルダー満足度"
```

---

**STEP1要件定義文書生成ルール設計者**: プロセスエンジニアリングシステム ver3.1  
**生成保証レベル**: 最高（自動生成・品質保証・トレーサビリティ確保）  
**適用範囲**: 全要件定義文書・全プロジェクト  
**効果保証**: 要件品質向上、生成効率化、ステークホルダー満足度向上  
**更新日**: 2025-07-08
