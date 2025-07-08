# STEP1文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象STEP**: STEP1 - 要件定義  

## 1. STEP1文書生成ルール概要

### 1.1 ルール定義
STEP1文書生成ルールは、**要件定義段階で作成すべき全文書の構造・内容・品質基準を軽量ルール形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 生成対象文書
```yaml
step1_target_documents:
  primary_documents:
    - functional_requirements_specification: "機能要件仕様書"
    - non_functional_requirements_specification: "非機能要件仕様書"
    - user_story_backlog: "ユーザーストーリーバックログ"
    - requirements_traceability_matrix: "要件トレーサビリティマトリクス"
    - stakeholder_analysis_document: "ステークホルダー分析書"
  
  supporting_documents:
    - business_process_analysis: "ビジネスプロセス分析書"
    - user_persona_profiles: "ユーザーペルソナプロファイル"
    - acceptance_criteria_specification: "受入基準仕様書"
    - requirements_validation_report: "要件検証レポート"
    - change_management_plan: "変更管理計画"
```

### 1.3 ルール設計原則
```yaml
rule_design_principles:
  lightweight_efficiency: "軽量効率性"
  comprehensive_coverage: "包括的カバレッジ"
  quality_consistency: "品質一貫性"
  scale_adaptability: "規模適応性"
  ai_interpretability: "AI解釈可能性"
```

## 2. 機能要件仕様書生成ルール

### 2.1 文書構造ルール
```yaml
functional_requirements_structure_rule:
  document_metadata:
    rule_id: "FRS_STRUCTURE_001"
    document_type: "functional_requirements_specification"
    target_step: "STEP1"
    size_limit: "300 tokens"
  
  structure_definition:
    sections:
      1_executive_summary:
        purpose: "文書概要と要件サマリー"
        mandatory: true
        subsections:
          - document_purpose: "文書目的"
          - scope_overview: "スコープ概要"
          - key_requirements_summary: "主要要件サマリー"
      
      2_functional_overview:
        purpose: "機能全体像の説明"
        mandatory: true
        subsections:
          - system_context: "システム文脈"
          - functional_architecture: "機能アーキテクチャ"
          - user_interaction_model: "ユーザー相互作用モデル"
      
      3_detailed_requirements:
        purpose: "詳細機能要件の定義"
        mandatory: true
        subsections:
          - core_functions: "核心機能"
          - supporting_functions: "支援機能"
          - administrative_functions: "管理機能"
          - integration_functions: "統合機能"
      
      4_business_rules:
        purpose: "ビジネスルールの定義"
        mandatory: true
        subsections:
          - validation_rules: "検証ルール"
          - calculation_rules: "計算ルール"
          - workflow_rules: "ワークフロールール"
          - authorization_rules: "認可ルール"
      
      5_data_requirements:
        purpose: "データ要件の定義"
        mandatory: true
        subsections:
          - data_entities: "データエンティティ"
          - data_attributes: "データ属性"
          - data_relationships: "データ関係"
          - data_constraints: "データ制約"
      
      6_interface_requirements:
        purpose: "インターフェース要件の定義"
        mandatory: true
        subsections:
          - user_interfaces: "ユーザーインターフェース"
          - system_interfaces: "システムインターフェース"
          - api_requirements: "API要件"
          - integration_points: "統合ポイント"
  
  quality_criteria:
    completeness: "全必須セクション100%"
    consistency: "構造一貫性100%"
    traceability: "ゴール追跡可能性100%"
    testability: "テスト可能性100%"
```

