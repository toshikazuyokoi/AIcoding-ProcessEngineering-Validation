# 品質ゲート文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: QG1-4 - 全品質ゲート  

## 1. 品質ゲート文書生成ルール概要

### 1.1 ルール定義
品質ゲート文書生成ルールは、**QG1-4の全品質ゲートで作成すべき文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
quality_gate_document_generation_objectives:
  primary_purpose: "品質ゲート文書生成自動化"
  
  specific_goals:
    - quality_assessment_documentation: "品質評価文書化"
    - gate_decision_documentation: "ゲート判定文書化"
    - improvement_recommendation_generation: "改善推奨事項生成"
    - compliance_verification_documentation: "コンプライアンス検証文書化"
    - stakeholder_communication_automation: "ステークホルダーコミュニケーション自動化"
```

### 1.3 適用範囲
```yaml
quality_gate_application_scope:
  target_quality_gates:
    - qg1_requirement_completeness: "QG1要件完全性チェック"
    - qg2_architecture_feasibility: "QG2アーキテクチャ実現可能性チェック"
    - qg3_design_completeness: "QG3設計完全性チェック"
    - qg4_implementation_quality: "QG4実装品質チェック"
  
  target_documents:
    - quality_assessment_report: "品質評価レポート"
    - gate_decision_document: "ゲート判定文書"
    - improvement_action_plan: "改善アクション計画"
    - compliance_verification_report: "コンプライアンス検証レポート"
    - stakeholder_communication_summary: "ステークホルダーコミュニケーションサマリー"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 品質評価レポート生成ルール
```yaml
quality_assessment_report_rules:
  document_metadata:
    document_type: "quality_assessment_report"
    template_id: "QAR_TEMPLATE_V3"
    mandatory: true
    applicable_gates: ["QG1", "QG2", "QG3", "QG4"]
  
  structure_rules:
    sections:
      - section_id: "assessment_overview"
        title: "評価概要"
        mandatory: true
        content_type: "overview_specification"
        includes: ["assessment_scope", "evaluation_criteria", "assessment_methodology"]
      
      - section_id: "quality_metrics_analysis"
        title: "品質メトリクス分析"
        mandatory: true
        content_type: "metrics_specification"
        includes: ["quantitative_metrics", "qualitative_assessments", "trend_analysis"]
      
      - section_id: "compliance_assessment"
        title: "コンプライアンス評価"
        mandatory: true
        content_type: "compliance_specification"
        includes: ["standard_compliance", "process_adherence", "regulatory_compliance"]
      
      - section_id: "risk_assessment"
        title: "リスク評価"
        mandatory: true
        content_type: "risk_specification"
        includes: ["identified_risks", "risk_impact_analysis", "mitigation_recommendations"]
      
      - section_id: "quality_score_calculation"
        title: "品質スコア算出"
        mandatory: true
        content_type: "scoring_specification"
        includes: ["weighted_scoring", "category_scores", "overall_quality_score"]
      
      - section_id: "improvement_opportunities"
        title: "改善機会"
        mandatory: true
        content_type: "improvement_specification"
        includes: ["identified_gaps", "improvement_priorities", "recommended_actions"]
  
  gate_specific_rules:
    qg1_specific:
      focus_areas: ["requirement_completeness", "stakeholder_alignment", "scope_clarity"]
      key_metrics: ["requirement_coverage", "stakeholder_satisfaction", "scope_stability"]
      quality_thresholds: {"completeness": 100, "clarity": 95, "traceability": 100}
    
    qg2_specific:
      focus_areas: ["architecture_feasibility", "technology_viability", "integration_consistency"]
      key_metrics: ["feasibility_score", "technology_maturity", "integration_complexity"]
      quality_thresholds: {"feasibility": 95, "viability": 90, "consistency": 100}
    
    qg3_specific:
      focus_areas: ["design_completeness", "implementation_readiness", "testability"]
      key_metrics: ["design_coverage", "implementation_guidance", "test_preparedness"]
      quality_thresholds: {"completeness": 100, "readiness": 95, "testability": 90}
    
    qg4_specific:
      focus_areas: ["implementation_quality", "functional_correctness", "production_readiness"]
      key_metrics: ["code_quality", "test_coverage", "deployment_readiness"]
      quality_thresholds: {"quality": 95, "correctness": 100, "readiness": 95}
  
  content_generation_rules:
    assessment_overview:
      generation_method: "overview_synthesis"
      input_sources:
        - "gate_specific_criteria"
        - "assessment_scope_definition"
        - "evaluation_methodology"
        - "stakeholder_requirements"
      quality_criteria:
        - overview_completeness: "概要完全性100%"
        - scope_clarity: "スコープ明確性100%"
        - methodology_appropriateness: "手法適切性100%"
    
    quality_metrics_analysis:
      generation_method: "metrics_aggregation_analysis"
      input_sources:
        - "automated_quality_checks"
        - "manual_assessment_results"
        - "historical_quality_data"
        - "benchmark_comparisons"
      quality_criteria:
        - metrics_accuracy: "メトリクス精度100%"
        - analysis_depth: "分析深度95%以上"
        - trend_identification: "トレンド特定100%"
    
    improvement_opportunities:
      generation_method: "gap_analysis_synthesis"
      input_sources:
        - "quality_assessment_results"
        - "compliance_gaps"
        - "risk_analysis"
        - "best_practice_comparisons"
      quality_criteria:
        - gap_identification_accuracy: "ギャップ特定精度100%"
        - prioritization_validity: "優先度妥当性100%"
        - actionability: "実行可能性95%以上"
```

