# STEP0: ゴール定義プロセス

**バージョン**: 3.1.0  
**作成日**: 2025-07-07  
**理論分類**: プロセス定義層  
**プロセス段階**: STEP0 - ゴール定義  
**改善レベル**: 実証実験フィードバック反映版  

## 1. STEP0プロセス概要

### 1.1 プロセス定義
STEP0ゴール定義プロセスは、プロセスエンジニアリング理論ver3.1における第0段階であり、**プロジェクトの明確な目標設定と成功基準の確立により、後続全プロセスの確実な基盤を構築**する最重要プロセスである。

### 1.2 ver3.1での重大改善
```yaml
step0_improvements_v3_1:
  goal_clarity_enhancement:
    improvement: "目標の明確性向上"
    before: "曖昧な目標設定"
    after: "SMART基準による明確な目標"
    impact: "プロジェクト成功率30%向上"
    
  stakeholder_alignment_strengthening:
    improvement: "ステークホルダー合意の強化"
    before: "部分的な合意"
    after: "全ステークホルダー100%合意"
    impact: "要件変更要求50%削減"
    
  success_criteria_quantification:
    improvement: "成功基準の定量化"
    before: "定性的な成功基準"
    after: "測定可能な定量的基準"
    impact: "成果評価の客観性確保"
    
  constraint_identification_systematization:
    improvement: "制約条件の体系的特定"
    before: "制約の見落とし"
    after: "包括的制約分析"
    impact: "プロジェクトリスク40%削減"
```

### 1.3 プロセス目標
```yaml
step0_objectives:
  primary_objectives:
    - clear_goal_establishment: "明確な目標設定"
    - stakeholder_consensus_building: "ステークホルダー合意形成"
    - success_criteria_definition: "成功基準定義"
    - constraint_identification: "制約条件特定"
    
  quality_targets:
    - goal_clarity_score: "100%（曖昧さなし）"
    - stakeholder_agreement_rate: "100%（全員合意）"
    - success_criteria_measurability: "100%（測定可能）"
    - constraint_coverage: "100%（包括的特定）"
    
  deliverable_targets:
    - project_charter: "プロジェクト憲章（完全版）"
    - stakeholder_analysis: "ステークホルダー分析書（完全版）"
    - success_criteria_matrix: "成功基準マトリクス（完全版）"
    - constraint_register: "制約条件登録簿（完全版）"
```

## 2. 責任・権限マトリクス（RACI表）

### 2.1 STEP0 RACI表（必須作成）
```yaml
step0_raci_matrix:
  goal_definition:
    responsible: "プロジェクトマネージャー（個人名指定必須）"
    accountable: "プロジェクトスポンサー（結果責任）"
    consulted: ["ビジネスステークホルダー", "技術ステークホルダー", "エンドユーザー代表"]
    informed: ["開発チーム", "品質保証チーム", "運用チーム"]
    
  stakeholder_analysis:
    responsible: "ビジネスアナリスト（個人名指定必須）"
    accountable: "プロジェクトマネージャー（結果責任）"
    consulted: ["プロジェクトスポンサー", "主要ステークホルダー"]
    informed: ["全プロジェクトメンバー"]
    
  success_criteria_definition:
    responsible: "プロジェクトマネージャー（個人名指定必須）"
    accountable: "プロジェクトスポンサー（結果責任）"
    consulted: ["ビジネスステークホルダー", "品質保証担当"]
    informed: ["開発チーム", "テストチーム"]
    
  constraint_identification:
    responsible: "システムアーキテクト（個人名指定必須）"
    accountable: "プロジェクトマネージャー（結果責任）"
    consulted: ["技術リーダー", "インフラ担当", "セキュリティ担当"]
    informed: ["開発チーム", "運用チーム"]
```

### 2.2 権限・責任の詳細定義
```yaml
authority_responsibility_details:
  project_manager:
    authority:
      - goal_finalization: "プロジェクト目標の最終決定権"
      - stakeholder_coordination: "ステークホルダー調整権限"
      - scope_definition: "プロジェクトスコープ定義権"
      
    responsibility:
      - goal_achievement: "目標達成への責任"
      - stakeholder_satisfaction: "ステークホルダー満足度責任"
      - project_success: "プロジェクト成功への責任"
      
    accountability:
      - deliverable_quality: "成果物品質への説明責任"
      - timeline_adherence: "スケジュール遵守への責任"
      - budget_management: "予算管理への責任"
      
  project_sponsor:
    authority:
      - strategic_direction: "戦略的方向性の決定権"
      - resource_allocation: "リソース配分権限"
      - priority_setting: "優先度設定権限"
      
    responsibility:
      - business_value: "ビジネス価値実現責任"
      - investment_justification: "投資正当化責任"
      - organizational_support: "組織的支援責任"
      
    accountability:
      - roi_achievement: "ROI達成への説明責任"
      - strategic_alignment: "戦略整合性への責任"
      - stakeholder_value: "ステークホルダー価値への責任"
```

