# STEP0文書生成ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: 文書生成ルール層  
**対象段階**: STEP0 - ゴール定義  

## 1. STEP0文書生成ルール概要

### 1.1 ルール定義
STEP0文書生成ルールは、**ゴール定義段階で作成すべき全文書の構造・内容・品質基準を軽量YAML形式で定義**し、AIによる動的文書生成を可能にするルールセットである。

### 1.2 ルール目的
```yaml
step0_document_generation_objectives:
  primary_purpose: "ゴール定義段階の文書生成自動化"
  
  specific_goals:
    - document_structure_standardization: "文書構造標準化"
    - content_quality_assurance: "内容品質保証"
    - generation_automation: "生成自動化"
    - consistency_maintenance: "一貫性維持"
    - efficiency_optimization: "効率性最適化"
```

### 1.3 適用範囲
```yaml
step0_application_scope:
  target_documents:
    - project_charter: "プロジェクト憲章"
    - business_case: "ビジネスケース"
    - stakeholder_analysis: "ステークホルダー分析"
    - success_criteria: "成功基準"
    - risk_assessment: "リスク評価"
    - project_scope: "プロジェクトスコープ"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 文書生成ルール定義

### 2.1 プロジェクト憲章生成ルール
```yaml
project_charter_generation_rules:
  document_metadata:
    document_type: "project_charter"
    template_id: "PC_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG1"
  
  structure_rules:
    sections:
      - section_id: "executive_summary"
        title: "エグゼクティブサマリー"
        mandatory: true
        content_type: "narrative"
        max_length: 500
      
      - section_id: "project_overview"
        title: "プロジェクト概要"
        mandatory: true
        content_type: "structured"
        subsections:
          - "project_name"
          - "project_description"
          - "project_objectives"
          - "project_scope"
      
      - section_id: "business_justification"
        title: "ビジネス正当性"
        mandatory: true
        content_type: "analytical"
        subsections:
          - "business_need"
          - "expected_benefits"
          - "cost_benefit_analysis"
          - "roi_projection"
      
      - section_id: "stakeholder_overview"
        title: "ステークホルダー概要"
        mandatory: true
        content_type: "tabular"
        format: "stakeholder_matrix"
      
      - section_id: "success_criteria"
        title: "成功基準"
        mandatory: true
        content_type: "criteria_list"
        format: "smart_criteria"
      
      - section_id: "high_level_timeline"
        title: "高レベルタイムライン"
        mandatory: true
        content_type: "timeline"
        format: "milestone_chart"
  
  content_generation_rules:
    executive_summary:
      generation_method: "synthesis"
      input_sources:
        - "business_case"
        - "project_objectives"
        - "success_criteria"
      quality_criteria:
        - clarity: "明確性100%"
        - completeness: "完全性95%以上"
        - conciseness: "簡潔性（500語以内）"
    
    project_overview:
      generation_method: "structured_extraction"
      input_sources:
        - "project_requirements"
        - "stakeholder_input"
        - "business_context"
      quality_criteria:
        - accuracy: "正確性100%"
        - consistency: "一貫性100%"
        - traceability: "追跡可能性100%"
    
    business_justification:
      generation_method: "analytical_synthesis"
      input_sources:
        - "business_case"
        - "market_analysis"
        - "cost_estimates"
      quality_criteria:
        - logical_coherence: "論理的一貫性100%"
        - evidence_based: "証拠に基づく100%"
        - quantifiable: "定量化可能90%以上"
  
  scale_specific_rules:
    essential_level:
      sections_required: ["executive_summary", "project_overview", "success_criteria"]
      detail_level: "basic"
      content_depth: "essential_only"
    
    standard_level:
      sections_required: "all_sections"
      detail_level: "standard"
      content_depth: "comprehensive"
    
    comprehensive_level:
      sections_required: "all_sections_plus_appendices"
      detail_level: "detailed"
      content_depth: "exhaustive"
