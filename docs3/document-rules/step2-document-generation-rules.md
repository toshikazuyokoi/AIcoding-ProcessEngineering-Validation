# STEP2文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP2 - システム設計  

## 1. STEP2文書生成ルール概要

### 1.1 ルール定義
STEP2文書生成ルールは、**システム設計段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step2_document_generation_objectives:
  primary_purpose: "システム設計段階の文書生成自動化"
  
  specific_goals:
    - architecture_documentation_automation: "アーキテクチャ文書自動化"
    - design_consistency_assurance: "設計一貫性保証"
    - technical_specification_standardization: "技術仕様標準化"
    - implementation_guidance_generation: "実装ガイダンス生成"
    - quality_validation_automation: "品質検証自動化"
```

### 1.3 適用範囲
```yaml
step2_application_scope:
  target_documents:
    - system_architecture_specification: "システムアーキテクチャ仕様"
    - technology_stack_specification: "技術スタック仕様"
    - component_design_specification: "コンポーネント設計仕様"
    - interface_design_specification: "インターフェース設計仕様"
    - data_architecture_specification: "データアーキテクチャ仕様"
    - security_architecture_specification: "セキュリティアーキテクチャ仕様"
    - deployment_architecture_specification: "デプロイアーキテクチャ仕様"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 システムアーキテクチャ仕様生成ルール
```yaml
system_architecture_specification_rules:
  document_metadata:
    document_type: "system_architecture_specification"
    template_id: "SAS_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG2"
  
  structure_rules:
    sections:
      - section_id: "architecture_overview"
        title: "アーキテクチャ概要"
        mandatory: true
        content_type: "architectural_description"
        includes: ["architectural_vision", "design_principles", "architectural_constraints"]
      
      - section_id: "system_context"
        title: "システムコンテキスト"
        mandatory: true
        content_type: "context_diagram"
        includes: ["system_boundaries", "external_systems", "user_groups"]
      
      - section_id: "architectural_views"
        title: "アーキテクチャビュー"
        mandatory: true
        content_type: "multi_view_architecture"
        includes: ["logical_view", "process_view", "development_view", "physical_view"]
      
      - section_id: "component_architecture"
        title: "コンポーネントアーキテクチャ"
        mandatory: true
        content_type: "component_specification"
        includes: ["component_catalog", "component_relationships", "component_interfaces"]
      
      - section_id: "data_architecture"
        title: "データアーキテクチャ"
        mandatory: true
        content_type: "data_specification"
        includes: ["data_model", "data_flow", "data_storage"]
      
      - section_id: "integration_architecture"
        title: "統合アーキテクチャ"
        mandatory: true
        content_type: "integration_specification"
        includes: ["integration_patterns", "communication_protocols", "message_formats"]
      
      - section_id: "quality_attributes"
        title: "品質属性"
        mandatory: true
        content_type: "quality_specification"
        includes: ["performance_requirements", "scalability_design", "reliability_design"]
  
  content_generation_rules:
    architecture_overview:
      generation_method: "architectural_synthesis"
      input_sources:
        - "functional_requirements"
        - "non_functional_requirements"
        - "architectural_patterns"
        - "design_constraints"
      quality_criteria:
        - architectural_coherence: "アーキテクチャ一貫性100%"
        - design_rationale: "設計根拠明確性100%"
        - constraint_compliance: "制約準拠100%"
    
    component_architecture:
      generation_method: "component_decomposition"
      input_sources:
        - "functional_decomposition"
        - "responsibility_assignment"
        - "interface_requirements"
      quality_criteria:
        - component_cohesion: "コンポーネント凝集度95%以上"
        - interface_clarity: "インターフェース明確性100%"
        - dependency_optimization: "依存関係最適化100%"
    
    integration_architecture:
      generation_method: "integration_design"
      input_sources:
        - "system_interfaces"
        - "integration_requirements"
        - "communication_patterns"
      quality_criteria:
        - integration_consistency: "統合一貫性100%"
        - protocol_standardization: "プロトコル標準化100%"
        - error_handling_completeness: "エラーハンドリング完全性100%"
```