### 2.2 内容生成ルール
```yaml
functional_requirements_content_rule:
  document_metadata:
    rule_id: "FRS_CONTENT_001"
    document_type: "functional_requirements_specification"
    target_step: "STEP1"
    size_limit: "400 tokens"
  
  content_guidelines:
    requirement_specification_format:
      requirement_id: "一意識別子（REQ-FUN-XXX形式）"
      requirement_title: "簡潔で明確なタイトル"
      requirement_description: "具体的で曖昧性のない説明"
      acceptance_criteria: "測定可能な受入基準"
      priority: "MoSCoW優先度（Must/Should/Could/Won't）"
      complexity: "実装複雑度（High/Medium/Low）"
      dependencies: "他要件との依存関係"
      assumptions: "前提条件"
      constraints: "制約条件"
    
    user_story_integration:
      story_mapping: "ユーザーストーリーとの対応"
      epic_relationship: "エピックとの関係"
      persona_alignment: "ペルソナとの整合性"
      journey_mapping: "ユーザージャーニーマッピング"
    
    business_value_articulation:
      value_proposition: "価値提案"
      business_impact: "ビジネス影響"
      roi_contribution: "ROI貢献度"
      risk_mitigation: "リスク軽減効果"
  
  detail_levels:
    essential:
      focus: "核心機能のみ"
      description_depth: "基本的説明"
      examples: "最小限の例"
      validation: "基本検証"
    
    standard:
      focus: "主要機能"
      description_depth: "詳細説明"
      examples: "実践的例"
      validation: "標準検証"
    
    comprehensive:
      focus: "全機能"
      description_depth: "網羅的説明"
      examples: "豊富な例"
      validation: "包括的検証"
```

## 3. 非機能要件仕様書生成ルール

### 3.1 文書構造ルール
```yaml
non_functional_requirements_structure_rule:
  document_metadata:
    rule_id: "NFRS_STRUCTURE_001"
    document_type: "non_functional_requirements_specification"
    target_step: "STEP1"
    size_limit: "250 tokens"
  
  structure_definition:
    sections:
      1_performance_requirements:
        purpose: "システム性能要件の定義"
        mandatory: true
        subsections:
          - response_time_requirements: "応答時間要件"
          - throughput_requirements: "スループット要件"
          - resource_utilization: "リソース利用率"
          - scalability_requirements: "拡張性要件"
      
      2_security_requirements:
        purpose: "セキュリティ要件の定義"
        mandatory: true
        subsections:
          - authentication_requirements: "認証要件"
          - authorization_requirements: "認可要件"
          - data_protection: "データ保護"
          - audit_requirements: "監査要件"
      
      3_usability_requirements:
        purpose: "ユーザビリティ要件の定義"
        mandatory: true
        subsections:
          - user_experience: "ユーザー体験"
          - accessibility: "アクセシビリティ"
          - internationalization: "国際化"
          - help_documentation: "ヘルプ・文書"
      
      4_reliability_requirements:
        purpose: "信頼性要件の定義"
        mandatory: true
        subsections:
          - availability_requirements: "可用性要件"
          - fault_tolerance: "障害耐性"
          - recovery_requirements: "復旧要件"
          - data_integrity: "データ整合性"
      
      5_compliance_requirements:
        purpose: "コンプライアンス要件の定義"
        mandatory: true
        subsections:
          - regulatory_compliance: "規制遵守"
          - industry_standards: "業界標準"
          - internal_policies: "内部ポリシー"
          - audit_compliance: "監査遵守"
```

### 3.2 内容生成ルール
```yaml
non_functional_requirements_content_rule:
  document_metadata:
    rule_id: "NFRS_CONTENT_001"
    document_type: "non_functional_requirements_specification"
    target_step: "STEP1"
    size_limit: "350 tokens"
  
  content_guidelines:
    requirement_specification_format:
      requirement_id: "一意識別子（REQ-NFR-XXX形式）"
      category: "NFRカテゴリー（Performance/Security/Usability等）"
      requirement_statement: "測定可能な要件記述"
      measurement_criteria: "測定基準・方法"
      target_values: "目標値・閾値"
      test_conditions: "テスト条件"
      priority: "ビジネス優先度"
      rationale: "要件根拠"
    
    measurability_guidelines:
      quantitative_metrics: "定量的メトリクス定義"
      measurement_methods: "測定方法明確化"
      baseline_establishment: "ベースライン確立"
      target_setting: "目標値設定"
      validation_approach: "検証アプローチ"
    
    constraint_documentation:
      technical_constraints: "技術制約"
      business_constraints: "ビジネス制約"
      regulatory_constraints: "規制制約"
      resource_constraints: "リソース制約"
  
  quality_standards:
    measurability: "測定可能性100%"
    achievability: "達成可能性検証済み"
    relevance: "ビジネス関連性100%"
    testability: "テスト可能性100%"
```

