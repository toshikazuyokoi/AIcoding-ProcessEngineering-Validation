# STEP1: 要件定義プロセス

**バージョン**: 3.1.0  
**作成日**: 2025-07-07  
**理論分類**: プロセス定義層  
**プロセス段階**: STEP1 - 要件定義  
**改善レベル**: 実証実験フィードバック反映版  

## 1. STEP1プロセス概要

### 1.1 プロセス定義
STEP1要件定義プロセスは、プロセスエンジニアリング理論ver3.1における第1段階であり、**STEP0で定義されたゴールを基に、ビジネス・技術要件を完全かつ明確に定義し、後続設計・実装の確実な基盤を構築**する重要プロセスである。

### 1.2 ver3.1での重大改善
```yaml
step1_improvements_v3_1:
  responsibility_authority_clarification:
    improvement: "責任・権限の完全明確化"
    before: "曖昧な責任分担による要件品質問題"
    after: "明確なRACI表による責任保証"
    impact: "要件品質95%以上保証"

  concrete_execution_procedures:
    improvement: "具体的実行手順の詳細化"
    before: "抽象的な要件定義指示"
    after: "実行可能な詳細手順"
    impact: "実行可能性100%確保"

  stakeholder_consensus_assurance:
    improvement: "ステークホルダー合意の確実な保証"
    before: "形式的な承認確認"
    after: "実質的な合意検証"
    impact: "ステークホルダー満足度95%以上"

  quality_gate_integration:
    improvement: "品質ゲート1との完全統合"
    before: "要件定義と品質チェックの分離"
    after: "統合された品質保証プロセス"
    impact: "要件品質の継続的保証"
```

### 1.3 プロセス目標
```yaml
step1_objectives:
  primary_objectives:
    - complete_requirements_capture: "ビジネス要求の100%捕捉"
    - implementable_specification: "実装可能レベルの仕様化"
    - stakeholder_alignment: "全ステークホルダーの合意形成"
    - quality_foundation: "後続プロセスの品質基盤構築"
    
  quality_targets:
    - requirements_completeness: "100%（漏れなし）"
    - requirements_clarity: "100%（曖昧さなし）"
    - stakeholder_approval: "100%（全員承認）"
    - traceability_establishment: "100%（追跡可能性）"
    
  deliverable_targets:
    - functional_requirements: "機能要件仕様書（完全版）"
    - non_functional_requirements: "非機能要件仕様書（完全版）"
    - user_stories: "ユーザーストーリー（完全版）"
    - acceptance_criteria: "受入基準（完全版）"
    - requirements_traceability: "要件トレーサビリティマトリクス"
```

## 2. 責任・権限マトリクス（RACI表）

### 2.1 STEP1 RACI表（必須作成）
```yaml
step1_raci_matrix:
  requirements_analysis:
    responsible: "要件定義リーダー（個人名指定必須）"
    accountable: "プロジェクトマネージャー（結果責任）"
    consulted: ["ビジネスアナリスト", "ドメインエキスパート", "ユーザー代表"]
    informed: ["開発チームリーダー", "アーキテクト", "テストリーダー"]
    
  stakeholder_interviews:
    responsible: "ビジネスアナリスト（個人名指定必須）"
    accountable: "要件定義リーダー（結果責任）"
    consulted: ["プロジェクトマネージャー", "ドメインエキスパート"]
    informed: ["開発チーム", "品質保証チーム"]
    
  requirements_documentation:
    responsible: "要件定義リーダー（個人名指定必須）"
    accountable: "プロジェクトマネージャー（結果責任）"
    consulted: ["ビジネスアナリスト", "システムアーキテクト"]
    informed: ["全プロジェクトメンバー"]
    
  requirements_validation:
    responsible: "品質ゲートキーパー（個人名指定必須）"
    accountable: "品質ゲートキーパー（単独権限）"
    consulted: ["要件定義リーダー", "ステークホルダー代表"]
    informed: ["プロジェクトマネージャー", "開発チーム"]
    
  stakeholder_approval:
    responsible: "プロジェクトマネージャー（個人名指定必須）"
    accountable: "プロジェクトスポンサー（結果責任）"
    consulted: ["要件定義リーダー", "ビジネスステークホルダー"]
    informed: ["全プロジェクトメンバー"]
```