```

### 2.2 ビジネスケース生成ルール
```yaml
business_case_generation_rules:
  document_metadata:
    document_type: "business_case"
    template_id: "BC_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG1"
  
  structure_rules:
    sections:
      - section_id: "business_need"
        title: "ビジネスニーズ"
        mandatory: true
        content_type: "problem_statement"
        analysis_depth: "root_cause"
      
      - section_id: "solution_overview"
        title: "ソリューション概要"
        mandatory: true
        content_type: "solution_description"
        detail_level: "high_level"
      
      - section_id: "benefits_analysis"
        title: "便益分析"
        mandatory: true
        content_type: "benefit_quantification"
        format: "benefit_matrix"
      
      - section_id: "cost_analysis"
        title: "コスト分析"
        mandatory: true
        content_type: "cost_breakdown"
        format: "cost_structure"
      
      - section_id: "risk_assessment"
        title: "リスク評価"
        mandatory: true
        content_type: "risk_analysis"
        format: "risk_register"
      
      - section_id: "implementation_approach"
        title: "実装アプローチ"
        mandatory: true
        content_type: "approach_description"
        detail_level: "strategic"
      
      - section_id: "recommendation"
        title: "推奨事項"
        mandatory: true
        content_type: "decision_recommendation"
        format: "go_no_go"
  
  content_generation_rules:
    business_need:
      generation_method: "problem_analysis"
      input_sources:
        - "stakeholder_interviews"
        - "current_state_analysis"
        - "pain_point_identification"
      quality_criteria:
        - problem_clarity: "問題明確性100%"
        - impact_quantification: "影響定量化90%以上"
        - urgency_justification: "緊急性正当化100%"
    
    benefits_analysis:
      generation_method: "benefit_quantification"
      input_sources:
        - "expected_outcomes"
        - "value_drivers"
        - "benchmark_data"
      quality_criteria:
        - quantifiable_benefits: "定量化便益80%以上"
        - realistic_projections: "現実的予測100%"
        - measurable_outcomes: "測定可能成果100%"
    
    cost_analysis:
      generation_method: "cost_estimation"
      input_sources:
        - "resource_requirements"
        - "technology_costs"
        - "operational_costs"
      quality_criteria:
        - cost_accuracy: "コスト精度±15%以内"
        - comprehensive_coverage: "包括的カバレッジ100%"
        - lifecycle_consideration: "ライフサイクル考慮100%"
```

### 2.3 ステークホルダー分析生成ルール
```yaml
stakeholder_analysis_generation_rules:
  document_metadata:
    document_type: "stakeholder_analysis"
    template_id: "SA_TEMPLATE_V3"
    mandatory: true
    quality_gate: "QG1"
  
  structure_rules:
    sections:
      - section_id: "stakeholder_identification"
        title: "ステークホルダー特定"
        mandatory: true
        content_type: "stakeholder_catalog"
        format: "stakeholder_registry"
      
      - section_id: "influence_interest_analysis"
        title: "影響力・関心度分析"
        mandatory: true
        content_type: "matrix_analysis"
        format: "power_interest_grid"
      
      - section_id: "stakeholder_requirements"
        title: "ステークホルダー要件"
        mandatory: true
        content_type: "requirement_mapping"
        format: "requirement_matrix"
      
      - section_id: "communication_strategy"
        title: "コミュニケーション戦略"
        mandatory: true
        content_type: "communication_plan"
        format: "communication_matrix"
      
      - section_id: "engagement_plan"
        title: "エンゲージメント計画"
        mandatory: true
        content_type: "engagement_strategy"
        format: "engagement_roadmap"
  
  content_generation_rules:
    stakeholder_identification:
      generation_method: "systematic_identification"
      input_sources:
        - "organizational_chart"
        - "project_scope"
        - "impact_analysis"
      quality_criteria:
        - completeness: "完全性95%以上"
        - categorization_accuracy: "分類精度100%"
        - role_clarity: "役割明確性100%"
    
    influence_interest_analysis:
      generation_method: "matrix_analysis"
      input_sources:
        - "stakeholder_interviews"
        - "organizational_analysis"
        - "project_impact_assessment"
      quality_criteria:
        - analysis_accuracy: "分析精度90%以上"
        - positioning_validity: "ポジショニング妥当性100%"
        - actionable_insights: "実行可能洞察100%"
    
    communication_strategy:
      generation_method: "strategy_formulation"
      input_sources:
        - "stakeholder_preferences"
        - "communication_channels"
        - "project_timeline"
      quality_criteria:
        - strategy_alignment: "戦略整合性100%"
        - channel_appropriateness: "チャネル適切性100%"
        - frequency_optimization: "頻度最適化100%"
