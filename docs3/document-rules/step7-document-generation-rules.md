# STEP7文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP7 - 実装  

## 1. STEP7文書生成ルール概要

### 1.1 ルール定義
STEP7文書生成ルールは、**実装段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step7_document_generation_objectives:
  primary_purpose: "実装段階の文書生成自動化"
  
  specific_goals:
    - implementation_documentation_automation: "実装文書自動化"
    - code_quality_documentation: "コード品質文書化"
    - testing_documentation_generation: "テスト文書生成"
    - deployment_documentation_automation: "デプロイ文書自動化"
    - maintenance_documentation_creation: "保守文書作成"
```

### 1.3 適用範囲
```yaml
step7_application_scope:
  target_documents:
    - implementation_report: "実装レポート"
    - code_documentation: "コード文書"
    - test_execution_report: "テスト実行レポート"
    - deployment_documentation: "デプロイ文書"
    - user_documentation: "ユーザー文書"
    - maintenance_documentation: "保守文書"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 実装レポート生成ルール
```yaml
implementation_report_rules:
  document_metadata:
    document_type: "implementation_report"
    template_id: "IR_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG4"
  
  structure_rules:
    sections:
      - section_id: "implementation_summary"
        title: "実装サマリー"
        mandatory: true
        content_type: "summary_specification"
        includes: ["implementation_overview", "key_achievements", "completion_status"]
      
      - section_id: "feature_implementation"
        title: "機能実装"
        mandatory: true
        content_type: "feature_specification"
        includes: ["implemented_features", "feature_completeness", "functionality_verification"]
      
      - section_id: "code_quality_metrics"
        title: "コード品質メトリクス"
        mandatory: true
        content_type: "quality_metrics_specification"
        includes: ["code_coverage", "complexity_metrics", "quality_scores"]
      
      - section_id: "testing_results"
        title: "テスト結果"
        mandatory: true
        content_type: "testing_specification"
        includes: ["test_execution_summary", "test_coverage", "defect_analysis"]
      
      - section_id: "performance_analysis"
        title: "性能分析"
        mandatory: true
        content_type: "performance_specification"
        includes: ["performance_metrics", "benchmark_results", "optimization_outcomes"]
      
      - section_id: "security_validation"
        title: "セキュリティ検証"
        mandatory: true
        content_type: "security_specification"
        includes: ["security_testing_results", "vulnerability_assessment", "compliance_verification"]
      
      - section_id: "deployment_readiness"
        title: "デプロイ準備性"
        mandatory: true
        content_type: "deployment_specification"
        includes: ["deployment_validation", "environment_readiness", "rollback_preparation"]
  
  content_generation_rules:
    implementation_summary:
      generation_method: "summary_synthesis"
      input_sources:
        - "implementation_progress"
        - "feature_completion_status"
        - "quality_metrics"
        - "testing_results"
      quality_criteria:
        - summary_accuracy: "サマリー正確性100%"
        - completion_status_clarity: "完了状況明確性100%"
        - achievement_quantification: "達成度定量化95%以上"
    
    code_quality_metrics:
      generation_method: "metrics_aggregation"
      input_sources:
        - "static_analysis_results"
        - "code_coverage_reports"
        - "complexity_analysis"
        - "quality_tool_outputs"
      quality_criteria:
        - metrics_accuracy: "メトリクス精度100%"
        - trend_analysis_validity: "トレンド分析妥当性100%"
        - quality_assessment_objectivity: "品質評価客観性100%"
    
    testing_results:
      generation_method: "test_result_analysis"
      input_sources:
        - "test_execution_logs"
        - "test_coverage_reports"
        - "defect_tracking_data"
        - "performance_test_results"
      quality_criteria:
        - result_completeness: "結果完全性100%"
        - analysis_accuracy: "分析精度100%"
        - defect_categorization_precision: "欠陥分類精度100%"
```

