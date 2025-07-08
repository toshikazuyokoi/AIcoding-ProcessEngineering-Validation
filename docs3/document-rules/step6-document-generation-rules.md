# STEP6文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP6 - タスクリスト  

## 1. STEP6文書生成ルール概要

### 1.1 ルール定義
STEP6文書生成ルールは、**タスクリスト段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step6_document_generation_objectives:
  primary_purpose: "タスクリスト段階の文書生成自動化"
  
  specific_goals:
    - task_breakdown_automation: "タスク分解自動化"
    - execution_checklist_generation: "実行チェックリスト生成"
    - progress_tracking_framework_creation: "進捗追跡フレームワーク作成"
    - quality_checkpoint_specification: "品質チェックポイント仕様"
    - dependency_management_documentation: "依存関係管理文書化"
```

### 1.3 適用範囲
```yaml
step6_application_scope:
  target_documents:
    - detailed_task_list: "詳細タスクリスト"
    - execution_checklist: "実行チェックリスト"
    - progress_tracking_framework: "進捗追跡フレームワーク"
    - quality_checkpoint_specification: "品質チェックポイント仕様"
    - dependency_management_matrix: "依存関係管理マトリクス"
    - task_execution_guidelines: "タスク実行ガイドライン"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 詳細タスクリスト生成ルール
```yaml
detailed_task_list_rules:
  document_metadata:
    document_type: "detailed_task_list"
    template_id: "DTL_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "task_hierarchy"
        title: "タスク階層"
        mandatory: true
        content_type: "hierarchical_structure"
        includes: ["work_packages", "task_breakdown", "subtask_definition"]
      
      - section_id: "task_specifications"
        title: "タスク仕様"
        mandatory: true
        content_type: "task_specification"
        includes: ["task_descriptions", "acceptance_criteria", "deliverable_definitions"]
      
      - section_id: "resource_assignments"
        title: "リソース割り当て"
        mandatory: true
        content_type: "assignment_specification"
        includes: ["role_assignments", "skill_requirements", "capacity_allocation"]
      
      - section_id: "timeline_specifications"
        title: "タイムライン仕様"
        mandatory: true
        content_type: "schedule_specification"
        includes: ["task_durations", "start_end_dates", "milestone_alignment"]
      
      - section_id: "dependency_mapping"
        title: "依存関係マッピング"
        mandatory: true
        content_type: "dependency_specification"
        includes: ["task_dependencies", "critical_path", "blocking_relationships"]
      
      - section_id: "quality_requirements"
        title: "品質要件"
        mandatory: true
        content_type: "quality_specification"
        includes: ["quality_criteria", "review_requirements", "testing_requirements"]
      
      - section_id: "risk_considerations"
        title: "リスク考慮事項"
        mandatory: true
        content_type: "risk_specification"
        includes: ["task_risks", "mitigation_actions", "contingency_plans"]
  
  content_generation_rules:
    task_hierarchy:
      generation_method: "hierarchical_decomposition"
      input_sources:
        - "work_breakdown_structure"
        - "deliverable_requirements"
        - "complexity_analysis"
        - "resource_constraints"
      quality_criteria:
        - decomposition_completeness: "分解完全性100%"
        - hierarchy_clarity: "階層明確性100%"
        - task_granularity_appropriateness: "タスク粒度適切性100%"
    
    task_specifications:
      generation_method: "specification_detailing"
      input_sources:
        - "functional_requirements"
        - "technical_specifications"
        - "quality_standards"
        - "acceptance_criteria"
      quality_criteria:
        - specification_clarity: "仕様明確性100%"
        - acceptance_criteria_completeness: "受入基準完全性100%"
        - deliverable_definition_precision: "成果物定義精度100%"
    
    dependency_mapping:
      generation_method: "dependency_analysis"
      input_sources:
        - "task_relationships"
        - "resource_dependencies"
        - "technical_dependencies"
        - "timeline_constraints"
      quality_criteria:
        - dependency_accuracy: "依存関係精度100%"
        - critical_path_identification: "クリティカルパス特定100%"
        - blocking_relationship_clarity: "ブロッキング関係明確性100%"
```