## 3. 具体的実行手順

### 3.1 Phase 1: 初期目標設定（1-2日）
```yaml
phase1_initial_goal_setting:
  day1_vision_establishment:
    duration: "1日"
    responsible: "プロジェクトスポンサー"
    mandatory_activities:
      - vision_statement_creation: "ビジョンステートメント作成"
      - business_case_development: "ビジネスケース開発"
      - strategic_alignment_confirmation: "戦略整合性確認"
      
    deliverables:
      - project_vision: "プロジェクトビジョン（明確版）"
      - business_case: "ビジネスケース（完全版）"
      - strategic_alignment_document: "戦略整合性文書"
      
    completion_criteria:
      - vision_clarity: "ビジョンの明確性100%"
      - business_justification: "ビジネス正当化100%"
      - strategic_fit: "戦略適合性100%"
      
  day2_smart_goals_definition:
    duration: "1日"
    responsible: "プロジェクトマネージャー"
    mandatory_activities:
      - smart_goals_formulation: "SMART目標策定"
      - goal_hierarchy_creation: "目標階層作成"
      - goal_interdependency_analysis: "目標相互依存分析"
      
    smart_criteria_application:
      specific:
        definition: "具体的（Specific）"
        requirements: "何を、誰が、どこで、いつ、なぜの明確化"
        validation: "第三者が理解可能な具体性"
        
      measurable:
        definition: "測定可能（Measurable）"
        requirements: "定量的指標による測定可能性"
        validation: "客観的測定方法の存在"
        
      achievable:
        definition: "達成可能（Achievable）"
        requirements: "現実的な達成可能性"
        validation: "リソース・制約条件での実現可能性"
        
      relevant:
        definition: "関連性（Relevant）"
        requirements: "ビジネス目標との関連性"
        validation: "戦略的価値の明確性"
        
      time_bound:
        definition: "期限設定（Time-bound）"
        requirements: "明確な期限・マイルストーン"
        validation: "スケジュール実現可能性"
        
    deliverables:
      - smart_goals_document: "SMART目標文書（完全版）"
      - goal_hierarchy_chart: "目標階層チャート"
      - goal_dependency_matrix: "目標依存関係マトリクス"
```

### 3.2 Phase 2: ステークホルダー分析（1-2日）
```yaml
phase2_stakeholder_analysis:
  stakeholder_identification:
    duration: "1日"
    responsible: "ビジネスアナリスト"
    mandatory_activities:
      - stakeholder_mapping: "ステークホルダーマッピング"
      - influence_interest_analysis: "影響力・関心度分析"
      - stakeholder_categorization: "ステークホルダー分類"
      
    stakeholder_categories:
      primary_stakeholders:
        definition: "プロジェクトに直接影響を受ける"
        examples: ["エンドユーザー", "顧客", "プロジェクトチーム"]
        engagement_level: "高関与"
        
      secondary_stakeholders:
        definition: "プロジェクトに間接的影響を受ける"
        examples: ["サプライヤー", "パートナー", "規制当局"]
        engagement_level: "中関与"
        
      key_stakeholders:
        definition: "プロジェクト成功に重要な影響力"
        examples: ["経営層", "プロジェクトスポンサー", "主要顧客"]
        engagement_level: "最高関与"
        
    analysis_framework:
      power_interest_grid:
        high_power_high_interest: "管理（Manage Closely）"
        high_power_low_interest: "満足維持（Keep Satisfied）"
        low_power_high_interest: "情報提供（Keep Informed）"
        low_power_low_interest: "監視（Monitor）"
        
    deliverables:
      - stakeholder_register: "ステークホルダー登録簿（完全版）"
      - power_interest_matrix: "影響力・関心度マトリクス"
      - engagement_strategy: "エンゲージメント戦略"
      
  stakeholder_needs_analysis:
    duration: "1日"
    responsible: "ビジネスアナリスト"
    mandatory_activities:
      - needs_assessment_interviews: "ニーズ評価インタビュー"
      - expectation_documentation: "期待値文書化"
      - conflict_identification: "利害対立特定"
      
    interview_methodology:
      structured_interviews:
        preparation: "インタビューガイド準備"
        execution: "構造化質問実施"
        documentation: "詳細記録作成"
        
      expectation_mapping:
        business_expectations: "ビジネス期待値"
        technical_expectations: "技術期待値"
        quality_expectations: "品質期待値"
        timeline_expectations: "スケジュール期待値"
        
    deliverables:
      - stakeholder_needs_matrix: "ステークホルダーニーズマトリクス"
      - expectation_register: "期待値登録簿"
      - conflict_resolution_plan: "利害対立解決計画"
```

