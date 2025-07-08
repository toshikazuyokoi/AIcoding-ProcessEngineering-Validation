# 責任・権限指名テンプレート

**バージョン**: 3.1.0  
**作成日**: 2025-07-08  
**理論分類**: テンプレート層  
**文書種別**: 責任・権限指名テンプレート  
**改善レベル**: 実証実験問題根本解決版  

## 1. 責任・権限指名テンプレート概要

### 1.1 テンプレート定義
責任・権限指名テンプレートは、プロセスエンジニアリング理論ver3.1における**各プロセスの責任者・権限者を具体的に指名し、実証実験で発見された責任曖昧化問題を根本解決**する必須実行テンプレートである。

### 1.2 指名原則
```yaml
assignment_principles:
  specific_individual_assignment: "個人名での具体的指名（役職名のみ禁止）"
  single_point_accountability: "単一責任者原則（1プロセス1責任者）"
  clear_authority_definition: "明確な権限範囲定義"
  escalation_path_specification: "エスカレーションパス明確化"
  backup_assignment: "代理者・バックアップ指名"
  
assignment_requirements:
  mandatory_fields: ["個人名", "連絡先", "権限範囲", "責任範囲", "代理者"]
  optional_fields: ["専門分野", "経験年数", "認定資格", "過去実績"]
  validation_criteria: ["実行能力", "権限適切性", "利害関係", "可用性"]
```

## 2. プロジェクト基本情報テンプレート

### 2.1 プロジェクト情報
```yaml
project_basic_information:
  project_name: "[プロジェクト名を記入]"
  project_id: "[プロジェクトIDを記入]"
  project_manager: "[プロジェクトマネージャー個人名]"
  project_sponsor: "[プロジェクトスポンサー個人名]"
  assignment_date: "[指名実施日]"
  assignment_authority: "[指名権限者個人名]"
  
project_scope:
  scale_classification: "[small/medium/large]"
  team_size: "[チーム人数]"
  duration: "[プロジェクト期間]"
  budget: "[予算規模]"
  criticality: "[重要度レベル]"
```

### 2.2 組織構造
```yaml
organizational_structure:
  reporting_structure:
    executive_sponsor: "[経営スポンサー個人名]"
    project_sponsor: "[プロジェクトスポンサー個人名]"
    project_manager: "[プロジェクトマネージャー個人名]"
    
  governance_committee:
    chairperson: "[委員長個人名]"
    members: ["[委員1個人名]", "[委員2個人名]", "[委員3個人名]"]
    
  escalation_contacts:
    level_1: "[第1レベルエスカレーション先個人名]"
    level_2: "[第2レベルエスカレーション先個人名]"
    level_3: "[第3レベルエスカレーション先個人名]"
```

## 3. STEP別責任者指名テンプレート

### 3.1 STEP0: ゴール定義責任者指名
```yaml
step0_goal_definition_assignment:
  process_leader:
    individual_name: "[ゴール定義リーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "ゴール定義プロセス全体の実行権限"
    responsibility_scope: "ゴール品質・完全性・妥当性の結果責任"
    backup_person: "[代理者個人名]"
    
  stakeholder_analyst:
    individual_name: "[ステークホルダー分析者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "ステークホルダー分析・インタビュー実施権限"
    responsibility_scope: "ステークホルダー分析品質・完全性責任"
    backup_person: "[代理者個人名]"
    
  smart_goals_creator:
    individual_name: "[SMART目標作成者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "SMART目標策定・修正権限"
    responsibility_scope: "目標の測定可能性・達成可能性責任"
    backup_person: "[代理者個人名]"
    
  success_criteria_definer:
    individual_name: "[成功基準定義者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "成功基準策定・承認権限"
    responsibility_scope: "成功基準の妥当性・測定可能性責任"
    backup_person: "[代理者個人名]"
```

### 3.2 STEP1: 要件分析責任者指名
```yaml
step1_requirements_analysis_assignment:
  process_leader:
    individual_name: "[要件分析リーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "要件分析プロセス全体の実行・承認権限"
    responsibility_scope: "要件品質・完全性・一貫性の結果責任"
    backup_person: "[代理者個人名]"
    
  functional_requirements_definer:
    individual_name: "[機能要件定義者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "機能要件策定・変更権限"
    responsibility_scope: "機能要件の完全性・実装可能性責任"
    backup_person: "[代理者個人名]"
    
  non_functional_requirements_definer:
    individual_name: "[非機能要件定義者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "非機能要件策定・変更権限"
    responsibility_scope: "非機能要件の妥当性・測定可能性責任"
    backup_person: "[代理者個人名]"
    
  acceptance_criteria_creator:
    individual_name: "[受入基準作成者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "受入基準策定・承認権限"
    responsibility_scope: "受入基準の明確性・検証可能性責任"
    backup_person: "[代理者個人名]"
```

