# STEP5文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP5 - 開発計画  

## 1. STEP5文書生成ルール概要

### 1.1 ルール定義
STEP5文書生成ルールは、**開発計画段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step5_document_generation_objectives:
  primary_purpose: "開発計画段階の文書生成自動化"
  
  specific_goals:
    - development_plan_automation: "開発計画自動化"
    - resource_allocation_optimization: "リソース配分最適化"
    - timeline_planning_automation: "タイムライン計画自動化"
    - risk_management_plan_generation: "リスク管理計画生成"
    - quality_assurance_planning: "品質保証計画"
```

### 1.3 適用範囲
```yaml
step5_application_scope:
  target_documents:
    - development_plan_document: "開発計画文書"
    - resource_allocation_plan: "リソース配分計画"
    - project_timeline_specification: "プロジェクトタイムライン仕様"
    - risk_management_plan: "リスク管理計画"
    - quality_management_plan: "品質管理計画"
    - communication_plan: "コミュニケーション計画"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 開発計画文書生成ルール
```yaml
development_plan_document_rules:
  document_metadata:
    document_type: "development_plan_document"
    template_id: "DPD_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "project_overview"
        title: "プロジェクト概要"
        mandatory: true
        content_type: "project_summary"
        includes: ["project_objectives", "scope_definition", "success_criteria"]
      
      - section_id: "development_approach"
        title: "開発アプローチ"
        mandatory: true
        content_type: "methodology_specification"
        includes: ["development_methodology", "process_framework", "quality_approach"]
      
      - section_id: "work_breakdown_structure"
        title: "作業分解構造"
        mandatory: true
        content_type: "wbs_specification"
        includes: ["phase_breakdown", "deliverable_definition", "milestone_identification"]
      
      - section_id: "resource_planning"
        title: "リソース計画"
        mandatory: true
        content_type: "resource_specification"
        includes: ["team_structure", "skill_requirements", "resource_allocation"]
      
      - section_id: "timeline_planning"
        title: "タイムライン計画"
        mandatory: true
        content_type: "schedule_specification"
        includes: ["project_schedule", "critical_path", "dependency_management"]
      
      - section_id: "quality_planning"
        title: "品質計画"
        mandatory: true
        content_type: "quality_specification"
        includes: ["quality_objectives", "quality_processes", "quality_metrics"]
      
      - section_id: "risk_planning"
        title: "リスク計画"
        mandatory: true
        content_type: "risk_specification"
        includes: ["risk_identification", "risk_assessment", "mitigation_strategies"]
  
  content_generation_rules:
    development_approach:
      generation_method: "methodology_selection"
      input_sources:
        - "project_characteristics"
        - "team_capabilities"
        - "technology_constraints"
        - "timeline_requirements"
      quality_criteria:
        - methodology_appropriateness: "手法適切性100%"
        - team_alignment: "チーム整合性100%"
        - process_efficiency: "プロセス効率性95%以上"
    
    work_breakdown_structure:
      generation_method: "wbs_decomposition"
      input_sources:
        - "project_scope"
        - "deliverable_requirements"
        - "technical_architecture"
        - "resource_constraints"
      quality_criteria:
        - decomposition_completeness: "分解完全性100%"
        - deliverable_clarity: "成果物明確性100%"
        - milestone_appropriateness: "マイルストーン適切性100%"
    
    timeline_planning:
      generation_method: "schedule_optimization"
      input_sources:
        - "work_breakdown_structure"
        - "resource_availability"
        - "dependency_analysis"
        - "risk_considerations"
      quality_criteria:
        - schedule_feasibility: "スケジュール実現可能性100%"
        - critical_path_optimization: "クリティカルパス最適化100%"
        - buffer_adequacy: "バッファ妥当性95%以上"
```