```

## 3. 品質保証ルール

### 3.1 内容品質基準
```yaml
content_quality_standards:
  accuracy_standards:
    factual_accuracy: "事実正確性100%"
    data_consistency: "データ一貫性100%"
    reference_validity: "参照妥当性100%"
    calculation_correctness: "計算正確性100%"
  
  completeness_standards:
    section_completeness: "セクション完全性100%"
    content_coverage: "内容カバレッジ95%以上"
    requirement_satisfaction: "要件満足度100%"
    stakeholder_coverage: "ステークホルダーカバレッジ100%"
  
  clarity_standards:
    language_clarity: "言語明確性95%以上"
    structure_clarity: "構造明確性100%"
    purpose_clarity: "目的明確性100%"
    action_clarity: "アクション明確性100%"
  
  consistency_standards:
    terminology_consistency: "用語一貫性100%"
    format_consistency: "形式一貫性100%"
    style_consistency: "スタイル一貫性100%"
    cross_reference_consistency: "相互参照一貫性100%"
```

### 3.2 生成品質検証
```yaml
generation_quality_verification:
  automated_checks:
    structure_validation:
      - section_presence_check: "セクション存在チェック"
      - mandatory_content_verification: "必須内容検証"
      - format_compliance_check: "形式準拠チェック"
      - cross_reference_validation: "相互参照検証"
    
    content_validation:
      - factual_consistency_check: "事実一貫性チェック"
      - calculation_verification: "計算検証"
      - data_integrity_check: "データ整合性チェック"
      - requirement_coverage_check: "要件カバレッジチェック"
    
    quality_metrics:
      - readability_score: "可読性スコア"
      - completeness_score: "完全性スコア"
      - consistency_score: "一貫性スコア"
      - accuracy_score: "正確性スコア"
  
  manual_review_points:
    strategic_alignment:
      - business_strategy_alignment: "ビジネス戦略整合性"
      - organizational_fit: "組織適合性"
      - market_relevance: "市場関連性"
      - competitive_positioning: "競争ポジショニング"
    
    stakeholder_validation:
      - stakeholder_approval: "ステークホルダー承認"
      - requirement_confirmation: "要件確認"
      - expectation_alignment: "期待値整合"
      - concern_resolution: "懸念解決"
```

## 4. 規模別調整ルール

### 4.1 Essential レベル調整
```yaml
essential_level_adjustments:
  document_scope_reduction:
    project_charter:
      sections: ["executive_summary", "project_overview", "success_criteria"]
      content_depth: "essential_only"
      detail_level: "high_level"
    
    business_case:
      sections: ["business_need", "solution_overview", "benefits_analysis", "recommendation"]
      content_depth: "core_elements"
      detail_level: "summary"
    
    stakeholder_analysis:
      sections: ["stakeholder_identification", "influence_interest_analysis", "communication_strategy"]
      content_depth: "key_stakeholders"
      detail_level: "basic"
  
  content_simplification:
    narrative_reduction: "50%削減"
    analysis_depth: "基本レベル"
    example_count: "最小限"
    appendix_elimination: "付録除去"
  
  quality_maintenance:
    core_quality_preserved: "核心品質保持"
    essential_accuracy: "必須正確性100%"
    basic_completeness: "基本完全性100%"
    simplified_consistency: "簡素化一貫性100%"