### 2.2 コード文書生成ルール
```yaml
code_documentation_rules:
  document_metadata:
    document_type: "code_documentation"
    template_id: "CD_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG4"
  
  structure_rules:
    sections:
      - section_id: "architecture_documentation"
        title: "アーキテクチャ文書"
        mandatory: true
        content_type: "architecture_specification"
        includes: ["system_architecture", "component_relationships", "design_patterns"]
      
      - section_id: "api_documentation"
        title: "API文書"
        mandatory: true
        content_type: "api_specification"
        includes: ["endpoint_documentation", "request_response_schemas", "usage_examples"]
      
      - section_id: "code_structure_documentation"
        title: "コード構造文書"
        mandatory: true
        content_type: "structure_specification"
        includes: ["module_organization", "class_hierarchy", "function_documentation"]
      
      - section_id: "configuration_documentation"
        title: "設定文書"
        mandatory: true
        content_type: "configuration_specification"
        includes: ["configuration_parameters", "environment_settings", "deployment_configurations"]
      
      - section_id: "database_documentation"
        title: "データベース文書"
        mandatory: true
        content_type: "database_specification"
        includes: ["schema_documentation", "data_model", "migration_scripts"]
      
      - section_id: "integration_documentation"
        title: "統合文書"
        mandatory: true
        content_type: "integration_specification"
        includes: ["external_integrations", "service_dependencies", "communication_protocols"]
  
  content_generation_rules:
    architecture_documentation:
      generation_method: "architecture_extraction"
      input_sources:
        - "source_code_analysis"
        - "design_documents"
        - "dependency_analysis"
        - "pattern_identification"
      quality_criteria:
        - documentation_accuracy: "文書精度100%"
        - architectural_completeness: "アーキテクチャ完全性100%"
        - pattern_identification_precision: "パターン特定精度95%以上"
    
    api_documentation:
      generation_method: "api_specification_extraction"
      input_sources:
        - "api_definitions"
        - "code_annotations"
        - "test_specifications"
        - "usage_patterns"
      quality_criteria:
        - api_completeness: "API完全性100%"
        - example_accuracy: "例正確性100%"
        - usage_clarity: "使用法明確性100%"
    
    code_structure_documentation:
      generation_method: "structure_analysis"
      input_sources:
        - "source_code_structure"
        - "dependency_graphs"
        - "code_comments"
        - "naming_conventions"
      quality_criteria:
        - structure_accuracy: "構造精度100%"
        - documentation_completeness: "文書完全性95%以上"
        - maintainability_support: "保守性サポート100%"
```

### 2.3 テスト実行レポート生成ルール
```yaml
test_execution_report_rules:
  document_metadata:
    document_type: "test_execution_report"
    template_id: "TER_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG4"
  
  structure_rules:
    sections:
      - section_id: "test_execution_summary"
        title: "テスト実行サマリー"
        mandatory: true
        content_type: "execution_summary"
        includes: ["test_overview", "execution_statistics", "overall_results"]
      
      - section_id: "functional_test_results"
        title: "機能テスト結果"
        mandatory: true
        content_type: "functional_test_specification"
        includes: ["test_case_results", "feature_validation", "requirement_coverage"]
      
      - section_id: "integration_test_results"
        title: "統合テスト結果"
        mandatory: true
        content_type: "integration_test_specification"
        includes: ["integration_scenarios", "interface_validation", "data_flow_verification"]
      
      - section_id: "performance_test_results"
        title: "性能テスト結果"
        mandatory: true
        content_type: "performance_test_specification"
        includes: ["performance_metrics", "load_test_results", "scalability_analysis"]
      
      - section_id: "security_test_results"
        title: "セキュリティテスト結果"
        mandatory: true
        content_type: "security_test_specification"
        includes: ["security_validation", "vulnerability_assessment", "penetration_test_results"]
      
      - section_id: "defect_analysis"
        title: "欠陥分析"
        mandatory: true
        content_type: "defect_specification"
        includes: ["defect_summary", "root_cause_analysis", "resolution_status"]
      
      - section_id: "test_coverage_analysis"
        title: "テストカバレッジ分析"
        mandatory: true
        content_type: "coverage_specification"
        includes: ["code_coverage", "requirement_coverage", "test_effectiveness"]
  
  content_generation_rules:
    test_execution_summary:
      generation_method: "execution_analysis"
      input_sources:
        - "test_execution_logs"
        - "test_results_database"
        - "automation_reports"
        - "manual_test_records"
      quality_criteria:
        - summary_accuracy: "サマリー精度100%"
        - statistics_completeness: "統計完全性100%"
        - result_interpretation_clarity: "結果解釈明確性100%"
    
    performance_test_results:
      generation_method: "performance_analysis"
      input_sources:
        - "performance_test_logs"
        - "monitoring_data"
        - "benchmark_results"
        - "resource_utilization_data"
      quality_criteria:
        - performance_metrics_accuracy: "性能メトリクス精度100%"
        - analysis_depth: "分析深度95%以上"
        - recommendation_validity: "推奨事項妥当性100%"
    
    defect_analysis:
      generation_method: "defect_categorization"
      input_sources:
        - "defect_tracking_system"
        - "test_failure_logs"
        - "root_cause_investigations"
        - "resolution_records"
      quality_criteria:
        - categorization_accuracy: "分類精度100%"
        - root_cause_identification: "根本原因特定95%以上"
        - trend_analysis_validity: "トレンド分析妥当性100%"
```