### 2.2 リソース配分計画生成ルール
```yaml
resource_allocation_plan_rules:
  document_metadata:
    document_type: "resource_allocation_plan"
    template_id: "RAP_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "resource_requirements"
        title: "リソース要件"
        mandatory: true
        content_type: "requirement_specification"
        includes: ["skill_requirements", "capacity_requirements", "timeline_requirements"]
      
      - section_id: "team_structure"
        title: "チーム構造"
        mandatory: true
        content_type: "team_specification"
        includes: ["organizational_structure", "role_definitions", "responsibility_matrix"]
      
      - section_id: "resource_allocation"
        title: "リソース配分"
        mandatory: true
        content_type: "allocation_specification"
        includes: ["resource_assignment", "workload_distribution", "capacity_planning"]
      
      - section_id: "skill_development_plan"
        title: "スキル開発計画"
        mandatory: true
        content_type: "development_specification"
        includes: ["skill_gap_analysis", "training_plan", "knowledge_transfer"]
      
      - section_id: "resource_optimization"
        title: "リソース最適化"
        mandatory: true
        content_type: "optimization_specification"
        includes: ["efficiency_measures", "utilization_optimization", "cost_optimization"]
      
      - section_id: "contingency_planning"
        title: "コンティンジェンシー計画"
        mandatory: true
        content_type: "contingency_specification"
        includes: ["resource_risks", "backup_plans", "escalation_procedures"]
  
  content_generation_rules:
    resource_requirements:
      generation_method: "requirement_analysis"
      input_sources:
        - "project_scope"
        - "technical_complexity"
        - "timeline_constraints"
        - "quality_requirements"
      quality_criteria:
        - requirement_accuracy: "要件正確性100%"
        - skill_specification_clarity: "スキル仕様明確性100%"
        - capacity_estimation_precision: "キャパシティ見積精度95%以上"
    
    team_structure:
      generation_method: "organizational_design"
      input_sources:
        - "project_requirements"
        - "available_resources"
        - "organizational_constraints"
        - "communication_needs"
      quality_criteria:
        - structure_efficiency: "構造効率性100%"
        - role_clarity: "役割明確性100%"
        - communication_optimization: "コミュニケーション最適化95%以上"
    
    resource_allocation:
      generation_method: "allocation_optimization"
      input_sources:
        - "resource_requirements"
        - "team_structure"
        - "timeline_constraints"
        - "priority_matrix"
      quality_criteria:
        - allocation_efficiency: "配分効率性100%"
        - workload_balance: "作業負荷バランス95%以上"
        - utilization_optimization: "利用率最適化95%以上"
```

### 2.3 リスク管理計画生成ルール
```yaml
risk_management_plan_rules:
  document_metadata:
    document_type: "risk_management_plan"
    template_id: "RMP_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG3"
  
  structure_rules:
    sections:
      - section_id: "risk_management_approach"
        title: "リスク管理アプローチ"
        mandatory: true
        content_type: "approach_specification"
        includes: ["risk_management_strategy", "risk_categories", "assessment_methodology"]
      
      - section_id: "risk_identification"
        title: "リスク特定"
        mandatory: true
        content_type: "identification_specification"
        includes: ["risk_register", "risk_sources", "identification_techniques"]
      
      - section_id: "risk_assessment"
        title: "リスク評価"
        mandatory: true
        content_type: "assessment_specification"
        includes: ["probability_assessment", "impact_analysis", "risk_prioritization"]
      
      - section_id: "risk_response_planning"
        title: "リスク対応計画"
        mandatory: true
        content_type: "response_specification"
        includes: ["mitigation_strategies", "contingency_plans", "response_triggers"]
      
      - section_id: "risk_monitoring"
        title: "リスク監視"
        mandatory: true
        content_type: "monitoring_specification"
        includes: ["monitoring_procedures", "risk_indicators", "reporting_mechanisms"]
      
      - section_id: "risk_communication"
        title: "リスクコミュニケーション"
        mandatory: true
        content_type: "communication_specification"
        includes: ["stakeholder_communication", "escalation_procedures", "reporting_formats"]
  
  content_generation_rules:
    risk_identification:
      generation_method: "risk_analysis"
      input_sources:
        - "project_characteristics"
        - "technology_risks"
        - "organizational_risks"
        - "external_factors"
      quality_criteria:
        - risk_completeness: "リスク完全性95%以上"
        - risk_relevance: "リスク関連性100%"
        - identification_accuracy: "特定精度100%"
    
    risk_assessment:
      generation_method: "assessment_analysis"
      input_sources:
        - "risk_register"
        - "historical_data"
        - "expert_judgment"
        - "quantitative_models"
      quality_criteria:
        - assessment_accuracy: "評価精度95%以上"
        - prioritization_validity: "優先度妥当性100%"
        - impact_quantification: "影響定量化90%以上"
    
    risk_response_planning:
      generation_method: "response_strategy_formulation"
      input_sources:
        - "risk_assessment"
        - "resource_constraints"
        - "organizational_capabilities"
        - "cost_benefit_analysis"
      quality_criteria:
        - response_appropriateness: "対応適切性100%"
        - mitigation_effectiveness: "軽減効果95%以上"
        - contingency_preparedness: "コンティンジェンシー準備100%"
```