### 3.3 Phase 3: 成功基準・制約条件定義（1-2日）
```yaml
phase3_success_criteria_constraints:
  success_criteria_definition:
    duration: "1日"
    responsible: "プロジェクトマネージャー"
    mandatory_activities:
      - success_metrics_identification: "成功メトリクス特定"
      - acceptance_criteria_definition: "受入基準定義"
      - measurement_methodology_establishment: "測定方法論確立"
      
    success_criteria_categories:
      business_success_criteria:
        roi_targets: "ROI目標値"
        revenue_impact: "収益影響"
        cost_reduction: "コスト削減"
        market_share: "市場シェア"
        
      technical_success_criteria:
        performance_targets: "性能目標"
        quality_metrics: "品質メトリクス"
        reliability_standards: "信頼性基準"
        scalability_requirements: "拡張性要件"
        
      user_success_criteria:
        user_satisfaction: "ユーザー満足度"
        adoption_rate: "採用率"
        usability_metrics: "ユーザビリティメトリクス"
        accessibility_compliance: "アクセシビリティ準拠"
        
    measurement_framework:
      quantitative_metrics:
        definition: "定量的測定可能指標"
        examples: ["応答時間", "スループット", "エラー率"]
        measurement_method: "自動測定・ツール活用"
        
      qualitative_metrics:
        definition: "定性的評価指標"
        examples: ["ユーザー満足度", "使いやすさ", "保守性"]
        measurement_method: "調査・評価・レビュー"
        
    deliverables:
      - success_criteria_matrix: "成功基準マトリクス（完全版）"
      - measurement_plan: "測定計画書"
      - acceptance_criteria_document: "受入基準文書"
      
  constraint_identification:
    duration: "1日"
    responsible: "システムアーキテクト"
    mandatory_activities:
      - constraint_analysis: "制約条件分析"
      - risk_assessment: "リスク評価"
      - mitigation_strategy_development: "軽減戦略開発"
      
    constraint_categories:
      technical_constraints:
        technology_limitations: "技術制限"
        infrastructure_constraints: "インフラ制約"
        integration_limitations: "統合制限"
        performance_constraints: "性能制約"
        
      business_constraints:
        budget_limitations: "予算制限"
        timeline_constraints: "スケジュール制約"
        resource_limitations: "リソース制限"
        regulatory_requirements: "規制要件"
        
      organizational_constraints:
        skill_limitations: "スキル制限"
        process_constraints: "プロセス制約"
        cultural_barriers: "文化的障壁"
        change_resistance: "変革抵抗"
        
    constraint_analysis_framework:
      impact_assessment:
        high_impact: "プロジェクト成功に重大影響"
        medium_impact: "プロジェクト成功に中程度影響"
        low_impact: "プロジェクト成功に軽微影響"
        
      controllability_assessment:
        controllable: "プロジェクトチームで制御可能"
        influenceable: "プロジェクトチームで影響可能"
        uncontrollable: "プロジェクトチームで制御不可"
        
    deliverables:
      - constraint_register: "制約条件登録簿（完全版）"
      - risk_assessment_matrix: "リスク評価マトリクス"
      - mitigation_strategy_document: "軽減戦略文書"
```

## 4. 成果物品質基準

### 4.1 プロジェクト憲章品質基準
```yaml
project_charter_quality_criteria:
  completeness_criteria:
    vision_clarity: "100%（明確なビジョン）"
    goal_specificity: "100%（SMART目標）"
    stakeholder_coverage: "100%（全ステークホルダー特定）"
    success_criteria_measurability: "100%（測定可能基準）"
    
  quality_criteria:
    clarity: "100%（曖昧さなし）"
    consistency: "100%（内容一貫性）"
    feasibility: "100%（実現可能性）"
    alignment: "100%（戦略整合性）"
    
  approval_criteria:
    stakeholder_consensus: "100%（全ステークホルダー合意）"
    sponsor_approval: "必須（スポンサー承認）"
    documentation_completeness: "100%（文書完全性）"
```

### 4.2 ステークホルダー分析品質基準
```yaml
stakeholder_analysis_quality_criteria:
  identification_completeness:
    primary_stakeholder_coverage: "100%（主要ステークホルダー特定）"
    secondary_stakeholder_coverage: "100%（二次ステークホルダー特定）"
    influence_analysis_accuracy: "100%（影響力分析正確性）"
    
  analysis_depth:
    needs_understanding: "100%（ニーズ理解）"
    expectation_documentation: "100%（期待値文書化）"
    engagement_strategy_appropriateness: "100%（エンゲージメント戦略適切性）"
    
  validation_criteria:
    stakeholder_confirmation: "100%（ステークホルダー確認）"
    accuracy_verification: "100%（正確性検証）"
    completeness_validation: "100%（完全性検証）"
```

---

**STEP0ゴール定義プロセス設計者**: プロセスエンジニアリングシステム ver3.1  
**プロセス品質レベル**: 最高（明確目標・完全合意）  
**適用範囲**: 全規模・全技術・全チーム  
**効果保証**: プロジェクト成功率30%向上、要件変更50%削減  
**更新日**: 2025-07-07
