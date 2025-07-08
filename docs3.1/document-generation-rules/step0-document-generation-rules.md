# STEP0文書生成ルール

**バージョン**: 3.1.0  
**作成日**: 2025-07-07  
**理論分類**: 文書生成ルール層  
**対象プロセス**: STEP0 - ゴール定義  
**改善レベル**: 完全自動化・品質統一版  

## 1. STEP0文書生成ルール概要

### 1.1 ルール定義
STEP0文書生成ルールは、プロセスエンジニアリング理論ver3.1における文書生成自動化の第0段階であり、**ゴール定義プロセスで必要な全文書を規則ベースで自動生成し、一貫した品質と完全性を保証**する重要ルールセットである。

### 1.2 ver3.1での革新的改善
```yaml
step0_document_generation_improvements:
  rule_based_automation:
    improvement: "ルールベース自動生成"
    before: "手動文書作成による品質ばらつき"
    after: "規則ベース自動生成による品質統一"
    impact: "文書品質一貫性100%確保"
    
  template_standardization:
    improvement: "テンプレート標準化"
    before: "個別テンプレートによる非統一"
    after: "標準テンプレートによる統一"
    impact: "文書構造一貫性100%確保"
    
  content_completeness_assurance:
    improvement: "内容完全性保証"
    before: "部分的文書作成"
    after: "完全性チェック付き自動生成"
    impact: "文書漏れ100%排除"
    
  quality_validation_integration:
    improvement: "品質検証統合"
    before: "生成後の手動品質チェック"
    after: "生成プロセス内蔵品質検証"
    impact: "品質問題の事前防止"
```

### 1.3 生成対象文書
```yaml
step0_target_documents:
  primary_documents:
    - project_charter: "プロジェクト憲章"
    - stakeholder_analysis: "ステークホルダー分析書"
    - smart_goals_document: "SMART目標文書"
    - success_criteria_matrix: "成功基準マトリクス"
    - constraint_register: "制約条件登録簿"
    - risk_assessment_matrix: "リスク評価マトリクス"
    
  supporting_documents:
    - stakeholder_interview_guide: "ステークホルダーインタビューガイド"
    - goal_hierarchy_chart: "目標階層チャート"
    - business_case_document: "ビジネスケース文書"
    - communication_plan: "コミュニケーション計画"
    
  quality_assurance_documents:
    - document_review_checklist: "文書レビューチェックリスト"
    - approval_tracking_matrix: "承認追跡マトリクス"
    - version_control_log: "バージョン管理ログ"
```

## 2. 文書生成ルール詳細

### 2.1 プロジェクト憲章生成ルール
```yaml
project_charter_generation_rules:
  template_structure:
    header_section:
      - document_title: "プロジェクト憲章"
      - project_name: "{project_name}"
      - version: "1.0"
      - creation_date: "{current_date}"
      - author: "{project_manager_name}"
      - approver: "{project_sponsor_name}"
      
    executive_summary:
      content_rules:
        - business_context: "ビジネス背景を3-5文で記述"
        - project_purpose: "プロジェクト目的を2-3文で記述"
        - expected_outcomes: "期待成果を箇条書きで3-5項目"
        - success_metrics: "成功指標を定量的に2-3項目"
        
    project_scope:
      inclusion_rules:
        - functional_scope: "機能スコープを明確に定義"
        - technical_scope: "技術スコープを明確に定義"
        - organizational_scope: "組織スコープを明確に定義"
        
      exclusion_rules:
        - out_of_scope_items: "スコープ外項目を明確に列挙"
        - future_phase_items: "将来フェーズ項目を明確に分離"
        
    smart_goals:
      generation_template: |
        目標{goal_number}: {goal_name}
        - Specific: {specific_description}
        - Measurable: {measurable_criteria}
        - Achievable: {achievable_rationale}
        - Relevant: {relevant_justification}
        - Time-bound: {time_bound_deadline}
        
  content_validation_rules:
    completeness_check:
      - all_sections_present: "全セクション存在確認"
      - mandatory_fields_filled: "必須フィールド入力確認"
      - smart_criteria_compliance: "SMART基準準拠確認"
      
    quality_check:
      - clarity_verification: "明確性検証"
      - consistency_verification: "一貫性検証"
      - measurability_verification: "測定可能性検証"
      
  approval_workflow:
    review_sequence:
      1. "自動品質チェック"
      2. "プロジェクトマネージャーレビュー"
      3. "ステークホルダーレビュー"
      4. "プロジェクトスポンサー承認"
      
    approval_criteria:
      - quality_score: "≥95点"
      - completeness_score: "100%"
      - stakeholder_consensus: "100%"
```