### 2.2 ゲート判定文書生成ルール
```yaml
gate_decision_document_rules:
  document_metadata:
    document_type: "gate_decision_document"
    template_id: "GDD_TEMPLATE_V3"
    mandatory: true
    applicable_gates: ["QG1", "QG2", "QG3", "QG4"]
  
  structure_rules:
    sections:
      - section_id: "decision_summary"
        title: "判定サマリー"
        mandatory: true
        content_type: "decision_specification"
        includes: ["gate_decision", "decision_rationale", "confidence_level"]
      
      - section_id: "evaluation_results"
        title: "評価結果"
        mandatory: true
        content_type: "results_specification"
        includes: ["criteria_evaluation", "score_breakdown", "pass_fail_analysis"]
      
      - section_id: "evidence_summary"
        title: "証拠サマリー"
        mandatory: true
        content_type: "evidence_specification"
        includes: ["supporting_evidence", "quality_artifacts", "verification_results"]
      
      - section_id: "conditions_requirements"
        title: "条件・要件"
        mandatory: true
        content_type: "conditions_specification"
        includes: ["pass_conditions", "conditional_requirements", "next_gate_prerequisites"]
      
      - section_id: "risk_considerations"
        title: "リスク考慮事項"
        mandatory: true
        content_type: "risk_specification"
        includes: ["identified_risks", "risk_mitigation", "monitoring_requirements"]
      
      - section_id: "stakeholder_approval"
        title: "ステークホルダー承認"
        mandatory: true
        content_type: "approval_specification"
        includes: ["approval_status", "stakeholder_feedback", "escalation_items"]
  
  decision_logic_rules:
    pass_criteria:
      overall_score: "≥90点"
      critical_criteria: "100%満足"
      risk_level: "許容範囲内"
      stakeholder_approval: "必要承認取得"
    
    conditional_pass_criteria:
      overall_score: "85-89点"
      critical_criteria: "95%以上満足"
      minor_issues_only: "軽微な課題のみ"
      mitigation_plan: "軽減計画承認済み"
    
    fail_criteria:
      overall_score: "<85点"
      critical_gaps: "重大ギャップ存在"
      unacceptable_risks: "許容不可リスク"
      stakeholder_concerns: "重大懸念事項"
  
  content_generation_rules:
    decision_summary:
      generation_method: "decision_synthesis"
      input_sources:
        - "quality_assessment_results"
        - "evaluation_criteria"
        - "risk_assessment"
        - "stakeholder_input"
      quality_criteria:
        - decision_clarity: "判定明確性100%"
        - rationale_completeness: "根拠完全性100%"
        - confidence_justification: "信頼度正当化100%"
    
    evaluation_results:
      generation_method: "results_compilation"
      input_sources:
        - "automated_evaluations"
        - "manual_assessments"
        - "expert_reviews"
        - "stakeholder_validations"
      quality_criteria:
        - results_accuracy: "結果精度100%"
        - breakdown_completeness: "内訳完全性100%"
        - analysis_objectivity: "分析客観性100%"
```