### 3.3 STEP2: アーキテクチャ設計責任者指名
```yaml
step2_architecture_design_assignment:
  system_architect:
    individual_name: "[システムアーキテクト個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "システムアーキテクチャ設計・承認権限"
    responsibility_scope: "アーキテクチャ品質・実現可能性・拡張性責任"
    backup_person: "[代理者個人名]"
    
  technology_selector:
    individual_name: "[技術選定者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "技術選定・変更権限"
    responsibility_scope: "技術選定の妥当性・リスク評価責任"
    backup_person: "[代理者個人名]"
    
  scalability_designer:
    individual_name: "[拡張性設計者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "拡張性設計・性能要件定義権限"
    responsibility_scope: "拡張性・性能要件の実現可能性責任"
    backup_person: "[代理者個人名]"
```

### 3.4 STEP3: 詳細設計責任者指名
```yaml
step3_detailed_design_assignment:
  design_leader:
    individual_name: "[詳細設計リーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "詳細設計プロセス全体の実行・承認権限"
    responsibility_scope: "設計品質・完全性・実装可能性の結果責任"
    backup_person: "[代理者個人名]"
    
  server_layer_designer:
    individual_name: "[サーバー設計者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "サーバーレイヤー設計・API設計権限"
    responsibility_scope: "サーバー設計品質・性能・セキュリティ責任"
    backup_person: "[代理者個人名]"
    
  ui_layer_designer:
    individual_name: "[UI設計者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "UIレイヤー設計・UX設計権限"
    responsibility_scope: "UI設計品質・ユーザビリティ・アクセシビリティ責任"
    backup_person: "[代理者個人名]"
    
  integration_designer:
    individual_name: "[統合設計者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "システム統合設計・データフロー設計権限"
    responsibility_scope: "統合設計品質・データ整合性・連携性責任"
    backup_person: "[代理者個人名]"
```

### 3.5 STEP4: 実装責任者指名
```yaml
step4_implementation_assignment:
  implementation_leader:
    individual_name: "[実装リーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "実装プロセス全体の実行・品質管理権限"
    responsibility_scope: "実装品質・進捗・チーム管理の結果責任"
    backup_person: "[代理者個人名]"
    
  ai_collaborative_implementer:
    individual_name: "[AI協調実装者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "AI協調実装・コード生成管理権限"
    responsibility_scope: "AI協調実装品質・効率性・安全性責任"
    backup_person: "[代理者個人名]"
    
  code_quality_assurer:
    individual_name: "[コード品質保証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "コードレビュー・品質基準適用権限"
    responsibility_scope: "コード品質・保守性・セキュリティ責任"
    backup_person: "[代理者個人名]"
    
  integration_implementer:
    individual_name: "[統合実装者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "システム統合実装・結合テスト権限"
    responsibility_scope: "統合実装品質・データ整合性・連携性責任"
    backup_person: "[代理者個人名]"
```

### 3.6 STEP5: テスト責任者指名
```yaml
step5_testing_assignment:
  test_leader:
    individual_name: "[テストリーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "テストプロセス全体の実行・品質管理権限"
    responsibility_scope: "テスト品質・カバレッジ・欠陥検出の結果責任"
    backup_person: "[代理者個人名]"
    
  test_execution_planner:
    individual_name: "[テスト実行計画者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "テスト実行計画策定・実行順序決定権限"
    responsibility_scope: "テスト実行効率・依存関係管理・リスク軽減責任"
    backup_person: "[代理者個人名]"
    
  automated_testing_engineer:
    individual_name: "[テスト自動化エンジニア個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "テスト自動化設計・実装・実行権限"
    responsibility_scope: "自動化品質・保守性・実行安定性責任"
    backup_person: "[代理者個人名]"
    
  data_lifecycle_manager:
    individual_name: "[テストデータ管理者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "テストデータ作成・管理・削除権限"
    responsibility_scope: "データ安全性・プライバシー保護・整合性責任"
    backup_person: "[代理者個人名]"
```

### 3.7 STEP6: デプロイ責任者指名
```yaml
step6_deployment_assignment:
  deployment_manager:
    individual_name: "[デプロイマネージャー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "デプロイプロセス全体の実行・承認権限"
    responsibility_scope: "デプロイ品質・安全性・可用性の結果責任"
    backup_person: "[代理者個人名]"
    
  infrastructure_engineer:
    individual_name: "[インフラエンジニア個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "インフラ構築・設定・管理権限"
    responsibility_scope: "インフラ品質・性能・セキュリティ責任"
    backup_person: "[代理者個人名]"
    
  devops_engineer:
    individual_name: "[DevOpsエンジニア個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "CI/CD実行・自動化・監視権限"
    responsibility_scope: "デプロイ自動化・品質・効率性責任"
    backup_person: "[代理者個人名]"
    
  monitoring_engineer:
    individual_name: "[監視エンジニア個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "監視設定・アラート・レポート権限"
    responsibility_scope: "監視品質・可用性・パフォーマンス責任"
    backup_person: "[代理者個人名]"
```