## 3. 品質保証ルール

### 3.1 計画品質基準
```yaml
planning_quality_standards:
  plan_completeness:
    scope_coverage:
      - project_scope_completeness: "プロジェクトスコープ完全性100%"
      - deliverable_specification_completeness: "成果物仕様完全性100%"
      - milestone_definition_completeness: "マイルストーン定義完全性100%"
      - resource_requirement_completeness: "リソース要件完全性100%"
    
    plan_feasibility:
      - timeline_feasibility: "タイムライン実現可能性100%"
      - resource_availability: "リソース可用性100%"
      - budget_adequacy: "予算妥当性100%"
      - risk_manageability: "リスク管理可能性95%以上"
  
  plan_quality:
    plan_accuracy:
      - estimation_accuracy: "見積精度90%以上"
      - dependency_identification: "依存関係特定100%"
      - critical_path_accuracy: "クリティカルパス精度100%"
      - resource_allocation_optimization: "リソース配分最適化95%以上"
    
    plan_adaptability:
      - change_accommodation: "変更対応100%"
      - risk_response_flexibility: "リスク対応柔軟性100%"
      - scalability_consideration: "拡張性考慮100%"
      - continuous_improvement: "継続的改善95%以上"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - section_completeness_verification: "セクション完全性検証"
      - plan_consistency_check: "計画一貫性チェック"
      - resource_allocation_validation: "リソース配分検証"
      - timeline_feasibility_check: "タイムライン実現可能性チェック"
    
    content_validation:
      - estimation_accuracy_verification: "見積精度検証"
      - dependency_consistency_check: "依存関係一貫性チェック"
      - risk_coverage_validation: "リスクカバレッジ検証"
      - quality_criteria_compliance: "品質基準準拠"
    
    quality_metrics:
      - plan_completeness_score: "計画完全性スコア"
      - feasibility_score: "実現可能性スコア"
      - optimization_score: "最適化スコア"
      - risk_preparedness_score: "リスク準備性スコア"
  
  expert_review_points:
    planning_review:
      - strategic_alignment_validation: "戦略整合性検証"
      - resource_optimization_assessment: "リソース最適化評価"
      - timeline_realism_evaluation: "タイムライン現実性評価"
      - risk_mitigation_adequacy: "リスク軽減妥当性"
    
    execution_readiness_review:
      - implementation_preparedness: "実装準備性"
      - team_readiness_assessment: "チーム準備性評価"
      - process_maturity_evaluation: "プロセス成熟度評価"
      - quality_assurance_readiness: "品質保証準備性"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    development_plan_document:
      sections: ["project_overview", "development_approach", "timeline_planning"]
      content_depth: "basic_planning"
      detail_level: "essential"
    
    resource_allocation_plan:
      sections: ["resource_requirements", "team_structure", "resource_allocation"]
      content_depth: "basic_allocation"
      detail_level: "simplified"
    
    risk_management_plan:
      sections: ["risk_identification", "risk_assessment", "risk_response_planning"]
      content_depth: "essential_risk_management"
      detail_level: "basic"
  
  planning_simplification:
    wbs_depth: "2レベルまで"
    risk_analysis: "主要リスクのみ"
    resource_planning: "核心リソースのみ"
    timeline_detail: "主要マイルストーンのみ"
  
  quality_maintenance:
    core_planning_preserved: "核心計画保持"
    essential_feasibility: "必須実現可能性100%"
    basic_risk_coverage: "基本リスクカバレッジ100%"
    simplified_optimization: "簡素化最適化95%以上"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    development_plan_document:
      sections: "all_core_sections"
      content_depth: "comprehensive_planning"
      detail_level: "detailed"
    
    resource_allocation_plan:
      sections: "all_sections"
      content_depth: "complete_allocation"
      detail_level: "comprehensive"
    
    risk_management_plan:
      sections: "all_sections"
      content_depth: "complete_risk_management"
      detail_level: "detailed"
  
  planning_enhancement:
    wbs_sophistication: "詳細作業分解"
    risk_analysis_depth: "包括的リスク分析"
    resource_optimization: "高度リソース最適化"
    timeline_precision: "精密タイムライン"
  
  quality_standards:
    full_planning_quality: "完全計画品質"
    comprehensive_feasibility: "包括的実現可能性100%"
    advanced_risk_management: "高度リスク管理100%"
    detailed_optimization: "詳細最適化95%以上"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    development_plan_document:
      sections: "all_sections_plus_advanced_planning"
      content_depth: "enterprise_planning"
      detail_level: "comprehensive"
    
    resource_allocation_plan:
      sections: "all_sections_plus_optimization"
      content_depth: "enterprise_allocation"
      detail_level: "exhaustive"
    
    risk_management_plan:
      sections: "all_sections_plus_advanced_analytics"
      content_depth: "enterprise_risk_management"
      detail_level: "comprehensive"
  
  planning_maximization:
    wbs_elaboration: "網羅的作業分解"
    risk_analysis_sophistication: "高度リスク分析"
    resource_enterprise_optimization: "エンタープライズリソース最適化"
    timeline_enterprise_precision: "エンタープライズタイムライン精度"
  
  quality_excellence:
    enterprise_planning_quality: "エンタープライズ計画品質"
    maximum_feasibility: "最大実現可能性100%"
    enterprise_risk_management: "エンタープライズリスク管理100%"
    comprehensive_optimization: "包括的最適化98%以上"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    project_analysis:
      - scope_analysis: "スコープ分析"
      - complexity_assessment: "複雑度評価"
      - resource_requirement_analysis: "リソース要件分析"
      - risk_identification: "リスク特定"
    
    planning_optimization:
      - schedule_optimization: "スケジュール最適化"
      - resource_allocation_optimization: "リソース配分最適化"
      - risk_mitigation_planning: "リスク軽減計画"
      - quality_planning: "品質計画"
  
  generation_engine:
    plan_generation:
      - wbs_generation: "WBS生成"
      - schedule_creation: "スケジュール作成"
      - resource_planning: "リソース計画"
      - risk_planning: "リスク計画"
    
    optimization_engine:
      - timeline_optimization: "タイムライン最適化"
      - resource_optimization: "リソース最適化"
      - cost_optimization: "コスト最適化"
      - quality_optimization: "品質最適化"
  
  output_validation:
    plan_validation:
      - feasibility_verification: "実現可能性検証"
      - consistency_validation: "一貫性検証"
      - optimization_assessment: "最適化評価"
      - risk_coverage_verification: "リスクカバレッジ検証"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  planning_engine:
    project_analyzer: "プロジェクト分析器"
    wbs_generator: "WBS生成器"
    schedule_optimizer: "スケジュール最適化器"
    resource_planner: "リソース計画器"
  
  optimization_engine:
    timeline_optimizer: "タイムライン最適化器"
    resource_optimizer: "リソース最適化器"
    risk_analyzer: "リスク分析器"
    quality_planner: "品質計画器"
  
  validation_framework:
    plan_validator: "計画検証器"
    feasibility_assessor: "実現可能性評価器"
    consistency_checker: "一貫性チェッカー"
    optimization_verifier: "最適化検証器"
```

---

**STEP5文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