### 2.2 権限・責任の詳細定義
```yaml
authority_responsibility_details:
  requirements_definition_leader:
    authority:
      - requirements_specification: "要件仕様の最終決定権"
      - technical_feasibility: "技術的実現可能性の判断権"
      - scope_adjustment: "スコープ調整の提案権"
      
    responsibility:
      - completeness_assurance: "要件完全性の保証責任"
      - quality_maintenance: "要件品質の維持責任"
      - stakeholder_communication: "ステークホルダーとの調整責任"
      
    accountability:
      - deliverable_quality: "成果物品質への説明責任"
      - schedule_adherence: "スケジュール遵守への責任"
      - budget_impact: "予算影響への責任"
      
  quality_gate_keeper:
    authority:
      - quality_judgment: "品質判定の単独権限"
      - process_blocking: "品質未達成時の進行停止権限"
      - improvement_direction: "改善方向の指示権限"
      
    responsibility:
      - quality_validation: "品質検証の実施責任"
      - objective_evaluation: "客観的評価の実施責任"
      - documentation: "判定結果の文書化責任"
      
    accountability:
      - quality_assurance: "品質保証への説明責任"
      - decision_rationale: "判定理由への説明責任"
      - stakeholder_communication: "結果通知への責任"
```

## 3. 具体的実行手順

### 3.1 Phase 1: 要件収集・分析（3-5日）
```yaml
phase1_requirements_gathering:
  day1_stakeholder_identification:
    duration: "1日"
    responsible: "要件定義リーダー"
    mandatory_activities:
      - stakeholder_mapping: "ステークホルダーマッピング作成"
      - interview_planning: "インタビュー計画策定"
      - documentation_preparation: "文書テンプレート準備"
      
    deliverables:
      - stakeholder_list: "ステークホルダー一覧（完全版）"
      - interview_schedule: "インタビュースケジュール"
      - documentation_templates: "要件文書テンプレート"
      
    completion_criteria:
      - stakeholder_completeness: "全ステークホルダー特定完了"
      - schedule_confirmation: "インタビュー日程確定"
      - template_readiness: "文書テンプレート準備完了"
      
  day2_3_stakeholder_interviews:
    duration: "2日"
    responsible: "ビジネスアナリスト"
    mandatory_activities:
      - structured_interviews: "構造化インタビュー実施"
      - requirements_extraction: "要件抽出・整理"
      - conflict_identification: "要件競合の特定"
      
    interview_methodology:
      preparation:
        - interview_guide: "インタビューガイド準備"
        - recording_setup: "記録システム準備"
        - validation_checklist: "検証チェックリスト準備"
        
      execution:
        - structured_questioning: "構造化質問法"
        - active_listening: "アクティブリスニング"
        - real_time_validation: "リアルタイム検証"
        
      follow_up:
        - summary_creation: "インタビュー要約作成"
        - stakeholder_validation: "ステークホルダー検証"
        - gap_identification: "ギャップ特定"
        
    deliverables:
      - interview_records: "インタビュー記録（完全版）"
      - raw_requirements: "生要件リスト"
      - conflict_matrix: "要件競合マトリクス"
      
  day4_5_requirements_analysis:
    duration: "2日"
    responsible: "要件定義リーダー"
    mandatory_activities:
      - requirements_categorization: "要件分類・整理"
      - priority_assignment: "優先度設定"
      - feasibility_assessment: "実現可能性評価"
      
    analysis_methodology:
      categorization:
        - functional_requirements: "機能要件の分類"
        - non_functional_requirements: "非機能要件の分類"
        - constraint_requirements: "制約要件の分類"
        
      prioritization:
        - business_value_assessment: "ビジネス価値評価"
        - technical_complexity_assessment: "技術的複雑性評価"
        - risk_assessment: "リスク評価"
        
      feasibility:
        - technical_feasibility: "技術的実現可能性"
        - business_feasibility: "ビジネス実現可能性"
        - resource_feasibility: "リソース実現可能性"
        
    deliverables:
      - categorized_requirements: "分類済み要件リスト"
      - priority_matrix: "優先度マトリクス"
      - feasibility_report: "実現可能性レポート"
```