### 2.2 技術スタック仕様生成ルール
```yaml
technology_stack_specification_rules:
  document_metadata:
    document_type: "technology_stack_specification"
    template_id: "TSS_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG2"
  
  structure_rules:
    sections:
      - section_id: "technology_overview"
        title: "技術概要"
        mandatory: true
        content_type: "technology_summary"
        includes: ["technology_vision", "selection_criteria", "technology_constraints"]
      
      - section_id: "application_layer_technologies"
        title: "アプリケーション層技術"
        mandatory: true
        content_type: "technology_specification"
        includes: ["frameworks", "libraries", "development_tools"]
      
      - section_id: "data_layer_technologies"
        title: "データ層技術"
        mandatory: true
        content_type: "data_technology_specification"
        includes: ["databases", "data_processing", "data_storage"]
      
      - section_id: "infrastructure_technologies"
        title: "インフラ技術"
        mandatory: true
        content_type: "infrastructure_specification"
        includes: ["cloud_platforms", "containerization", "orchestration"]
      
      - section_id: "development_technologies"
        title: "開発技術"
        mandatory: true
        content_type: "development_toolchain"
        includes: ["development_environment", "build_tools", "testing_frameworks"]
      
      - section_id: "monitoring_technologies"
        title: "監視技術"
        mandatory: true
        content_type: "monitoring_specification"
        includes: ["logging", "metrics", "alerting"]
      
      - section_id: "security_technologies"
        title: "セキュリティ技術"
        mandatory: true
        content_type: "security_technology_specification"
        includes: ["authentication", "authorization", "encryption"]
  
  content_generation_rules:
    technology_selection:
      generation_method: "technology_evaluation"
      input_sources:
        - "technical_requirements"
        - "performance_requirements"
        - "scalability_requirements"
        - "team_capabilities"
      quality_criteria:
        - selection_rationale: "選定根拠明確性100%"
        - compatibility_verification: "互換性検証100%"
        - maturity_assessment: "成熟度評価100%"
    
    technology_integration:
      generation_method: "integration_analysis"
      input_sources:
        - "technology_dependencies"
        - "integration_patterns"
        - "compatibility_matrix"
      quality_criteria:
        - integration_feasibility: "統合実現可能性100%"
        - dependency_management: "依存関係管理100%"
        - version_compatibility: "バージョン互換性100%"
```

### 2.3 インターフェース設計仕様生成ルール
```yaml
interface_design_specification_rules:
  document_metadata:
    document_type: "interface_design_specification"
    template_id: "IDS_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG2"
  
  structure_rules:
    sections:
      - section_id: "interface_overview"
        title: "インターフェース概要"
        mandatory: true
        content_type: "interface_summary"
        includes: ["interface_catalog", "interface_types", "design_principles"]
      
      - section_id: "api_specifications"
        title: "API仕様"
        mandatory: true
        content_type: "api_specification"
        includes: ["rest_apis", "graphql_apis", "rpc_interfaces"]
      
      - section_id: "data_contracts"
        title: "データ契約"
        mandatory: true
        content_type: "data_contract_specification"
        includes: ["request_schemas", "response_schemas", "data_validation"]
      
      - section_id: "communication_protocols"
        title: "通信プロトコル"
        mandatory: true
        content_type: "protocol_specification"
        includes: ["http_protocols", "messaging_protocols", "streaming_protocols"]
      
      - section_id: "error_handling"
        title: "エラーハンドリング"
        mandatory: true
        content_type: "error_specification"
        includes: ["error_codes", "error_messages", "error_recovery"]
      
      - section_id: "security_specifications"
        title: "セキュリティ仕様"
        mandatory: true
        content_type: "security_specification"
        includes: ["authentication_methods", "authorization_rules", "data_protection"]
      
      - section_id: "versioning_strategy"
        title: "バージョニング戦略"
        mandatory: true
        content_type: "versioning_specification"
        includes: ["version_management", "backward_compatibility", "migration_strategy"]
  
  content_generation_rules:
    api_specification:
      generation_method: "api_design"
      input_sources:
        - "functional_requirements"
        - "data_requirements"
        - "integration_requirements"
      quality_criteria:
        - api_consistency: "API一貫性100%"
        - documentation_completeness: "文書完全性100%"
        - usability_optimization: "使いやすさ最適化100%"
    
    data_contract_definition:
      generation_method: "contract_specification"
      input_sources:
        - "data_models"
        - "business_rules"
        - "validation_requirements"
      quality_criteria:
        - schema_accuracy: "スキーマ正確性100%"
        - validation_completeness: "検証完全性100%"
        - contract_clarity: "契約明確性100%"
```