### 3.8 STEP7: 保守責任者指名
```yaml
step7_maintenance_assignment:
  maintenance_manager:
    individual_name: "[保守マネージャー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "保守プロセス全体の実行・管理権限"
    responsibility_scope: "保守品質・可用性・継続改善の結果責任"
    backup_person: "[代理者個人名]"
    
  preventive_maintenance_engineer:
    individual_name: "[予防保守エンジニア個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "予防保守計画・実行・評価権限"
    responsibility_scope: "予防保守効果・システム安定性責任"
    backup_person: "[代理者個人名]"
    
  incident_response_team_lead:
    individual_name: "[インシデント対応チームリーダー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "インシデント対応・復旧・報告権限"
    responsibility_scope: "インシデント対応速度・品質・再発防止責任"
    backup_person: "[代理者個人名]"
    
  continuous_improvement_lead:
    individual_name: "[改善推進担当個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "改善提案・実施・評価権限"
    responsibility_scope: "改善効果・品質向上・効率化責任"
    backup_person: "[代理者個人名]"
```

## 4. 品質ゲート責任者指名テンプレート

### 4.1 品質ゲート1: 要件完全性責任者指名
```yaml
quality_gate_1_assignment:
  gate_keeper:
    individual_name: "[QG1ゲートキーパー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "要件完全性評価・Pass/Fail判定権限"
    responsibility_scope: "要件品質評価の正確性・公正性責任"
    backup_person: "[代理者個人名]"

  requirements_reviewer:
    individual_name: "[要件レビュアー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "要件内容レビュー・改善提案権限"
    responsibility_scope: "要件レビュー品質・専門性責任"
    backup_person: "[代理者個人名]"

  stakeholder_validator:
    individual_name: "[ステークホルダー検証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "ステークホルダー観点検証・承認権限"
    responsibility_scope: "ステークホルダー要求適合性責任"
    backup_person: "[代理者個人名]"
```

### 4.2 品質ゲート2: アーキテクチャ実現可能性責任者指名
```yaml
quality_gate_2_assignment:
  gate_keeper:
    individual_name: "[QG2ゲートキーパー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "アーキテクチャ実現可能性評価・Pass/Fail判定権限"
    responsibility_scope: "アーキテクチャ評価の技術的正確性・実現可能性責任"
    backup_person: "[代理者個人名]"

  architecture_reviewer:
    individual_name: "[アーキテクチャレビュアー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "アーキテクチャ設計レビュー・技術評価権限"
    responsibility_scope: "アーキテクチャレビュー品質・技術的妥当性責任"
    backup_person: "[代理者個人名]"

  technology_validator:
    individual_name: "[技術検証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "技術選定検証・リスク評価権限"
    responsibility_scope: "技術選定妥当性・リスク評価精度責任"
    backup_person: "[代理者個人名]"
```

### 4.3 品質ゲート3: 設計完全性責任者指名
```yaml
quality_gate_3_assignment:
  gate_keeper:
    individual_name: "[QG3ゲートキーパー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "設計完全性評価・Pass/Fail判定権限"
    responsibility_scope: "設計品質評価の完全性・実装準備度責任"
    backup_person: "[代理者個人名]"

  design_reviewer:
    individual_name: "[設計レビュアー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "詳細設計レビュー・品質評価権限"
    responsibility_scope: "設計レビュー品質・実装可能性評価責任"
    backup_person: "[代理者個人名]"

  implementation_readiness_validator:
    individual_name: "[実装準備度検証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "実装準備度検証・開発着手承認権限"
    responsibility_scope: "実装準備度評価精度・開発リスク評価責任"
    backup_person: "[代理者個人名]"
```

### 4.4 品質ゲート4: 実装品質責任者指名
```yaml
quality_gate_4_assignment:
  gate_keeper:
    individual_name: "[QG4ゲートキーパー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "実装品質評価・Pass/Fail判定権限"
    responsibility_scope: "実装品質評価の正確性・リリース可否判定責任"
    backup_person: "[代理者個人名]"

  code_quality_reviewer:
    individual_name: "[コード品質レビュアー個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "コード品質レビュー・品質基準適用権限"
    responsibility_scope: "コード品質評価精度・保守性評価責任"
    backup_person: "[代理者個人名]"

  test_quality_validator:
    individual_name: "[テスト品質検証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "テスト品質検証・カバレッジ評価権限"
    responsibility_scope: "テスト品質評価精度・欠陥検出能力責任"
    backup_person: "[代理者個人名]"

  release_readiness_validator:
    individual_name: "[リリース準備度検証者個人名]"
    contact_info: "[メール/電話]"
    authority_scope: "リリース準備度検証・本番移行承認権限"
    responsibility_scope: "リリース準備度評価精度・本番リスク評価責任"
    backup_person: "[代理者個人名]"
```