### 3.2 Phase 2: 要件仕様化（4-6日）
```yaml
phase2_requirements_specification:
  day1_2_functional_requirements:
    duration: "2日"
    responsible: "要件定義リーダー"
    mandatory_activities:
      - functional_spec_creation: "機能要件仕様書作成"
      - use_case_development: "ユースケース開発"
      - acceptance_criteria_definition: "受入基準定義"
      
    specification_methodology:
      functional_requirements:
        template: |
          requirement_id: {unique_identifier}
          requirement_name: {descriptive_name}
          description: {detailed_description}
          rationale: {business_justification}
          priority: {high|medium|low}
          complexity: {high|medium|low}
          acceptance_criteria: {testable_criteria}
          dependencies: {related_requirements}
          
      use_case_development:
        template: |
          use_case_id: {unique_identifier}
          use_case_name: {descriptive_name}
          actors: {primary_secondary_actors}
          preconditions: {required_conditions}
          main_flow: {step_by_step_flow}
          alternative_flows: {exception_flows}
          postconditions: {resulting_conditions}
          
    deliverables:
      - functional_requirements_spec: "機能要件仕様書（完全版）"
      - use_case_document: "ユースケース文書"
      - acceptance_criteria_list: "受入基準一覧"
      
  day3_4_non_functional_requirements:
    duration: "2日"
    responsible: "システムアーキテクト"
    mandatory_activities:
      - performance_requirements: "性能要件定義"
      - security_requirements: "セキュリティ要件定義"
      - usability_requirements: "ユーザビリティ要件定義"
      
    nfr_categories:
      performance:
        - response_time: "応答時間要件"
        - throughput: "スループット要件"
        - scalability: "拡張性要件"
        - availability: "可用性要件"
        
      security:
        - authentication: "認証要件"
        - authorization: "認可要件"
        - data_protection: "データ保護要件"
        - audit_logging: "監査ログ要件"
        
      usability:
        - user_interface: "ユーザーインターフェース要件"
        - accessibility: "アクセシビリティ要件"
        - user_experience: "ユーザーエクスペリエンス要件"
        
    deliverables:
      - nfr_specification: "非機能要件仕様書（完全版）"
      - performance_criteria: "性能基準書"
      - security_requirements: "セキュリティ要件書"
      
  day5_6_requirements_integration:
    duration: "2日"
    responsible: "要件定義リーダー"
    mandatory_activities:
      - requirements_consolidation: "要件統合・整合性確認"
      - traceability_matrix_creation: "トレーサビリティマトリクス作成"
      - requirements_baseline: "要件ベースライン確立"
      
    integration_activities:
      consolidation:
        - conflict_resolution: "要件競合の解決"
        - gap_filling: "要件ギャップの補完"
        - consistency_verification: "一貫性検証"
        
      traceability:
        - business_to_functional: "ビジネス要求→機能要件"
        - functional_to_technical: "機能要件→技術要件"
        - requirements_to_tests: "要件→テストケース"
        
    deliverables:
      - integrated_requirements: "統合要件仕様書"
      - traceability_matrix: "要件トレーサビリティマトリクス"
      - requirements_baseline: "要件ベースライン文書"
```

