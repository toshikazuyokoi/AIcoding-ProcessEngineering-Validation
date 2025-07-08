# STEP3文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP3 - 詳細設計  

## 1. STEP3文書生成ルール概要

### 1.1 ルール定義
STEP3文書生成ルールは、**詳細設計段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step3_document_generation_objectives:
  primary_purpose: "詳細設計段階の文書生成自動化"
  
  specific_goals:
    - detailed_design_specification_automation: "詳細設計仕様自動化"
    - implementation_blueprint_generation: "実装設計図生成"
    - interface_specification_standardization: "インターフェース仕様標準化"
    - data_design_documentation: "データ設計文書化"
    - algorithm_specification_generation: "アルゴリズム仕様生成"
```

### 1.3 適用範囲
```yaml
step3_application_scope:
  target_documents:
    - detailed_design_specification: "詳細設計仕様"
    - component_design_specification: "コンポーネント設計仕様"
    - interface_specification_document: "インターフェース仕様文書"
    - data_design_specification: "データ設計仕様"
    - algorithm_specification_document: "アルゴリズム仕様文書"
    - implementation_guidelines: "実装ガイドライン"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 詳細設計仕様生成ルール
```yaml
detailed_design_specification_rules:
  document_metadata:
    document_type: "detailed_design_specification"
    template_id: "DDS_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "design_overview"
        title: "設計概要"
        mandatory: true
        content_type: "design_summary"
        includes: ["design_objectives", "design_principles", "design_constraints"]
      
      - section_id: "component_detailed_design"
        title: "コンポーネント詳細設計"
        mandatory: true
        content_type: "component_specification"
        includes: ["component_breakdown", "responsibility_assignment", "interaction_design"]
      
      - section_id: "class_design_specification"
        title: "クラス設計仕様"
        mandatory: true
        content_type: "class_specification"
        includes: ["class_diagrams", "method_specifications", "attribute_definitions"]
      
      - section_id: "interface_detailed_design"
        title: "インターフェース詳細設計"
        mandatory: true
        content_type: "interface_specification"
        includes: ["api_detailed_design", "data_contracts", "protocol_specifications"]
      
      - section_id: "data_structure_design"
        title: "データ構造設計"
        mandatory: true
        content_type: "data_specification"
        includes: ["data_models", "database_schema", "data_validation"]
      
      - section_id: "algorithm_design"
        title: "アルゴリズム設計"
        mandatory: true
        content_type: "algorithm_specification"
        includes: ["business_logic", "processing_algorithms", "optimization_strategies"]
      
      - section_id: "error_handling_design"
        title: "エラーハンドリング設計"
        mandatory: true
        content_type: "error_specification"
        includes: ["error_scenarios", "exception_handling", "recovery_strategies"]
  
  content_generation_rules:
    component_detailed_design:
      generation_method: "component_decomposition"
      input_sources:
        - "system_architecture"
        - "functional_requirements"
        - "design_patterns"
        - "implementation_constraints"
      quality_criteria:
        - component_cohesion: "コンポーネント凝集度95%以上"
        - interface_clarity: "インターフェース明確性100%"
        - responsibility_clarity: "責任明確性100%"
    
    class_design_specification:
      generation_method: "class_modeling"
      input_sources:
        - "component_design"
        - "object_oriented_principles"
        - "coding_standards"
        - "design_patterns"
      quality_criteria:
        - class_design_quality: "クラス設計品質95%以上"
        - method_specification_completeness: "メソッド仕様完全性100%"
        - encapsulation_adherence: "カプセル化準拠100%"
    
    algorithm_design:
      generation_method: "algorithm_specification"
      input_sources:
        - "business_rules"
        - "performance_requirements"
        - "data_structures"
        - "optimization_criteria"
      quality_criteria:
        - algorithm_correctness: "アルゴリズム正確性100%"
        - performance_optimization: "性能最適化95%以上"
        - implementation_clarity: "実装明確性100%"
```