### 2.2 ステークホルダー分析書生成ルール
```yaml
stakeholder_analysis_generation_rules:
  stakeholder_identification_rules:
    categorization_framework:
      primary_stakeholders:
        identification_criteria: "プロジェクトに直接影響を受ける"
        mandatory_attributes: ["名前", "役職", "組織", "連絡先", "影響度", "関心度"]
        
      secondary_stakeholders:
        identification_criteria: "プロジェクトに間接影響を受ける"
        mandatory_attributes: ["名前", "役職", "組織", "影響度", "関心度"]
        
      key_stakeholders:
        identification_criteria: "プロジェクト成功に重要な影響力"
        mandatory_attributes: ["名前", "役職", "組織", "影響力", "期待値", "懸念事項"]
        
  power_interest_matrix_generation:
    matrix_template: |
      ステークホルダー: {stakeholder_name}
      影響力レベル: {power_level} (1-5スケール)
      関心度レベル: {interest_level} (1-5スケール)
      分類: {quadrant_classification}
      エンゲージメント戦略: {engagement_strategy}
      
    quadrant_classification_rules:
      high_power_high_interest: "管理（Manage Closely）"
      high_power_low_interest: "満足維持（Keep Satisfied）"
      low_power_high_interest: "情報提供（Keep Informed）"
      low_power_low_interest: "監視（Monitor）"
      
  engagement_strategy_generation:
    strategy_templates:
      manage_closely:
        - regular_communication: "定期的コミュニケーション（週次）"
        - decision_involvement: "意思決定への関与"
        - feedback_incorporation: "フィードバック積極的取り込み"
        
      keep_satisfied:
        - periodic_updates: "定期的アップデート（月次）"
        - consultation_on_major_decisions: "重要決定時の相談"
        - concern_addressing: "懸念事項への対応"
        
  validation_rules:
    completeness_validation:
      - all_stakeholders_identified: "全ステークホルダー特定"
      - power_interest_assessed: "影響力・関心度評価完了"
      - engagement_strategies_defined: "エンゲージメント戦略定義"
      
    accuracy_validation:
      - stakeholder_confirmation: "ステークホルダー本人確認"
      - assessment_verification: "評価妥当性検証"
      - strategy_appropriateness: "戦略適切性確認"
```

### 2.3 SMART目標文書生成ルール
```yaml
smart_goals_generation_rules:
  goal_structure_template:
    goal_header:
      - goal_id: "GOAL-{sequential_number}"
      - goal_name: "{descriptive_goal_name}"
      - goal_category: "{business|technical|organizational}"
      - priority_level: "{high|medium|low}"
      
    smart_criteria_template:
      specific_section:
        template: |
          具体的内容: {specific_description}
          対象範囲: {target_scope}
          実行者: {responsible_party}
          実行方法: {execution_method}
          
      measurable_section:
        template: |
          測定指標: {measurement_metrics}
          目標値: {target_value}
          測定方法: {measurement_method}
          測定頻度: {measurement_frequency}
          
      achievable_section:
        template: |
          実現可能性根拠: {achievability_rationale}
          必要リソース: {required_resources}
          制約条件: {constraints}
          リスク要因: {risk_factors}
          
      relevant_section:
        template: |
          ビジネス価値: {business_value}
          戦略整合性: {strategic_alignment}
          ステークホルダー価値: {stakeholder_value}
          
      time_bound_section:
        template: |
          開始日: {start_date}
          完了期限: {end_date}
          マイルストーン: {milestones}
          進捗確認頻度: {progress_review_frequency}
          
  goal_hierarchy_generation:
    hierarchy_levels:
      strategic_goals:
        level: "レベル1（戦略目標）"
        characteristics: "組織全体に影響する高レベル目標"
        
      tactical_goals:
        level: "レベル2（戦術目標）"
        characteristics: "戦略目標を支援する中レベル目標"
        
      operational_goals:
        level: "レベル3（運用目標）"
        characteristics: "日常業務レベルの具体的目標"
        
    dependency_mapping:
      parent_child_relationships: "上位目標と下位目標の関係定義"
      cross_dependencies: "同レベル目標間の依存関係定義"
      
  validation_framework:
    smart_compliance_check:
      specific_validation: "具体性チェック（曖昧表現なし）"
      measurable_validation: "測定可能性チェック（定量指標あり）"
      achievable_validation: "達成可能性チェック（現実的）"
      relevant_validation: "関連性チェック（ビジネス価値あり）"
      time_bound_validation: "期限設定チェック（明確な期限）"
      
    consistency_validation:
      goal_alignment: "目標間の整合性確認"
      resource_consistency: "リソース配分の一貫性確認"
      timeline_consistency: "スケジュールの一貫性確認"
```

## 3. 自動生成プロセス