### 3.3 Phase 3: 要件検証・承認（2-3日）
```yaml
phase3_requirements_validation:
  day1_internal_validation:
    duration: "1日"
    responsible: "要件定義リーダー"
    mandatory_activities:
      - self_validation: "自己検証実施"
      - peer_review: "ピアレビュー実施"
      - technical_review: "技術レビュー実施"
      
    validation_checklist:
      completeness_check:
        - all_stakeholders_covered: "全ステークホルダー要求カバー"
        - all_functions_specified: "全機能の仕様化"
        - all_nfr_defined: "全非機能要件定義"
        
      quality_check:
        - clarity_verification: "明確性検証"
        - testability_verification: "テスト可能性検証"
        - consistency_verification: "一貫性検証"
        
      feasibility_check:
        - technical_feasibility: "技術的実現可能性"
        - resource_feasibility: "リソース実現可能性"
        - schedule_feasibility: "スケジュール実現可能性"
        
    deliverables:
      - validation_report: "検証レポート"
      - issue_list: "課題一覧"
      - improvement_plan: "改善計画"
      
  day2_stakeholder_validation:
    duration: "1日"
    responsible: "プロジェクトマネージャー"
    mandatory_activities:
      - stakeholder_review: "ステークホルダーレビュー"
      - feedback_collection: "フィードバック収集"
      - consensus_building: "合意形成"
      
    validation_process:
      review_sessions:
        - business_stakeholder_review: "ビジネスステークホルダーレビュー"
        - technical_stakeholder_review: "技術ステークホルダーレビュー"
        - user_representative_review: "ユーザー代表レビュー"
        
      feedback_management:
        - feedback_categorization: "フィードバック分類"
        - impact_assessment: "影響評価"
        - resolution_planning: "解決計画"
        
    deliverables:
      - stakeholder_feedback: "ステークホルダーフィードバック"
      - consensus_record: "合意記録"
      - final_adjustments: "最終調整事項"
      
  day3_quality_gate_1:
    duration: "1日"
    responsible: "品質ゲートキーパー"
    mandatory_activities:
      - qg1_execution: "品質ゲート1実行（必須）"
      - quality_assessment: "品質評価実施"
      - pass_fail_decision: "Pass/Fail判定"
      
    quality_gate_process:
      preparation:
        - evidence_collection: "証拠収集"
        - assessment_checklist: "評価チェックリスト準備"
        - criteria_review: "評価基準レビュー"
        
      evaluation:
        - automated_checks: "自動チェック実行"
        - manual_review: "手動レビュー実施"
        - stakeholder_validation: "ステークホルダー検証"
        
      decision:
        - scoring: "定量的スコアリング"
        - judgment: "総合判定"
        - documentation: "判定理由文書化"
        
    deliverables:
      - qg1_assessment_report: "QG1評価レポート（必須）"
      - pass_fail_decision: "Pass/Fail判定書（必須）"
      - improvement_actions: "改善アクション（Fail時必須）"
```

## 4. 成果物品質基準

### 4.1 機能要件仕様書品質基準
```yaml
functional_requirements_quality_criteria:
  completeness_criteria:
    coverage: "100%（全機能カバー）"
    detail_level: "実装可能レベル"
    traceability: "100%（ビジネス要求との紐付け）"
    
  clarity_criteria:
    ambiguity: "0%（曖昧表現なし）"
    measurability: "100%（測定可能）"
    testability: "100%（テスト可能）"
    
  consistency_criteria:
    terminology: "100%（用語統一）"
    format: "100%（形式統一）"
    structure: "100%（構造統一）"
```

### 4.2 非機能要件仕様書品質基準
```yaml
non_functional_requirements_quality_criteria:
  quantitative_criteria:
    measurable_targets: "100%（定量的目標）"
    acceptance_thresholds: "100%（受入閾値定義）"
    measurement_methods: "100%（測定方法定義）"
    
  coverage_criteria:
    performance: "100%（性能要件カバー）"
    security: "100%（セキュリティ要件カバー）"
    usability: "100%（ユーザビリティ要件カバー）"
    reliability: "100%（信頼性要件カバー）"
```

---

**STEP1プロセス設計者**: プロセスエンジニアリングシステム ver3.1  
**プロセス品質レベル**: 最高（強制実行・完全性保証）  
**適用範囲**: 全規模・全技術・全チーム  
**効果保証**: 要件漏れ率5%以下、ステークホルダー満足度95%以上  
**更新日**: 2025-07-07