### 2.2 インターフェース仕様文書生成ルール
```yaml
interface_specification_document_rules:
  document_metadata:
    document_type: "interface_specification_document"
    template_id: "ISD_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "interface_overview"
        title: "インターフェース概要"
        mandatory: true
        content_type: "interface_summary"
        includes: ["interface_catalog", "design_principles", "usage_guidelines"]
      
      - section_id: "api_detailed_specifications"
        title: "API詳細仕様"
        mandatory: true
        content_type: "api_specification"
        includes: ["endpoint_specifications", "request_response_schemas", "authentication_methods"]
      
      - section_id: "data_contract_specifications"
        title: "データ契約仕様"
        mandatory: true
        content_type: "data_contract_specification"
        includes: ["schema_definitions", "validation_rules", "data_transformation"]
      
      - section_id: "communication_protocols"
        title: "通信プロトコル"
        mandatory: true
        content_type: "protocol_specification"
        includes: ["protocol_details", "message_formats", "error_handling"]
      
      - section_id: "interface_testing_specifications"
        title: "インターフェーステスト仕様"
        mandatory: true
        content_type: "testing_specification"
        includes: ["test_scenarios", "mock_specifications", "integration_tests"]
      
      - section_id: "versioning_compatibility"
        title: "バージョニング・互換性"
        mandatory: true
        content_type: "versioning_specification"
        includes: ["version_management", "backward_compatibility", "migration_strategies"]
  
  content_generation_rules:
    api_detailed_specifications:
      generation_method: "api_specification_generation"
      input_sources:
        - "functional_requirements"
        - "data_models"
        - "security_requirements"
        - "performance_requirements"
      quality_criteria:
        - api_completeness: "API完全性100%"
        - specification_accuracy: "仕様正確性100%"
        - usability_optimization: "使いやすさ最適化95%以上"
    
    data_contract_specifications:
      generation_method: "contract_specification_generation"
      input_sources:
        - "data_models"
        - "business_rules"
        - "validation_requirements"
        - "integration_requirements"
      quality_criteria:
        - contract_precision: "契約精度100%"
        - validation_completeness: "検証完全性100%"
        - schema_consistency: "スキーマ一貫性100%"
```

### 2.3 データ設計仕様生成ルール
```yaml
data_design_specification_rules:
  document_metadata:
    document_type: "data_design_specification"
    template_id: "DDS_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "data_architecture_overview"
        title: "データアーキテクチャ概要"
        mandatory: true
        content_type: "data_architecture_summary"
        includes: ["data_strategy", "architecture_principles", "data_governance"]
      
      - section_id: "database_schema_design"
        title: "データベーススキーマ設計"
        mandatory: true
        content_type: "schema_specification"
        includes: ["table_definitions", "relationship_specifications", "index_design"]
      
      - section_id: "data_model_specifications"
        title: "データモデル仕様"
        mandatory: true
        content_type: "data_model_specification"
        includes: ["entity_definitions", "attribute_specifications", "business_rules"]
      
      - section_id: "data_access_layer_design"
        title: "データアクセス層設計"
        mandatory: true
        content_type: "data_access_specification"
        includes: ["access_patterns", "query_optimization", "caching_strategies"]
      
      - section_id: "data_validation_rules"
        title: "データ検証ルール"
        mandatory: true
        content_type: "validation_specification"
        includes: ["validation_rules", "constraint_definitions", "data_quality_checks"]
      
      - section_id: "data_migration_design"
        title: "データ移行設計"
        mandatory: true
        content_type: "migration_specification"
        includes: ["migration_strategies", "data_transformation", "rollback_procedures"]
  
  content_generation_rules:
    database_schema_design:
      generation_method: "schema_design_generation"
      input_sources:
        - "data_requirements"
        - "business_rules"
        - "performance_requirements"
        - "scalability_requirements"
      quality_criteria:
        - schema_normalization: "スキーマ正規化95%以上"
        - performance_optimization: "性能最適化100%"
        - integrity_assurance: "整合性保証100%"
    
    data_access_layer_design:
      generation_method: "data_access_design_generation"
      input_sources:
        - "access_patterns"
        - "performance_requirements"
        - "scalability_requirements"
        - "security_requirements"
      quality_criteria:
        - access_efficiency: "アクセス効率95%以上"
        - caching_optimization: "キャッシュ最適化100%"
        - security_compliance: "セキュリティ準拠100%"
```