## 4. ユーザーストーリーバックログ生成ルール

### 4.1 文書構造ルール
```yaml
user_story_backlog_structure_rule:
  document_metadata:
    rule_id: "USB_STRUCTURE_001"
    document_type: "user_story_backlog"
    target_step: "STEP1"
    size_limit: "200 tokens"
  
  structure_definition:
    sections:
      1_epic_overview:
        purpose: "エピック概要と構成"
        mandatory: true
        subsections:
          - epic_definition: "エピック定義"
          - epic_goals: "エピック目標"
          - epic_acceptance_criteria: "エピック受入基準"
      
      2_user_stories:
        purpose: "詳細ユーザーストーリー"
        mandatory: true
        subsections:
          - story_details: "ストーリー詳細"
          - acceptance_criteria: "受入基準"
          - definition_of_done: "完了の定義"
      
      3_story_mapping:
        purpose: "ストーリーマッピング"
        mandatory: true
        subsections:
          - user_journey: "ユーザージャーニー"
          - story_prioritization: "ストーリー優先度"
          - release_planning: "リリース計画"
      
      4_estimation_planning:
        purpose: "見積もりと計画"
        mandatory: true
        subsections:
          - story_points: "ストーリーポイント"
          - effort_estimation: "工数見積もり"
          - velocity_planning: "ベロシティ計画"
```

### 4.2 内容生成ルール
```yaml
user_story_content_rule:
  document_metadata:
    rule_id: "USB_CONTENT_001"
    document_type: "user_story_backlog"
    target_step: "STEP1"
    size_limit: "300 tokens"
  
  content_guidelines:
    story_format:
      user_story_template: "As a [user type], I want [functionality] so that [benefit]"
      story_id: "一意識別子（US-XXX形式）"
      epic_reference: "所属エピック"
      persona_alignment: "対象ペルソナ"
      business_value: "ビジネス価値"
      story_points: "相対見積もり"
      priority: "優先度（High/Medium/Low）"
    
    acceptance_criteria_format:
      given_when_then: "Given-When-Then形式"
      measurable_outcomes: "測定可能な成果"
      edge_cases: "エッジケース考慮"
      negative_scenarios: "ネガティブシナリオ"
    
    quality_attributes:
      independent: "独立性（他ストーリーに依存しない）"
      negotiable: "交渉可能性（詳細は後で決定可能）"
      valuable: "価値提供（ユーザーに価値を提供）"
      estimable: "見積もり可能性（サイズ見積もり可能）"
      small: "適切なサイズ（1スプリントで完了可能）"
      testable: "テスト可能性（受入テスト作成可能）"
  
  detail_levels:
    essential:
      story_scope: "核心ストーリーのみ"
      criteria_depth: "基本受入基準"
      examples: "最小限の例"
    
    standard:
      story_scope: "主要ストーリー"
      criteria_depth: "詳細受入基準"
      examples: "実践的例"
    
    comprehensive:
      story_scope: "全ストーリー"
      criteria_depth: "包括的受入基準"
      examples: "豊富な例とシナリオ"
```

## 5. 要件トレーサビリティマトリクス生成ルール