### 2.3 改善アクション計画生成ルール
```yaml
improvement_action_plan_rules:
  document_metadata:
    document_type: "improvement_action_plan"
    template_id: "IAP_TEMPLATE_V3"
    mandatory: true
    applicable_gates: ["QG1", "QG2", "QG3", "QG4"]
  
  structure_rules:
    sections:
      - section_id: "improvement_overview"
        title: "改善概要"
        mandatory: true
        content_type: "overview_specification"
        includes: ["improvement_objectives", "scope_definition", "success_criteria"]
      
      - section_id: "gap_analysis"
        title: "ギャップ分析"
        mandatory: true
        content_type: "gap_specification"
        includes: ["identified_gaps", "root_cause_analysis", "impact_assessment"]
      
      - section_id: "action_items"
        title: "アクション項目"
        mandatory: true
        content_type: "action_specification"
        includes: ["specific_actions", "responsibility_assignment", "timeline_definition"]
      
      - section_id: "resource_requirements"
        title: "リソース要件"
        mandatory: true
        content_type: "resource_specification"
        includes: ["human_resources", "tool_requirements", "budget_considerations"]
      
      - section_id: "implementation_plan"
        title: "実装計画"
        mandatory: true
        content_type: "implementation_specification"
        includes: ["implementation_phases", "milestone_definition", "dependency_management"]
      
      - section_id: "monitoring_framework"
        title: "監視フレームワーク"
        mandatory: true
        content_type: "monitoring_specification"
        includes: ["progress_tracking", "success_metrics", "review_schedule"]
  
  content_generation_rules:
    gap_analysis:
      generation_method: "gap_identification_analysis"
      input_sources:
        - "quality_assessment_gaps"
        - "compliance_deficiencies"
        - "risk_factors"
        - "stakeholder_feedback"
      quality_criteria:
        - gap_identification_completeness: "ギャップ特定完全性100%"
        - root_cause_accuracy: "根本原因精度95%以上"
        - impact_assessment_validity: "影響評価妥当性100%"
    
    action_items:
      generation_method: "action_planning"
      input_sources:
        - "gap_analysis_results"
        - "improvement_priorities"
        - "resource_constraints"
        - "timeline_requirements"
      quality_criteria:
        - action_specificity: "アクション具体性100%"
        - responsibility_clarity: "責任明確性100%"
        - timeline_feasibility: "タイムライン実現可能性100%"
    
    implementation_plan:
      generation_method: "implementation_planning"
      input_sources:
        - "action_items"
        - "resource_availability"
        - "organizational_constraints"
        - "risk_considerations"
      quality_criteria:
        - plan_feasibility: "計画実現可能性100%"
        - phase_logic: "フェーズ論理性100%"
        - dependency_management: "依存関係管理100%"
```

## 3. 品質保証ルール

### 3.1 品質ゲート文書品質基準
```yaml
quality_gate_document_standards:
  assessment_quality:
    objectivity_standards:
      - evidence_based_assessment: "証拠に基づく評価100%"
      - bias_elimination: "バイアス排除100%"
      - consistent_criteria_application: "一貫基準適用100%"
      - stakeholder_neutrality: "ステークホルダー中立性100%"
    
    accuracy_standards:
      - metrics_calculation_accuracy: "メトリクス計算精度100%"
      - assessment_result_validity: "評価結果妥当性100%"
      - decision_logic_consistency: "判定ロジック一貫性100%"
      - recommendation_appropriateness: "推奨事項適切性100%"
  
  decision_quality:
    decision_clarity:
      - decision_statement_clarity: "判定声明明確性100%"
      - rationale_completeness: "根拠完全性100%"
      - condition_specification_precision: "条件仕様精度100%"
      - next_step_guidance_clarity: "次ステップガイダンス明確性100%"
    
    stakeholder_alignment:
      - stakeholder_consensus: "ステークホルダー合意95%以上"
      - communication_effectiveness: "コミュニケーション効果100%"
      - expectation_management: "期待値管理100%"
      - feedback_incorporation: "フィードバック組み込み100%"
```