```

### 4.2 Standard レベル調整
```yaml
standard_level_adjustments:
  document_scope_standard:
    project_charter:
      sections: "all_core_sections"
      content_depth: "standard"
      detail_level: "detailed"
    
    business_case:
      sections: "all_sections"
      content_depth: "comprehensive"
      detail_level: "analytical"
    
    stakeholder_analysis:
      sections: "all_sections"
      content_depth: "complete_analysis"
      detail_level: "strategic"
  
  content_enhancement:
    narrative_expansion: "標準レベル"
    analysis_depth: "詳細レベル"
    example_inclusion: "適切な例"
    appendix_inclusion: "関連付録"
  
  quality_standards:
    full_quality_application: "完全品質適用"
    standard_accuracy: "標準正確性100%"
    comprehensive_completeness: "包括的完全性100%"
    detailed_consistency: "詳細一貫性100%"
```

### 4.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  document_scope_expansion:
    project_charter:
      sections: "all_sections_plus_appendices"
      content_depth: "exhaustive"
      detail_level: "comprehensive"
    
    business_case:
      sections: "all_sections_plus_detailed_analysis"
      content_depth: "enterprise_level"
      detail_level: "strategic_analytical"
    
    stakeholder_analysis:
      sections: "all_sections_plus_detailed_strategies"
      content_depth: "enterprise_stakeholder_management"
      detail_level: "comprehensive_strategic"
  
  content_maximization:
    narrative_elaboration: "詳細レベル"
    analysis_depth: "包括的レベル"
    example_abundance: "豊富な例"
    appendix_comprehensive: "包括的付録"
  
  quality_excellence:
    premium_quality_application: "プレミアム品質適用"
    enterprise_accuracy: "エンタープライズ正確性100%"
    exhaustive_completeness: "網羅的完全性100%"
    enterprise_consistency: "エンタープライズ一貫性100%"
```

## 5. 自動生成実装ガイド

### 5.1 AI統合仕様
```yaml
ai_integration_specifications:
  input_processing:
    data_ingestion:
      - stakeholder_input: "ステークホルダー入力"
      - business_context: "ビジネス文脈"
      - organizational_data: "組織データ"
      - market_information: "市場情報"
    
    context_analysis:
      - requirement_extraction: "要件抽出"
      - stakeholder_analysis: "ステークホルダー分析"
      - business_need_identification: "ビジネスニーズ特定"
      - constraint_identification: "制約特定"
  
  generation_engine:
    rule_application:
      - structure_rule_enforcement: "構造ルール適用"
      - content_rule_application: "内容ルール適用"
      - quality_rule_validation: "品質ルール検証"
      - scale_rule_adjustment: "規模ルール調整"
    
    content_synthesis:
      - template_instantiation: "テンプレート実体化"
      - content_generation: "内容生成"
      - quality_optimization: "品質最適化"
      - consistency_enforcement: "一貫性強制"
  
  output_validation:
    quality_assurance:
      - automated_quality_check: "自動品質チェック"
      - consistency_validation: "一貫性検証"
      - completeness_verification: "完全性検証"
      - accuracy_confirmation: "正確性確認"
```

### 5.2 実装アーキテクチャ
```yaml
implementation_architecture:
  rule_engine:
    rule_parser: "ルール解析器"
    rule_validator: "ルール検証器"
    rule_executor: "ルール実行器"
    rule_optimizer: "ルール最適化器"
  
  content_generator:
    template_engine: "テンプレートエンジン"
    content_synthesizer: "内容合成器"
    quality_controller: "品質制御器"
    output_formatter: "出力フォーマッター"
  
  integration_layer:
    input_adapter: "入力アダプター"
    output_adapter: "出力アダプター"
    validation_service: "検証サービス"
    monitoring_service: "監視サービス"
```

---

**STEP0文書生成ルール定義者**: プロセスエンジニアリングシステム ver3  
**ルール品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**生成効率**: 4,000 tokens以下保証  
**更新日**: 2025-07-01