## 5. 指名実行手順テンプレート

### 5.1 指名プロセス
```yaml
assignment_process:
  step1_candidate_identification:
    action: "候補者特定"
    responsible: "[指名権限者個人名]"
    criteria: ["専門性", "経験", "可用性", "利害関係", "権限適切性"]
    output: "候補者リスト"

  step2_competency_assessment:
    action: "能力評価"
    responsible: "[人事評価担当個人名]"
    criteria: ["技術能力", "管理能力", "コミュニケーション能力", "問題解決能力"]
    output: "能力評価レポート"

  step3_authority_verification:
    action: "権限確認"
    responsible: "[組織管理者個人名]"
    criteria: ["組織権限", "決定権限", "リソースアクセス権", "情報アクセス権"]
    output: "権限確認書"

  step4_conflict_check:
    action: "利害関係確認"
    responsible: "[コンプライアンス担当個人名]"
    criteria: ["利害関係", "独立性", "公正性", "透明性"]
    output: "利害関係確認書"

  step5_formal_assignment:
    action: "正式指名"
    responsible: "[指名権限者個人名]"
    criteria: ["全評価合格", "本人同意", "組織承認"]
    output: "正式指名書"
```

### 5.2 指名書テンプレート
```yaml
assignment_letter_template:
  header:
    title: "プロセス責任者正式指名書"
    project_name: "[プロジェクト名]"
    assignment_date: "[指名日]"
    effective_date: "[発効日]"

  assignee_information:
    individual_name: "[被指名者個人名]"
    employee_id: "[従業員ID]"
    department: "[所属部門]"
    position: "[役職]"
    contact_info: "[連絡先]"

  assignment_details:
    process_name: "[担当プロセス名]"
    authority_scope: "[権限範囲詳細]"
    responsibility_scope: "[責任範囲詳細]"
    reporting_line: "[報告ライン]"
    escalation_path: "[エスカレーションパス]"

  terms_and_conditions:
    duration: "[任期]"
    performance_criteria: "[成果基準]"
    review_schedule: "[レビュースケジュール]"
    termination_conditions: "[終了条件]"

  signatures:
    assigning_authority: "[指名権限者署名]"
    assignee_acceptance: "[被指名者受諾署名]"
    witness: "[証人署名]"
    hr_approval: "[人事承認署名]"
```

## 6. 責任・権限監視テンプレート

### 6.1 責任履行監視
```yaml
responsibility_monitoring:
  performance_indicators:
    process_execution_rate: "プロセス実行率（目標100%）"
    quality_achievement_rate: "品質達成率（目標95%以上）"
    timeline_adherence_rate: "スケジュール遵守率（目標90%以上）"
    stakeholder_satisfaction: "ステークホルダー満足度（目標4.0以上/5.0）"

  monitoring_schedule:
    daily_check: "日次進捗確認"
    weekly_review: "週次品質レビュー"
    monthly_assessment: "月次総合評価"
    quarterly_audit: "四半期監査"

  escalation_triggers:
    performance_below_threshold: "成果基準未達成"
    quality_issues: "品質問題発生"
    stakeholder_complaints: "ステークホルダー苦情"
    process_delays: "プロセス遅延"
```

### 6.2 権限行使監視
```yaml
authority_monitoring:
  authority_usage_tracking:
    decision_log: "意思決定ログ"
    approval_record: "承認記録"
    resource_allocation: "リソース配分記録"
    escalation_usage: "エスカレーション使用記録"

  compliance_check:
    authority_scope_adherence: "権限範囲遵守確認"
    proper_consultation: "適切な相談実施確認"
    documentation_completeness: "文書化完全性確認"
    transparency_maintenance: "透明性維持確認"

  audit_trail:
    action_timestamp: "行動タイムスタンプ"
    decision_rationale: "判断根拠記録"
    consultation_record: "相談記録"
    impact_assessment: "影響評価記録"
```

---

**責任・権限指名テンプレート設計者**: プロセスエンジニアリングシステム ver3.1
**実行保証レベル**: 最高（責任明確化・権限保護・監視強化）
**適用範囲**: 全プロセス・全プロジェクト・全責任者
**効果保証**: 責任曖昧化100%排除、プロセス実行品質向上、説明責任強化
**更新日**: 2025-07-08