### 2.2 実行チェックリスト生成ルール
```yaml
execution_checklist_rules:
  document_metadata:
    document_type: "execution_checklist"
    template_id: "ECL_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "pre_execution_checklist"
        title: "実行前チェックリスト"
        mandatory: true
        content_type: "pre_execution_specification"
        includes: ["prerequisite_verification", "resource_readiness", "environment_setup"]
      
      - section_id: "execution_checklist"
        title: "実行チェックリスト"
        mandatory: true
        content_type: "execution_specification"
        includes: ["step_by_step_procedures", "quality_checkpoints", "progress_milestones"]
      
      - section_id: "post_execution_checklist"
        title: "実行後チェックリスト"
        mandatory: true
        content_type: "post_execution_specification"
        includes: ["deliverable_verification", "quality_validation", "documentation_completion"]
      
      - section_id: "quality_gates_checklist"
        title: "品質ゲートチェックリスト"
        mandatory: true
        content_type: "quality_gate_specification"
        includes: ["quality_criteria_verification", "review_completion", "approval_confirmation"]
      
      - section_id: "risk_mitigation_checklist"
        title: "リスク軽減チェックリスト"
        mandatory: true
        content_type: "risk_mitigation_specification"
        includes: ["risk_monitoring", "mitigation_actions", "escalation_procedures"]
      
      - section_id: "communication_checklist"
        title: "コミュニケーションチェックリスト"
        mandatory: true
        content_type: "communication_specification"
        includes: ["stakeholder_updates", "progress_reporting", "issue_escalation"]
  
  content_generation_rules:
    pre_execution_checklist:
      generation_method: "prerequisite_analysis"
      input_sources:
        - "task_dependencies"
        - "resource_requirements"
        - "environment_specifications"
        - "prerequisite_conditions"
      quality_criteria:
        - prerequisite_completeness: "前提条件完全性100%"
        - verification_clarity: "検証明確性100%"
        - readiness_assessment_accuracy: "準備性評価精度100%"
    
    execution_checklist:
      generation_method: "procedure_specification"
      input_sources:
        - "task_procedures"
        - "quality_standards"
        - "best_practices"
        - "error_prevention_measures"
      quality_criteria:
        - procedure_completeness: "手順完全性100%"
        - step_clarity: "ステップ明確性100%"
        - quality_checkpoint_adequacy: "品質チェックポイント妥当性100%"
    
    post_execution_checklist:
      generation_method: "validation_specification"
      input_sources:
        - "deliverable_requirements"
        - "quality_criteria"
        - "acceptance_standards"
        - "documentation_requirements"
      quality_criteria:
        - validation_completeness: "検証完全性100%"
        - deliverable_verification_accuracy: "成果物検証精度100%"
        - documentation_completeness: "文書化完全性100%"
```

### 2.3 進捗追跡フレームワーク生成ルール
```yaml
progress_tracking_framework_rules:
  document_metadata:
    document_type: "progress_tracking_framework"
    template_id: "PTF_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "tracking_methodology"
        title: "追跡手法"
        mandatory: true
        content_type: "methodology_specification"
        includes: ["tracking_approach", "measurement_methods", "reporting_frequency"]
      
      - section_id: "progress_metrics"
        title: "進捗メトリクス"
        mandatory: true
        content_type: "metrics_specification"
        includes: ["completion_metrics", "quality_metrics", "performance_metrics"]
      
      - section_id: "tracking_tools"
        title: "追跡ツール"
        mandatory: true
        content_type: "tool_specification"
        includes: ["tracking_systems", "dashboard_design", "automation_tools"]
      
      - section_id: "reporting_framework"
        title: "レポートフレームワーク"
        mandatory: true
        content_type: "reporting_specification"
        includes: ["report_templates", "stakeholder_reports", "escalation_reports"]
      
      - section_id: "variance_management"
        title: "差異管理"
        mandatory: true
        content_type: "variance_specification"
        includes: ["variance_detection", "impact_analysis", "corrective_actions"]
      
      - section_id: "continuous_improvement"
        title: "継続的改善"
        mandatory: true
        content_type: "improvement_specification"
        includes: ["feedback_mechanisms", "process_optimization", "lessons_learned"]
  
  content_generation_rules:
    tracking_methodology:
      generation_method: "methodology_design"
      input_sources:
        - "project_characteristics"
        - "stakeholder_requirements"
        - "organizational_standards"
        - "tool_capabilities"
      quality_criteria:
        - methodology_appropriateness: "手法適切性100%"
        - measurement_accuracy: "測定精度95%以上"
        - reporting_efficiency: "レポート効率性100%"
    
    progress_metrics:
      generation_method: "metrics_definition"
      input_sources:
        - "project_objectives"
        - "success_criteria"
        - "quality_requirements"
        - "performance_targets"
      quality_criteria:
        - metrics_relevance: "メトリクス関連性100%"
        - measurability: "測定可能性100%"
        - actionability: "実行可能性100%"
    
    variance_management:
      generation_method: "variance_framework_design"
      input_sources:
        - "baseline_plans"
        - "tolerance_thresholds"
        - "risk_factors"
        - "corrective_procedures"
      quality_criteria:
        - detection_sensitivity: "検出感度95%以上"
        - response_timeliness: "対応適時性100%"
        - corrective_action_effectiveness: "是正措置効果95%以上"
```