## 3. 品質保証ルール

### 3.1 設計品質基準
```yaml
design_quality_standards:
  architectural_quality:
    coherence_standards:
      - architectural_consistency: "アーキテクチャ一貫性100%"
      - design_principle_adherence: "設計原則準拠100%"
      - pattern_application_consistency: "パターン適用一貫性100%"
      - constraint_compliance: "制約準拠100%"
    
    modularity_standards:
      - component_cohesion: "コンポーネント凝集度95%以上"
      - component_coupling: "コンポーネント結合度最小化"
      - interface_clarity: "インターフェース明確性100%"
      - dependency_optimization: "依存関係最適化100%"
  
  technical_quality:
    feasibility_standards:
      - implementation_feasibility: "実装実現可能性100%"
      - performance_achievability: "性能達成可能性100%"
      - scalability_potential: "拡張性ポテンシャル100%"
      - maintainability_assurance: "保守性保証100%"
    
    integration_standards:
      - integration_consistency: "統合一貫性100%"
      - protocol_standardization: "プロトコル標準化100%"
      - data_consistency: "データ一貫性100%"
      - error_handling_completeness: "エラーハンドリング完全性100%"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - section_completeness_check: "セクション完全性チェック"
      - mandatory_content_verification: "必須内容検証"
      - cross_reference_validation: "相互参照検証"
      - diagram_consistency_check: "図表一貫性チェック"
    
    content_validation:
      - technical_accuracy_verification: "技術正確性検証"
      - design_consistency_check: "設計一貫性チェック"
      - requirement_traceability_validation: "要件追跡可能性検証"
      - interface_specification_validation: "インターフェース仕様検証"
    
    quality_metrics:
      - architectural_coherence_score: "アーキテクチャ一貫性スコア"
      - technical_feasibility_score: "技術実現可能性スコア"
      - documentation_completeness_score: "文書完全性スコア"
      - implementation_readiness_score: "実装準備性スコア"
  
  expert_review_points:
    architectural_review:
      - design_pattern_appropriateness: "設計パターン適切性"
      - scalability_architecture_validation: "拡張性アーキテクチャ検証"
      - security_architecture_assessment: "セキュリティアーキテクチャ評価"
      - performance_architecture_evaluation: "性能アーキテクチャ評価"
    
    technical_review:
      - technology_selection_validation: "技術選定検証"
      - integration_strategy_assessment: "統合戦略評価"
      - implementation_approach_review: "実装アプローチレビュー"
      - risk_mitigation_evaluation: "リスク軽減評価"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    system_architecture_specification:
      sections: ["architecture_overview", "component_architecture", "integration_architecture"]
      content_depth: "high_level_only"
      detail_level: "essential"
    
    technology_stack_specification:
      sections: ["technology_overview", "application_layer_technologies", "infrastructure_technologies"]
      content_depth: "core_technologies"
      detail_level: "basic"
    
    interface_design_specification:
      sections: ["interface_overview", "api_specifications", "data_contracts"]
      content_depth: "essential_interfaces"
      detail_level: "simplified"
  
  content_simplification:
    diagram_reduction: "核心図表のみ"
    analysis_depth: "基本レベル"
    specification_detail: "必須仕様のみ"
    example_count: "最小限"
  
  quality_maintenance:
    core_quality_preserved: "核心品質保持"
    essential_accuracy: "必須正確性100%"
    basic_consistency: "基本一貫性100%"
    simplified_completeness: "簡素化完全性100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    system_architecture_specification:
      sections: "all_core_sections"
      content_depth: "detailed"
      detail_level: "comprehensive"
    
    technology_stack_specification:
      sections: "all_sections"
      content_depth: "complete_stack"
      detail_level: "detailed"
    
    interface_design_specification:
      sections: "all_sections"
      content_depth: "complete_interfaces"
      detail_level: "comprehensive"
  
  content_enhancement:
    diagram_expansion: "詳細図表"
    analysis_depth: "詳細レベル"
    specification_detail: "包括的仕様"
    example_inclusion: "実践的例"
  
  quality_standards:
    full_quality_application: "完全品質適用"
    detailed_accuracy: "詳細正確性100%"
    comprehensive_consistency: "包括的一貫性100%"
    complete_completeness: "完全完全性100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    system_architecture_specification:
      sections: "all_sections_plus_detailed_analysis"
      content_depth: "enterprise_level"
      detail_level: "exhaustive"
    
    technology_stack_specification:
      sections: "all_sections_plus_enterprise_considerations"
      content_depth: "enterprise_stack"
      detail_level: "strategic"
    
    interface_design_specification:
      sections: "all_sections_plus_governance"
      content_depth: "enterprise_interfaces"
      detail_level: "enterprise"
  
  content_maximization:
    diagram_elaboration: "包括的図表"
    analysis_depth: "戦略的レベル"
    specification_detail: "エンタープライズ仕様"
    example_abundance: "豊富な例"
  
  quality_excellence:
    premium_quality_application: "プレミアム品質適用"
    enterprise_accuracy: "エンタープライズ正確性100%"
    strategic_consistency: "戦略的一貫性100%"
    exhaustive_completeness: "網羅的完全性100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    requirement_analysis:
      - functional_requirement_extraction: "機能要件抽出"
      - non_functional_requirement_analysis: "非機能要件分析"
      - constraint_identification: "制約特定"
      - quality_attribute_specification: "品質属性仕様"
    
    architectural_synthesis:
      - pattern_selection: "パターン選択"
      - component_identification: "コンポーネント特定"
      - interface_design: "インターフェース設計"
      - integration_strategy: "統合戦略"
  
  generation_engine:
    architectural_generation:
      - structure_generation: "構造生成"
      - component_specification: "コンポーネント仕様"
      - interface_definition: "インターフェース定義"
      - integration_design: "統合設計"
    
    technical_specification:
      - technology_selection: "技術選定"
      - configuration_specification: "設定仕様"
      - deployment_design: "デプロイ設計"
      - monitoring_specification: "監視仕様"
  
  output_validation:
    architectural_validation:
      - consistency_verification: "一貫性検証"
      - feasibility_assessment: "実現可能性評価"
      - quality_attribute_validation: "品質属性検証"
      - integration_verification: "統合検証"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  design_engine:
    architectural_analyzer: "アーキテクチャ分析器"
    pattern_matcher: "パターンマッチャー"
    component_designer: "コンポーネント設計器"
    integration_planner: "統合計画器"
  
  specification_generator:
    document_synthesizer: "文書合成器"
    diagram_generator: "図表生成器"
    specification_formatter: "仕様フォーマッター"
    quality_validator: "品質検証器"
  
  validation_layer:
    architectural_validator: "アーキテクチャ検証器"
    technical_validator: "技術検証器"
    consistency_checker: "一貫性チェッカー"
    completeness_verifier: "完全性検証器"
```

---

**STEP2文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