## 3. 品質保証ルール

### 3.1 設計品質基準
```yaml
design_quality_standards:
  structural_quality:
    design_completeness:
      - component_specification_completeness: "コンポーネント仕様完全性100%"
      - interface_specification_completeness: "インターフェース仕様完全性100%"
      - data_design_completeness: "データ設計完全性100%"
      - algorithm_specification_completeness: "アルゴリズム仕様完全性100%"
    
    design_consistency:
      - architectural_consistency: "アーキテクチャ一貫性100%"
      - naming_consistency: "命名一貫性100%"
      - interface_consistency: "インターフェース一貫性100%"
      - data_model_consistency: "データモデル一貫性100%"
  
  implementation_readiness:
    specification_clarity:
      - implementation_guidance_clarity: "実装ガイダンス明確性100%"
      - algorithm_specification_clarity: "アルゴリズム仕様明確性100%"
      - interface_specification_clarity: "インターフェース仕様明確性100%"
      - data_specification_clarity: "データ仕様明確性100%"
    
    testability_assurance:
      - unit_test_design_feasibility: "単体テスト設計実現可能性100%"
      - integration_test_preparation: "統合テスト準備100%"
      - mock_object_design: "モックオブジェクト設計100%"
      - test_data_specification: "テストデータ仕様100%"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - section_completeness_verification: "セクション完全性検証"
      - specification_detail_validation: "仕様詳細検証"
      - cross_reference_consistency: "相互参照一貫性"
      - diagram_specification_alignment: "図表仕様整合"
    
    content_validation:
      - implementation_feasibility_check: "実装実現可能性チェック"
      - design_consistency_validation: "設計一貫性検証"
      - interface_specification_validation: "インターフェース仕様検証"
      - algorithm_correctness_verification: "アルゴリズム正確性検証"
    
    quality_metrics:
      - design_completeness_score: "設計完全性スコア"
      - implementation_readiness_score: "実装準備性スコア"
      - specification_clarity_score: "仕様明確性スコア"
      - testability_score: "テスト可能性スコア"
  
  expert_review_points:
    design_review:
      - architectural_adherence_validation: "アーキテクチャ準拠検証"
      - design_pattern_application_review: "設計パターン適用レビュー"
      - performance_consideration_assessment: "性能考慮評価"
      - security_design_evaluation: "セキュリティ設計評価"
    
    implementation_review:
      - coding_guidance_adequacy: "コーディングガイダンス妥当性"
      - algorithm_optimization_review: "アルゴリズム最適化レビュー"
      - error_handling_completeness: "エラーハンドリング完全性"
      - maintainability_assessment: "保守性評価"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    detailed_design_specification:
      sections: ["design_overview", "component_detailed_design", "interface_detailed_design"]
      content_depth: "essential_design_only"
      detail_level: "implementation_ready"
    
    interface_specification_document:
      sections: ["interface_overview", "api_detailed_specifications", "data_contract_specifications"]
      content_depth: "core_interfaces"
      detail_level: "basic"
    
    data_design_specification:
      sections: ["data_architecture_overview", "database_schema_design", "data_model_specifications"]
      content_depth: "essential_data_design"
      detail_level: "simplified"
  
  specification_simplification:
    diagram_reduction: "核心図表のみ"
    algorithm_detail: "基本アルゴリズムのみ"
    interface_specification: "必須インターフェースのみ"
    data_model_detail: "核心データモデルのみ"
  
  quality_maintenance:
    implementation_readiness_preserved: "実装準備性保持"
    essential_accuracy: "必須正確性100%"
    core_completeness: "核心完全性100%"
    basic_testability: "基本テスト可能性100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    detailed_design_specification:
      sections: "all_core_sections"
      content_depth: "comprehensive_design"
      detail_level: "detailed"
    
    interface_specification_document:
      sections: "all_sections"
      content_depth: "complete_interfaces"
      detail_level: "comprehensive"
    
    data_design_specification:
      sections: "all_sections"
      content_depth: "complete_data_design"
      detail_level: "detailed"
  
  specification_enhancement:
    diagram_expansion: "詳細図表"
    algorithm_optimization: "最適化アルゴリズム"
    interface_comprehensiveness: "包括的インターフェース"
    data_model_sophistication: "高度データモデル"
  
  quality_standards:
    full_implementation_readiness: "完全実装準備性"
    detailed_accuracy: "詳細正確性100%"
    comprehensive_completeness: "包括的完全性100%"
    advanced_testability: "高度テスト可能性100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    detailed_design_specification:
      sections: "all_sections_plus_advanced_considerations"
      content_depth: "enterprise_design"
      detail_level: "exhaustive"
    
    interface_specification_document:
      sections: "all_sections_plus_governance"
      content_depth: "enterprise_interfaces"
      detail_level: "enterprise"
    
    data_design_specification:
      sections: "all_sections_plus_enterprise_features"
      content_depth: "enterprise_data_design"
      detail_level: "comprehensive"
  
  specification_maximization:
    diagram_elaboration: "包括的図表"
    algorithm_sophistication: "高度アルゴリズム"
    interface_enterprise_features: "エンタープライズインターフェース機能"
    data_model_enterprise_design: "エンタープライズデータモデル設計"
  
  quality_excellence:
    enterprise_implementation_readiness: "エンタープライズ実装準備性"
    enterprise_accuracy: "エンタープライズ正確性100%"
    exhaustive_completeness: "網羅的完全性100%"
    enterprise_testability: "エンタープライズテスト可能性100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    design_analysis:
      - architectural_decomposition: "アーキテクチャ分解"
      - component_identification: "コンポーネント特定"
      - interface_extraction: "インターフェース抽出"
      - data_requirement_analysis: "データ要件分析"
    
    specification_synthesis:
      - design_pattern_application: "設計パターン適用"
      - algorithm_optimization: "アルゴリズム最適化"
      - interface_standardization: "インターフェース標準化"
      - data_model_normalization: "データモデル正規化"
  
  generation_engine:
    detailed_design_generation:
      - component_specification: "コンポーネント仕様"
      - class_design_generation: "クラス設計生成"
      - method_specification: "メソッド仕様"
      - algorithm_specification: "アルゴリズム仕様"
    
    interface_specification_generation:
      - api_specification: "API仕様"
      - data_contract_generation: "データ契約生成"
      - protocol_specification: "プロトコル仕様"
      - integration_specification: "統合仕様"
  
  output_validation:
    design_validation:
      - completeness_verification: "完全性検証"
      - consistency_validation: "一貫性検証"
      - implementability_assessment: "実装可能性評価"
      - testability_verification: "テスト可能性検証"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  design_generator:
    component_designer: "コンポーネント設計器"
    class_modeler: "クラスモデラー"
    interface_specifier: "インターフェース仕様器"
    algorithm_optimizer: "アルゴリズム最適化器"
  
  specification_engine:
    detail_synthesizer: "詳細合成器"
    documentation_generator: "文書生成器"
    diagram_creator: "図表作成器"
    validation_controller: "検証制御器"
  
  quality_assurance:
    design_validator: "設計検証器"
    consistency_checker: "一貫性チェッカー"
    completeness_verifier: "完全性検証器"
    implementation_assessor: "実装評価器"
```

---

**STEP3文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