## 3. 品質保証ルール

### 3.1 タスク品質基準
```yaml
task_quality_standards:
  task_definition_quality:
    clarity_standards:
      - task_description_clarity: "タスク説明明確性100%"
      - acceptance_criteria_clarity: "受入基準明確性100%"
      - deliverable_definition_clarity: "成果物定義明確性100%"
      - procedure_clarity: "手順明確性100%"
    
    completeness_standards:
      - task_specification_completeness: "タスク仕様完全性100%"
      - dependency_identification_completeness: "依存関係特定完全性100%"
      - resource_requirement_completeness: "リソース要件完全性100%"
      - quality_requirement_completeness: "品質要件完全性100%"
  
  execution_readiness:
    preparation_standards:
      - prerequisite_verification_completeness: "前提条件検証完全性100%"
      - resource_readiness_verification: "リソース準備性検証100%"
      - environment_setup_completeness: "環境設定完全性100%"
      - procedure_documentation_adequacy: "手順文書化妥当性100%"
    
    tracking_standards:
      - progress_measurement_accuracy: "進捗測定精度95%以上"
      - quality_monitoring_effectiveness: "品質監視効果100%"
      - variance_detection_sensitivity: "差異検出感度95%以上"
      - reporting_timeliness: "レポート適時性100%"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - task_hierarchy_consistency: "タスク階層一貫性"
      - checklist_completeness_verification: "チェックリスト完全性検証"
      - dependency_mapping_accuracy: "依存関係マッピング精度"
      - tracking_framework_completeness: "追跡フレームワーク完全性"
    
    content_validation:
      - task_specification_adequacy: "タスク仕様妥当性"
      - execution_procedure_clarity: "実行手順明確性"
      - quality_checkpoint_effectiveness: "品質チェックポイント効果"
      - progress_metrics_relevance: "進捗メトリクス関連性"
    
    quality_metrics:
      - task_definition_quality_score: "タスク定義品質スコア"
      - execution_readiness_score: "実行準備性スコア"
      - tracking_effectiveness_score: "追跡効果スコア"
      - quality_assurance_score: "品質保証スコア"
  
  expert_review_points:
    task_design_review:
      - task_granularity_appropriateness: "タスク粒度適切性"
      - dependency_accuracy_validation: "依存関係精度検証"
      - resource_allocation_efficiency: "リソース配分効率性"
      - timeline_feasibility_assessment: "タイムライン実現可能性評価"
    
    execution_framework_review:
      - checklist_practicality_assessment: "チェックリスト実用性評価"
      - tracking_methodology_effectiveness: "追跡手法効果"
      - quality_gate_adequacy: "品質ゲート妥当性"
      - continuous_improvement_mechanism: "継続的改善メカニズム"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    detailed_task_list:
      sections: ["task_hierarchy", "task_specifications", "timeline_specifications"]
      content_depth: "basic_task_breakdown"
      detail_level: "essential"
    
    execution_checklist:
      sections: ["pre_execution_checklist", "execution_checklist", "post_execution_checklist"]
      content_depth: "core_procedures"
      detail_level: "simplified"
    
    progress_tracking_framework:
      sections: ["tracking_methodology", "progress_metrics", "reporting_framework"]
      content_depth: "basic_tracking"
      detail_level: "essential"
  
  task_simplification:
    task_granularity: "粗粒度タスク"
    checklist_detail: "基本チェック項目"
    tracking_frequency: "週次追跡"
    reporting_level: "サマリーレポート"
  
  quality_maintenance:
    core_execution_preserved: "核心実行保持"
    essential_tracking: "必須追跡100%"
    basic_quality_gates: "基本品質ゲート100%"
    simplified_reporting: "簡素化レポート100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    detailed_task_list:
      sections: "all_core_sections"
      content_depth: "comprehensive_task_breakdown"
      detail_level: "detailed"
    
    execution_checklist:
      sections: "all_sections"
      content_depth: "complete_procedures"
      detail_level: "comprehensive"
    
    progress_tracking_framework:
      sections: "all_sections"
      content_depth: "complete_tracking"
      detail_level: "detailed"
  
  task_enhancement:
    task_granularity: "適切粒度タスク"
    checklist_sophistication: "詳細チェック項目"
    tracking_automation: "自動追跡"
    reporting_sophistication: "詳細レポート"
  
  quality_standards:
    full_execution_quality: "完全実行品質"
    comprehensive_tracking: "包括的追跡100%"
    advanced_quality_gates: "高度品質ゲート100%"
    detailed_reporting: "詳細レポート100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    detailed_task_list:
      sections: "all_sections_plus_advanced_features"
      content_depth: "enterprise_task_breakdown"
      detail_level: "exhaustive"
    
    execution_checklist:
      sections: "all_sections_plus_governance"
      content_depth: "enterprise_procedures"
      detail_level: "comprehensive"
    
    progress_tracking_framework:
      sections: "all_sections_plus_analytics"
      content_depth: "enterprise_tracking"
      detail_level: "comprehensive"
  
  task_maximization:
    task_granularity: "細粒度タスク"
    checklist_comprehensiveness: "包括的チェック項目"
    tracking_intelligence: "インテリジェント追跡"
    reporting_analytics: "分析レポート"
  
  quality_excellence:
    enterprise_execution_quality: "エンタープライズ実行品質"
    maximum_tracking: "最大追跡100%"
    enterprise_quality_gates: "エンタープライズ品質ゲート100%"
    comprehensive_reporting: "包括的レポート100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    plan_analysis:
      - work_breakdown_analysis: "作業分解分析"
      - dependency_identification: "依存関係特定"
      - resource_requirement_analysis: "リソース要件分析"
      - timeline_constraint_analysis: "タイムライン制約分析"
    
    task_optimization:
      - task_granularity_optimization: "タスク粒度最適化"
      - dependency_optimization: "依存関係最適化"
      - resource_allocation_optimization: "リソース配分最適化"
      - timeline_optimization: "タイムライン最適化"
  
  generation_engine:
    task_generation:
      - task_breakdown: "タスク分解"
      - checklist_creation: "チェックリスト作成"
      - procedure_specification: "手順仕様"
      - quality_checkpoint_definition: "品質チェックポイント定義"
    
    tracking_framework_generation:
      - metrics_definition: "メトリクス定義"
      - dashboard_design: "ダッシュボード設計"
      - reporting_automation: "レポート自動化"
      - variance_detection: "差異検出"
  
  output_validation:
    task_validation:
      - completeness_verification: "完全性検証"
      - executability_validation: "実行可能性検証"
      - dependency_consistency_check: "依存関係一貫性チェック"
      - quality_assurance_validation: "品質保証検証"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  task_engine:
    task_decomposer: "タスク分解器"
    dependency_analyzer: "依存関係分析器"
    checklist_generator: "チェックリスト生成器"
    procedure_specifier: "手順仕様器"
  
  tracking_engine:
    metrics_calculator: "メトリクス計算器"
    progress_monitor: "進捗監視器"
    variance_detector: "差異検出器"
    report_generator: "レポート生成器"
  
  quality_controller:
    task_validator: "タスク検証器"
    execution_verifier: "実行検証器"
    quality_monitor: "品質監視器"
    improvement_analyzer: "改善分析器"
```

---

**STEP6文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