### 3.2 文書品質検証
```yaml
document_quality_verification:
  automated_validation:
    structure_validation:
      - section_completeness_verification: "セクション完全性検証"
      - gate_specific_content_validation: "ゲート固有内容検証"
      - decision_logic_consistency_check: "判定ロジック一貫性チェック"
      - stakeholder_requirement_compliance: "ステークホルダー要件準拠"
    
    content_validation:
      - assessment_accuracy_verification: "評価精度検証"
      - metrics_calculation_validation: "メトリクス計算検証"
      - decision_rationale_completeness: "判定根拠完全性"
      - improvement_action_feasibility: "改善アクション実現可能性"
    
    quality_metrics:
      - assessment_objectivity_score: "評価客観性スコア"
      - decision_clarity_score: "判定明確性スコア"
      - stakeholder_satisfaction_score: "ステークホルダー満足度スコア"
      - improvement_actionability_score: "改善実行可能性スコア"
  
  expert_review_points:
    assessment_review:
      - evaluation_methodology_appropriateness: "評価手法適切性"
      - criteria_application_consistency: "基準適用一貫性"
      - risk_assessment_completeness: "リスク評価完全性"
      - quality_score_validity: "品質スコア妥当性"
    
    decision_review:
      - decision_logic_soundness: "判定ロジック健全性"
      - stakeholder_alignment_verification: "ステークホルダー整合性検証"
      - improvement_plan_effectiveness: "改善計画効果"
      - communication_clarity_assessment: "コミュニケーション明確性評価"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    quality_assessment_report:
      sections: ["assessment_overview", "quality_metrics_analysis", "quality_score_calculation"]
      content_depth: "basic_assessment"
      detail_level: "essential"
    
    gate_decision_document:
      sections: ["decision_summary", "evaluation_results", "conditions_requirements"]
      content_depth: "core_decision"
      detail_level: "simplified"
    
    improvement_action_plan:
      sections: ["improvement_overview", "gap_analysis", "action_items"]
      content_depth: "essential_improvements"
      detail_level: "basic"
  
  assessment_simplification:
    metrics_scope: "核心メトリクスのみ"
    analysis_depth: "基本分析"
    stakeholder_involvement: "主要ステークホルダーのみ"
    documentation_detail: "必須文書化のみ"
  
  quality_maintenance:
    core_quality_preserved: "核心品質保持"
    essential_decision_clarity: "必須判定明確性100%"
    basic_improvement_guidance: "基本改善ガイダンス100%"
    simplified_communication: "簡素化コミュニケーション100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    quality_assessment_report:
      sections: "all_core_sections"
      content_depth: "comprehensive_assessment"
      detail_level: "detailed"
    
    gate_decision_document:
      sections: "all_sections"
      content_depth: "complete_decision"
      detail_level: "comprehensive"
    
    improvement_action_plan:
      sections: "all_sections"
      content_depth: "complete_improvements"
      detail_level: "detailed"
  
  assessment_enhancement:
    metrics_sophistication: "詳細メトリクス"
    analysis_comprehensiveness: "包括的分析"
    stakeholder_engagement: "全ステークホルダー関与"
    documentation_thoroughness: "徹底的文書化"
  
  quality_standards:
    full_quality_application: "完全品質適用"
    comprehensive_decision_support: "包括的判定サポート100%"
    advanced_improvement_planning: "高度改善計画100%"
    detailed_communication: "詳細コミュニケーション100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    quality_assessment_report:
      sections: "all_sections_plus_advanced_analytics"
      content_depth: "enterprise_assessment"
      detail_level: "exhaustive"
    
    gate_decision_document:
      sections: "all_sections_plus_governance"
      content_depth: "enterprise_decision"
      detail_level: "comprehensive"
    
    improvement_action_plan:
      sections: "all_sections_plus_strategic_alignment"
      content_depth: "enterprise_improvements"
      detail_level: "comprehensive"
  
  assessment_maximization:
    metrics_enterprise_level: "エンタープライズメトリクス"
    analysis_strategic_depth: "戦略的分析深度"
    stakeholder_enterprise_engagement: "エンタープライズステークホルダーエンゲージメント"
    documentation_enterprise_standards: "エンタープライズ文書標準"
  
  quality_excellence:
    enterprise_quality_application: "エンタープライズ品質適用"
    maximum_decision_support: "最大判定サポート100%"
    enterprise_improvement_planning: "エンタープライズ改善計画100%"
    comprehensive_communication: "包括的コミュニケーション100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    quality_data_analysis:
      - metrics_aggregation: "メトリクス集約"
      - assessment_result_compilation: "評価結果編集"
      - stakeholder_feedback_analysis: "ステークホルダーフィードバック分析"
      - historical_data_comparison: "履歴データ比較"
    
    decision_support_analysis:
      - criteria_evaluation: "基準評価"
      - risk_impact_assessment: "リスク影響評価"
      - stakeholder_alignment_analysis: "ステークホルダー整合性分析"
      - improvement_opportunity_identification: "改善機会特定"
  
  generation_engine:
    document_generation:
      - assessment_report_synthesis: "評価レポート合成"
      - decision_document_creation: "判定文書作成"
      - improvement_plan_formulation: "改善計画策定"
      - communication_material_generation: "コミュニケーション資料生成"
    
    decision_support:
      - automated_scoring: "自動スコアリング"
      - decision_recommendation: "判定推奨"
      - risk_prioritization: "リスク優先度付け"
      - action_planning: "アクション計画"
  
  output_validation:
    quality_validation:
      - assessment_accuracy_verification: "評価精度検証"
      - decision_consistency_validation: "判定一貫性検証"
      - stakeholder_alignment_check: "ステークホルダー整合性チェック"
      - improvement_feasibility_assessment: "改善実現可能性評価"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  assessment_engine:
    quality_analyzer: "品質分析器"
    metrics_calculator: "メトリクス計算器"
    compliance_checker: "コンプライアンスチェッカー"
    risk_assessor: "リスク評価器"
  
  decision_engine:
    criteria_evaluator: "基準評価器"
    decision_synthesizer: "判定合成器"
    stakeholder_aligner: "ステークホルダー整合器"
    communication_generator: "コミュニケーション生成器"
  
  improvement_engine:
    gap_analyzer: "ギャップ分析器"
    action_planner: "アクション計画器"
    resource_optimizer: "リソース最適化器"
    progress_tracker: "進捗追跡器"
```

---

**品質ゲート文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
