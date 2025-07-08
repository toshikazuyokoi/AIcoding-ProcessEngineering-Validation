# タスク詳細度調整ルール

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: タスク管理層  
**調整分類**: 段階的詳細化システム  

## 1. タスク詳細度調整ルール概要

### 1.1 ルール定義
タスク詳細度調整ルールは、**プロジェクト規模・複雑度・チーム能力に応じてタスクチェックリストの詳細度を動的に調整**し、最適な実行効率と品質保証を両立させるルールセットである。

### 1.2 ルール目的
```yaml
task_detail_adjustment_objectives:
  primary_purpose: "プロジェクト特性に応じた最適タスク詳細度の自動調整"
  
  specific_goals:
    - optimal_detail_level_determination: "最適詳細度レベル決定"
    - execution_efficiency_optimization: "実行効率最適化"
    - quality_assurance_maintenance: "品質保証維持"
    - resource_utilization_optimization: "リソース利用最適化"
    - scalability_enhancement: "拡張性向上"
```

### 1.3 適用範囲
```yaml
task_detail_adjustment_scope:
  adjustment_dimensions:
    - project_scale: "プロジェクト規模"
    - technical_complexity: "技術複雑度"
    - team_experience: "チーム経験"
    - quality_requirements: "品質要件"
    - timeline_constraints: "タイムライン制約"
    - risk_tolerance: "リスク許容度"
  
  detail_levels:
    - essential_level: "Essential（必須レベル）"
    - standard_level: "Standard（標準レベル）"
    - comprehensive_level: "Comprehensive（包括レベル）"
```

## 2. 詳細度調整ルール定義

### 2.1 プロジェクト規模別調整ルール
```yaml
project_scale_adjustment_rules:
  small_scale_projects:
    characteristics:
      - team_size: "1-5人"
      - duration: "1-3ヶ月"
      - complexity: "低-中"
      - budget: "小規模"
    
    adjustment_rules:
      detail_level: "Essential"
      task_granularity: "粗粒度（1-4時間単位）"
      documentation_scope: "必須文書のみ"
      review_frequency: "週次"
      quality_gates: "簡素化"
    
    specific_adjustments:
      subtask_1_requirement_analysis:
        duration_reduction: "50%削減"
        scope_limitation: "核心要件のみ"
        documentation_simplification: "チェックリスト形式"
      
      subtask_2_implementation:
        focus_areas: "主要機能のみ"
        quality_standards: "基本品質基準"
        optimization_level: "必要最小限"
      
      subtask_3_unit_testing:
        coverage_target: "70%以上"
        test_types: "正常系+主要異常系"
        automation_level: "基本自動化"
      
      subtask_4_code_review:
        review_depth: "基本レビュー"
        checklist_items: "必須項目のみ"
        reviewer_count: "1名"
      
      subtask_5_integration_testing:
        scope_limitation: "主要統合ポイント"
        test_scenarios: "基本シナリオ"
        environment_complexity: "シンプル環境"
      
      subtask_6_documentation:
        documentation_types: "API文書+README"
        detail_level: "基本レベル"
        maintenance_scope: "必須更新のみ"
      
      subtask_7_quality_confirmation:
        approval_process: "簡素化承認"
        stakeholder_involvement: "主要ステークホルダーのみ"
        documentation_requirements: "最小限"
  
  medium_scale_projects:
    characteristics:
      - team_size: "6-20人"
      - duration: "3-12ヶ月"
      - complexity: "中-高"
      - budget: "中規模"
    
    adjustment_rules:
      detail_level: "Standard"
      task_granularity: "中粒度（2-8時間単位）"
      documentation_scope: "標準文書セット"
      review_frequency: "隔週"
      quality_gates: "標準プロセス"
    
    specific_adjustments:
      subtask_1_requirement_analysis:
        duration_standard: "標準時間"
        scope_comprehensive: "包括的要件"
        documentation_detailed: "詳細文書化"
      
      subtask_2_implementation:
        focus_areas: "全機能"
        quality_standards: "標準品質基準"
        optimization_level: "バランス最適化"
      
      subtask_3_unit_testing:
        coverage_target: "85%以上"
        test_types: "包括的テストタイプ"
        automation_level: "高度自動化"
      
      subtask_4_code_review:
        review_depth: "詳細レビュー"
        checklist_items: "標準チェックリスト"
        reviewer_count: "2名"
      
      subtask_5_integration_testing:
        scope_comprehensive: "全統合ポイント"
        test_scenarios: "包括的シナリオ"
        environment_complexity: "標準環境"
      
      subtask_6_documentation:
        documentation_types: "完全文書セット"
        detail_level: "詳細レベル"
        maintenance_scope: "継続的更新"
      
      subtask_7_quality_confirmation:
        approval_process: "標準承認プロセス"
        stakeholder_involvement: "全ステークホルダー"
        documentation_requirements: "標準文書化"
  
  large_scale_projects:
    characteristics:
      - team_size: "20人以上"
      - duration: "12ヶ月以上"
      - complexity: "高-最高"
      - budget: "大規模"
    
    adjustment_rules:
      detail_level: "Comprehensive"
      task_granularity: "細粒度（1-4時間単位）"
      documentation_scope: "包括的文書セット"
      review_frequency: "週次"
      quality_gates: "厳格プロセス"
    
    specific_adjustments:
      subtask_1_requirement_analysis:
        duration_extension: "150%拡張"
        scope_exhaustive: "網羅的要件"
        documentation_comprehensive: "包括的文書化"
      
      subtask_2_implementation:
        focus_areas: "全機能+拡張性"
        quality_standards: "エンタープライズ品質基準"
        optimization_level: "最大最適化"
      
      subtask_3_unit_testing:
        coverage_target: "95%以上"
        test_types: "網羅的テストタイプ"
        automation_level: "完全自動化"
      
      subtask_4_code_review:
        review_depth: "包括的レビュー"
        checklist_items: "包括的チェックリスト"
        reviewer_count: "3名以上"
      
      subtask_5_integration_testing:
        scope_exhaustive: "全統合ポイント+エッジケース"
        test_scenarios: "網羅的シナリオ"
        environment_complexity: "本番類似環境"
      
      subtask_6_documentation:
        documentation_types: "エンタープライズ文書セット"
        detail_level: "包括的レベル"
        maintenance_scope: "継続的+予防的更新"
      
      subtask_7_quality_confirmation:
        approval_process: "厳格承認プロセス"
        stakeholder_involvement: "全ステークホルダー+監査"
        documentation_requirements: "包括的文書化"
```