### 5.1 文書構造ルール
```yaml
traceability_matrix_structure_rule:
  document_metadata:
    rule_id: "RTM_STRUCTURE_001"
    document_type: "requirements_traceability_matrix"
    target_step: "STEP1"
    size_limit: "150 tokens"
  
  structure_definition:
    sections:
      1_traceability_overview:
        purpose: "トレーサビリティ概要"
        mandatory: true
        subsections:
          - matrix_purpose: "マトリクス目的"
          - traceability_scope: "トレーサビリティスコープ"
          - maintenance_approach: "保守アプローチ"
      
      2_forward_traceability:
        purpose: "前方トレーサビリティ"
        mandatory: true
        subsections:
          - goals_to_requirements: "ゴール→要件"
          - requirements_to_stories: "要件→ストーリー"
          - stories_to_tasks: "ストーリー→タスク"
      
      3_backward_traceability:
        purpose: "後方トレーサビリティ"
        mandatory: true
        subsections:
          - tasks_to_stories: "タスク→ストーリー"
          - stories_to_requirements: "ストーリー→要件"
          - requirements_to_goals: "要件→ゴール"
      
      4_impact_analysis:
        purpose: "影響分析"
        mandatory: true
        subsections:
          - change_impact: "変更影響"
          - dependency_analysis: "依存関係分析"
          - coverage_analysis: "カバレッジ分析"
```

### 5.2 内容生成ルール
```yaml
traceability_matrix_content_rule:
  document_metadata:
    rule_id: "RTM_CONTENT_001"
    document_type: "requirements_traceability_matrix"
    target_step: "STEP1"
    size_limit: "200 tokens"
  
  content_guidelines:
    matrix_format:
      source_item: "トレース元項目"
      target_item: "トレース先項目"
      relationship_type: "関係タイプ（derives/satisfies/implements）"
      relationship_strength: "関係強度（Strong/Medium/Weak）"
      verification_method: "検証方法"
      status: "ステータス（Active/Inactive/Pending）"
    
    coverage_metrics:
      forward_coverage: "前方カバレッジ率"
      backward_coverage: "後方カバレッジ率"
      orphan_items: "孤立項目"
      missing_links: "欠落リンク"
    
    maintenance_guidelines:
      update_triggers: "更新トリガー"
      validation_frequency: "検証頻度"
      responsibility_matrix: "責任マトリクス"
      change_notification: "変更通知"
  
  quality_standards:
    completeness: "トレーサビリティ100%"
    accuracy: "関係正確性100%"
    currency: "最新性保証"
    accessibility: "アクセス容易性"
```

## 6. 品質保証ルール

### 6.1 文書品質基準
```yaml
document_quality_standards:
  content_quality:
    clarity: "明確性100%（曖昧性なし）"
    completeness: "完全性100%（必須項目全て）"
    consistency: "一貫性100%（用語・形式統一）"
    correctness: "正確性100%（事実・技術正確）"
    currency: "最新性100%（情報更新済み）"
  
  structure_quality:
    template_compliance: "テンプレート準拠100%"
    section_completeness: "セクション完全性100%"
    logical_flow: "論理的流れ100%"
    cross_reference_accuracy: "相互参照正確性100%"
  
  usability_quality:
    readability: "可読性95%以上"
    navigability: "ナビゲーション容易性95%以上"
    searchability: "検索容易性95%以上"
    maintainability: "保守容易性95%以上"
```

### 6.2 自動品質チェック
```yaml
automated_quality_checks:
  structural_validation:
    - required_sections_present: "必須セクション存在確認"
    - template_compliance_check: "テンプレート準拠性チェック"
    - cross_reference_validation: "相互参照検証"
    - format_consistency_check: "フォーマット一貫性チェック"
  
  content_validation:
    - completeness_verification: "完全性検証"
    - terminology_consistency: "用語一貫性確認"
    - requirement_id_uniqueness: "要件ID一意性確認"
    - traceability_link_validation: "トレーサビリティリンク検証"
  
  quality_metrics:
    - readability_score: "可読性スコア"
    - complexity_index: "複雑度指数"
    - coverage_percentage: "カバレッジ率"
    - consistency_rating: "一貫性評価"
```

---

**STEP1文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下で完全品質  
**更新日**: 2025-07-01