## 3. 品質保証ルール

### 3.1 実装品質基準
```yaml
implementation_quality_standards:
  code_quality:
    quality_metrics:
      - code_coverage: "コードカバレッジ80%以上"
      - cyclomatic_complexity: "循環的複雑度10以下"
      - maintainability_index: "保守性指数70以上"
      - technical_debt_ratio: "技術的負債比率5%以下"
    
    documentation_quality:
      - api_documentation_completeness: "API文書完全性100%"
      - code_comment_adequacy: "コードコメント妥当性90%以上"
      - architecture_documentation_accuracy: "アーキテクチャ文書精度100%"
      - user_documentation_clarity: "ユーザー文書明確性95%以上"
  
  testing_quality:
    test_coverage:
      - unit_test_coverage: "単体テストカバレッジ90%以上"
      - integration_test_coverage: "統合テストカバレッジ80%以上"
      - functional_test_coverage: "機能テストカバレッジ100%"
      - requirement_coverage: "要件カバレッジ100%"
    
    test_effectiveness:
      - defect_detection_rate: "欠陥検出率95%以上"
      - test_automation_rate: "テスト自動化率70%以上"
      - test_execution_efficiency: "テスト実行効率90%以上"
      - false_positive_rate: "偽陽性率5%以下"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - section_completeness_verification: "セクション完全性検証"
      - implementation_documentation_consistency: "実装文書一貫性"
      - test_result_accuracy_validation: "テスト結果精度検証"
      - deployment_documentation_completeness: "デプロイ文書完全性"
    
    content_validation:
      - metrics_accuracy_verification: "メトリクス精度検証"
      - test_coverage_validation: "テストカバレッジ検証"
      - code_quality_assessment: "コード品質評価"
      - security_validation_completeness: "セキュリティ検証完全性"
    
    quality_metrics:
      - implementation_completeness_score: "実装完全性スコア"
      - documentation_quality_score: "文書品質スコア"
      - test_effectiveness_score: "テスト効果スコア"
      - deployment_readiness_score: "デプロイ準備性スコア"
  
  expert_review_points:
    implementation_review:
      - code_quality_assessment: "コード品質評価"
      - architecture_compliance_validation: "アーキテクチャ準拠検証"
      - performance_optimization_evaluation: "性能最適化評価"
      - security_implementation_review: "セキュリティ実装レビュー"
    
    documentation_review:
      - technical_documentation_accuracy: "技術文書精度"
      - user_documentation_usability: "ユーザー文書使いやすさ"
      - maintenance_documentation_adequacy: "保守文書妥当性"
      - deployment_documentation_completeness: "デプロイ文書完全性"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    implementation_report:
      sections: ["implementation_summary", "feature_implementation", "testing_results"]
      content_depth: "basic_implementation"
      detail_level: "essential"
    
    code_documentation:
      sections: ["api_documentation", "code_structure_documentation", "configuration_documentation"]
      content_depth: "core_documentation"
      detail_level: "simplified"
    
    test_execution_report:
      sections: ["test_execution_summary", "functional_test_results", "defect_analysis"]
      content_depth: "essential_testing"
      detail_level: "basic"
  
  implementation_simplification:
    metrics_scope: "核心メトリクスのみ"
    documentation_depth: "基本文書化"
    testing_coverage: "主要テストのみ"
    deployment_complexity: "シンプルデプロイ"
  
  quality_maintenance:
    core_implementation_preserved: "核心実装保持"
    essential_testing: "必須テスト100%"
    basic_documentation: "基本文書化100%"
    simplified_deployment: "簡素化デプロイ100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    implementation_report:
      sections: "all_core_sections"
      content_depth: "comprehensive_implementation"
      detail_level: "detailed"
    
    code_documentation:
      sections: "all_sections"
      content_depth: "complete_documentation"
      detail_level: "comprehensive"
    
    test_execution_report:
      sections: "all_sections"
      content_depth: "complete_testing"
      detail_level: "detailed"
  
  implementation_enhancement:
    metrics_sophistication: "詳細メトリクス"
    documentation_comprehensiveness: "包括的文書化"
    testing_automation: "高度テスト自動化"
    deployment_sophistication: "高度デプロイ"
  
  quality_standards:
    full_implementation_quality: "完全実装品質"
    comprehensive_testing: "包括的テスト100%"
    advanced_documentation: "高度文書化100%"
    sophisticated_deployment: "高度デプロイ100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    implementation_report:
      sections: "all_sections_plus_advanced_analytics"
      content_depth: "enterprise_implementation"
      detail_level: "exhaustive"
    
    code_documentation:
      sections: "all_sections_plus_governance"
      content_depth: "enterprise_documentation"
      detail_level: "comprehensive"
    
    test_execution_report:
      sections: "all_sections_plus_advanced_analysis"
      content_depth: "enterprise_testing"
      detail_level: "comprehensive"
  
  implementation_maximization:
    metrics_enterprise_level: "エンタープライズメトリクス"
    documentation_enterprise_standards: "エンタープライズ文書標準"
    testing_enterprise_automation: "エンタープライズテスト自動化"
    deployment_enterprise_sophistication: "エンタープライズデプロイ高度化"
  
  quality_excellence:
    enterprise_implementation_quality: "エンタープライズ実装品質"
    maximum_testing: "最大テスト100%"
    enterprise_documentation: "エンタープライズ文書化100%"
    enterprise_deployment: "エンタープライズデプロイ100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    implementation_analysis:
      - code_analysis: "コード分析"
      - test_result_analysis: "テスト結果分析"
      - quality_metrics_extraction: "品質メトリクス抽出"
      - deployment_status_assessment: "デプロイ状況評価"
    
    documentation_synthesis:
      - code_documentation_generation: "コード文書生成"
      - api_documentation_extraction: "API文書抽出"
      - test_documentation_creation: "テスト文書作成"
      - deployment_documentation_generation: "デプロイ文書生成"
  
  generation_engine:
    report_generation:
      - implementation_report_synthesis: "実装レポート合成"
      - test_report_compilation: "テストレポート編集"
      - quality_report_creation: "品質レポート作成"
      - deployment_report_generation: "デプロイレポート生成"
    
    documentation_generation:
      - technical_documentation_creation: "技術文書作成"
      - user_documentation_generation: "ユーザー文書生成"
      - maintenance_documentation_creation: "保守文書作成"
      - api_documentation_automation: "API文書自動化"
  
  output_validation:
    implementation_validation:
      - completeness_verification: "完全性検証"
      - accuracy_validation: "精度検証"
      - consistency_check: "一貫性チェック"
      - quality_assurance_validation: "品質保証検証"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  documentation_engine:
    code_analyzer: "コード分析器"
    documentation_generator: "文書生成器"
    api_extractor: "API抽出器"
    quality_assessor: "品質評価器"
  
  reporting_engine:
    test_analyzer: "テスト分析器"
    metrics_aggregator: "メトリクス集約器"
    report_synthesizer: "レポート合成器"
    trend_analyzer: "トレンド分析器"
  
  validation_framework:
    implementation_validator: "実装検証器"
    documentation_verifier: "文書検証器"
    quality_monitor: "品質監視器"
    deployment_assessor: "デプロイ評価器"
```

---

**STEP7文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