### 2.2 技術複雑度別調整ルール
```yaml
technical_complexity_adjustment_rules:
  low_complexity:
    characteristics:
      - technology_stack: "確立された技術"
      - integration_points: "少数"
      - architectural_complexity: "シンプル"
      - performance_requirements: "標準"
    
    adjustment_factors:
      implementation_time_reduction: "20%削減"
      testing_scope_optimization: "基本テスト"
      review_depth_adjustment: "標準レビュー"
      documentation_simplification: "基本文書化"
  
  medium_complexity:
    characteristics:
      - technology_stack: "混合技術"
      - integration_points: "中程度"
      - architectural_complexity: "標準"
      - performance_requirements: "高"
    
    adjustment_factors:
      implementation_time_standard: "標準時間"
      testing_scope_comprehensive: "包括的テスト"
      review_depth_detailed: "詳細レビュー"
      documentation_standard: "標準文書化"
  
  high_complexity:
    characteristics:
      - technology_stack: "最新・複合技術"
      - integration_points: "多数"
      - architectural_complexity: "複雑"
      - performance_requirements: "最高"
    
    adjustment_factors:
      implementation_time_extension: "50%拡張"
      testing_scope_exhaustive: "網羅的テスト"
      review_depth_comprehensive: "包括的レビュー"
      documentation_comprehensive: "包括的文書化"
```

### 2.3 チーム経験別調整ルール
```yaml
team_experience_adjustment_rules:
  junior_team:
    characteristics:
      - average_experience: "0-2年"
      - domain_knowledge: "限定的"
      - technology_familiarity: "基本レベル"
      - process_maturity: "初級"
    
    adjustment_factors:
      guidance_enhancement: "詳細ガイダンス追加"
      review_frequency_increase: "レビュー頻度増加"
      mentoring_integration: "メンタリング統合"
      documentation_detail_increase: "文書詳細度増加"
  
  senior_team:
    characteristics:
      - average_experience: "3-7年"
      - domain_knowledge: "十分"
      - technology_familiarity: "高レベル"
      - process_maturity: "中級"
    
    adjustment_factors:
      guidance_standard: "標準ガイダンス"
      review_frequency_standard: "標準レビュー頻度"
      autonomy_enhancement: "自律性向上"
      documentation_optimization: "文書最適化"
  
  expert_team:
    characteristics:
      - average_experience: "8年以上"
      - domain_knowledge: "専門的"
      - technology_familiarity: "エキスパートレベル"
      - process_maturity: "上級"
    
    adjustment_factors:
      guidance_minimization: "ガイダンス最小化"
      review_frequency_optimization: "レビュー頻度最適化"
      innovation_encouragement: "革新奨励"
      documentation_efficiency: "文書効率化"
```