### 3.1 生成プロセスフロー
```yaml
generation_process_flow:
  phase1_input_collection:
    duration: "30分"
    activities:
      - stakeholder_input_gathering: "ステークホルダー入力収集"
      - business_context_analysis: "ビジネス背景分析"
      - template_parameter_extraction: "テンプレートパラメーター抽出"
      
    input_validation:
      - completeness_check: "入力完全性チェック"
      - format_validation: "形式妥当性検証"
      - consistency_verification: "一貫性検証"
      
  phase2_document_generation:
    duration: "1時間"
    activities:
      - template_instantiation: "テンプレート実体化"
      - content_population: "内容自動入力"
      - cross_reference_linking: "相互参照リンク"
      
    generation_sequence:
      1. "プロジェクト憲章生成"
      2. "ステークホルダー分析書生成"
      3. "SMART目標文書生成"
      4. "成功基準マトリクス生成"
      5. "制約条件登録簿生成"
      6. "リスク評価マトリクス生成"
      
  phase3_quality_validation:
    duration: "30分"
    activities:
      - automated_quality_check: "自動品質チェック"
      - consistency_validation: "一貫性検証"
      - completeness_verification: "完全性検証"
      
    validation_criteria:
      - template_compliance: "テンプレート準拠（100%）"
      - content_completeness: "内容完全性（100%）"
      - quality_standards: "品質基準（≥95点）"
      
  phase4_review_approval:
    duration: "2-4時間"
    activities:
      - stakeholder_review: "ステークホルダーレビュー"
      - feedback_incorporation: "フィードバック取り込み"
      - final_approval: "最終承認"
      
    approval_workflow:
      - automated_distribution: "自動配布"
      - review_tracking: "レビュー追跡"
      - approval_collection: "承認収集"
      - version_finalization: "バージョン確定"
```

### 3.2 品質保証メカニズム
```yaml
quality_assurance_mechanisms:
  automated_validation:
    template_compliance_check:
      - structure_validation: "構造妥当性検証"
      - mandatory_section_presence: "必須セクション存在確認"
      - format_consistency: "形式一貫性確認"
      
    content_quality_check:
      - clarity_assessment: "明確性評価"
      - completeness_assessment: "完全性評価"
      - consistency_assessment: "一貫性評価"
      
    cross_document_validation:
      - reference_integrity: "参照整合性確認"
      - data_consistency: "データ一貫性確認"
      - version_synchronization: "バージョン同期確認"
      
  human_oversight:
    review_checkpoints:
      - generation_completion: "生成完了時レビュー"
      - quality_validation_completion: "品質検証完了時レビュー"
      - stakeholder_feedback_incorporation: "フィードバック取り込み時レビュー"
      
    approval_gates:
      - technical_approval: "技術承認"
      - business_approval: "ビジネス承認"
      - final_sign_off: "最終サインオフ"
```

## 4. カスタマイゼーション・拡張ルール

### 4.1 組織固有カスタマイゼーション
```yaml
organizational_customization:
  template_customization:
    branding_elements:
      - company_logo: "会社ロゴ挿入"
      - corporate_colors: "企業カラー適用"
      - document_header_footer: "文書ヘッダー・フッター"
      
    terminology_customization:
      - organization_specific_terms: "組織固有用語"
      - role_title_mapping: "役職名マッピング"
      - process_name_adaptation: "プロセス名適応"
      
  workflow_customization:
    approval_workflow_adaptation:
      - organization_hierarchy: "組織階層反映"
      - approval_authority_mapping: "承認権限マッピング"
      - escalation_procedures: "エスカレーション手順"
      
    review_process_customization:
      - review_cycle_adaptation: "レビューサイクル適応"
      - reviewer_assignment_rules: "レビュアー指名ルール"
      - feedback_collection_methods: "フィードバック収集方法"
      
  compliance_customization:
    regulatory_requirements:
      - industry_specific_compliance: "業界固有コンプライアンス"
      - regional_regulatory_requirements: "地域規制要件"
      - internal_policy_compliance: "内部ポリシー準拠"
      
    audit_requirements:
      - audit_trail_generation: "監査証跡生成"
      - documentation_retention: "文書保持要件"
      - access_control_requirements: "アクセス制御要件"
```

### 4.2 プロジェクト規模別適応
```yaml
project_scale_adaptation:
  small_project_adaptation:
    document_simplification:
      - essential_sections_only: "必須セクションのみ"
      - simplified_templates: "簡略化テンプレート"
      - reduced_approval_steps: "承認ステップ削減"
      
    automation_enhancement:
      - increased_automation: "自動化率向上"
      - minimal_human_intervention: "人的介入最小化"
      - rapid_generation: "高速生成"
      
  large_project_adaptation:
    document_elaboration:
      - comprehensive_sections: "包括的セクション"
      - detailed_templates: "詳細テンプレート"
      - multi_level_approval: "多段階承認"
      
    governance_enhancement:
      - formal_review_processes: "正式レビュープロセス"
      - stakeholder_committee_involvement: "ステークホルダー委員会関与"
      - compliance_verification: "コンプライアンス検証"
```

---

**STEP0文書生成ルール設計者**: プロセスエンジニアリングシステム ver3.1  
**自動化レベル**: 最高（完全自動化・品質統一）  
**適用範囲**: 全規模・全組織・全業界  
**効果保証**: 文書品質一貫性100%、生成効率300%向上  
**更新日**: 2025-07-07