## 3. 自動調整アルゴリズム

### 3.1 詳細度レベル決定アルゴリズム
```yaml
detail_level_determination_algorithm:
  input_parameters:
    project_characteristics:
      - team_size: "チームサイズ"
      - project_duration: "プロジェクト期間"
      - budget_scale: "予算規模"
      - stakeholder_count: "ステークホルダー数"
    
    technical_factors:
      - technology_complexity: "技術複雑度"
      - integration_complexity: "統合複雑度"
      - performance_requirements: "性能要件"
      - security_requirements: "セキュリティ要件"
    
    team_factors:
      - average_experience: "平均経験年数"
      - domain_expertise: "ドメイン専門性"
      - process_maturity: "プロセス成熟度"
      - tool_familiarity: "ツール習熟度"
    
    quality_factors:
      - quality_requirements: "品質要件"
      - compliance_requirements: "コンプライアンス要件"
      - risk_tolerance: "リスク許容度"
      - timeline_constraints: "タイムライン制約"
  
  calculation_algorithm:
    step_1_factor_scoring:
      description: "要因スコアリング"
      method: "各要因を1-10点でスコア化"
      weights:
        project_scale_weight: 0.3
        technical_complexity_weight: 0.25
        team_experience_weight: 0.2
        quality_requirements_weight: 0.25
    
    step_2_weighted_calculation:
      description: "重み付け計算"
      formula: "総合スコア = Σ(要因スコア × 重み)"
      normalization: "0-100点に正規化"
    
    step_3_level_determination:
      description: "レベル決定"
      thresholds:
        essential_threshold: "0-40点"
        standard_threshold: "41-70点"
        comprehensive_threshold: "71-100点"
    
    step_4_fine_tuning:
      description: "微調整"
      adjustments:
        risk_factor_adjustment: "リスク要因による調整"
        constraint_adjustment: "制約による調整"
        stakeholder_preference_adjustment: "ステークホルダー選好調整"
```

### 3.2 動的調整メカニズム
```yaml
dynamic_adjustment_mechanism:
  monitoring_triggers:
    project_progress_milestones:
      - milestone_completion: "マイルストーン完了"
      - quality_gate_results: "品質ゲート結果"
      - performance_metrics: "性能メトリクス"
      - team_feedback: "チームフィードバック"
    
    environmental_changes:
      - scope_changes: "スコープ変更"
      - resource_changes: "リソース変更"
      - timeline_changes: "タイムライン変更"
      - technology_changes: "技術変更"
  
  adjustment_process:
    step_1_change_detection:
      description: "変更検出"
      monitoring_frequency: "週次"
      threshold_settings: "変更閾値設定"
    
    step_2_impact_assessment:
      description: "影響評価"
      assessment_criteria: "詳細度への影響度"
      stakeholder_consultation: "ステークホルダー相談"
    
    step_3_adjustment_calculation:
      description: "調整計算"
      recalculation_algorithm: "詳細度レベル再計算"
      transition_planning: "移行計画"
    
    step_4_implementation:
      description: "実装"
      gradual_transition: "段階的移行"
      team_communication: "チームコミュニケーション"
      documentation_update: "文書更新"
```

## 4. 品質保証ルール

### 4.1 調整品質基準
```yaml
adjustment_quality_standards:
  appropriateness_criteria:
    level_appropriateness:
      - project_characteristic_alignment: "プロジェクト特性整合性100%"
      - resource_optimization: "リソース最適化95%以上"
      - quality_maintenance: "品質維持100%"
      - efficiency_improvement: "効率性改善90%以上"
    
    consistency_criteria:
      - adjustment_logic_consistency: "調整ロジック一貫性100%"
      - cross_project_consistency: "プロジェクト間一貫性95%以上"
      - temporal_consistency: "時間的一貫性100%"
      - stakeholder_alignment: "ステークホルダー整合性100%"
  
  effectiveness_criteria:
    outcome_effectiveness:
      - execution_efficiency_improvement: "実行効率改善90%以上"
      - quality_score_maintenance: "品質スコア維持95%以上"
      - resource_utilization_optimization: "リソース利用最適化90%以上"
      - stakeholder_satisfaction: "ステークホルダー満足度90%以上"
    
    adaptability_criteria:
      - change_responsiveness: "変更対応性100%"
      - scalability_maintenance: "拡張性維持100%"
      - flexibility_preservation: "柔軟性保持100%"
      - continuous_improvement: "継続的改善95%以上"
```

### 4.2 調整検証プロセス
```yaml
adjustment_verification_process:
  pre_adjustment_validation:
    input_validation:
      - parameter_completeness_check: "パラメータ完全性チェック"
      - data_accuracy_verification: "データ精度検証"
      - constraint_consistency_validation: "制約一貫性検証"
      - stakeholder_requirement_alignment: "ステークホルダー要件整合"
    
    algorithm_validation:
      - calculation_accuracy_verification: "計算精度検証"
      - logic_consistency_check: "ロジック一貫性チェック"
      - edge_case_handling: "エッジケース処理"
      - performance_validation: "性能検証"
  
  post_adjustment_validation:
    outcome_validation:
      - adjustment_effectiveness_assessment: "調整効果評価"
      - quality_impact_analysis: "品質影響分析"
      - efficiency_improvement_measurement: "効率性改善測定"
      - stakeholder_feedback_collection: "ステークホルダーフィードバック収集"
    
    continuous_monitoring:
      - performance_tracking: "性能追跡"
      - quality_monitoring: "品質監視"
      - satisfaction_measurement: "満足度測定"
      - improvement_identification: "改善特定"
```

## 5. 実装ガイドライン

### 5.1 システム統合仕様
```yaml
system_integration_specifications:
  integration_architecture:
    rule_engine:
      - rule_parser: "ルール解析器"
      - calculation_engine: "計算エンジン"
      - decision_maker: "判定器"
      - adjustment_executor: "調整実行器"
    
    data_management:
      - parameter_collector: "パラメータ収集器"
      - historical_data_manager: "履歴データ管理器"
      - configuration_manager: "設定管理器"
      - result_tracker: "結果追跡器"
    
    user_interface:
      - parameter_input_interface: "パラメータ入力インターフェース"
      - adjustment_visualization: "調整可視化"
      - feedback_collection: "フィードバック収集"
      - reporting_dashboard: "レポートダッシュボード"
  
  implementation_considerations:
    performance_requirements:
      - response_time: "応答時間1秒以内"
      - throughput: "同時処理100プロジェクト"
      - availability: "可用性99.9%以上"
      - scalability: "拡張性確保"
    
    quality_requirements:
      - accuracy: "調整精度95%以上"
      - reliability: "信頼性99%以上"
      - maintainability: "保守性確保"
      - usability: "使いやすさ確保"
```

### 5.2 運用ガイドライン
```yaml
operational_guidelines:
  deployment_process:
    initial_setup:
      - system_configuration: "システム設定"
      - baseline_establishment: "ベースライン確立"
      - user_training: "ユーザートレーニング"
      - pilot_testing: "パイロットテスト"
    
    ongoing_operations:
      - regular_monitoring: "定期監視"
      - performance_optimization: "性能最適化"
      - rule_updates: "ルール更新"
      - user_support: "ユーザーサポート"
  
  maintenance_procedures:
    routine_maintenance:
      - data_backup: "データバックアップ"
      - system_health_check: "システムヘルスチェック"
      - performance_tuning: "性能チューニング"
      - security_updates: "セキュリティ更新"
    
    improvement_cycles:
      - feedback_analysis: "フィードバック分析"
      - rule_refinement: "ルール改良"
      - algorithm_optimization: "アルゴリズム最適化"
      - feature_enhancement: "機能強化"
```

---

**タスク詳細度調整ルール定義者**: プロセスエンジニアリングシステム ver3  
**調整品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**調整精度**: 95%以上保証  
**更新日**: 2025-07-01
