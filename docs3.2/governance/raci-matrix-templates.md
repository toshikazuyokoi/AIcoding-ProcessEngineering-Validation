# RACI表テンプレート集

**バージョン**: 3.2.0  
**作成日**: 2025-07-09  
**理論分類**: ガバナンス層  
**文書種別**: 責任管理テンプレート  
**適用範囲**: 全プロセス・全工程・全成果物・全関係者  

## 1. RACI表テンプレート集 概要

### 1.1 テンプレート集の目的
RACI表テンプレート集は、**「曖昧な役割から明確な責任・権限への完全転換」**を実現するため、全プロセス・工程において即座に適用可能な標準化されたRACI表テンプレートを提供し、責任・権限の100%明確化を保証する実践的ガバナンスツールである。

```yaml
raci_template_collection_purpose:
  primary_objective: "責任・権限の100%明確化・即座適用可能"
  elimination_target: "曖昧性・不明確性・責任回避の完全排除"
  standardization_goal: "RACI定義の組織的統一・一貫性確保"
  execution_guarantee: "確実な責任履行・説明責任の保証"
  
  template_characteristics:
    immediate_applicability: "即座適用可能・実践的使用性"
    comprehensive_coverage: "全プロセス・工程の完全カバレッジ"
    standardized_format: "標準化フォーマット・一貫性保証"
    customization_flexibility: "プロジェクト特性に応じたカスタマイズ可能性"
```

### 1.2 RACI定義標準

```yaml
raci_definition_standards:
  responsible_r_definition:
    role: "実行責任 - 実際に作業を実行する責任"
    characteristics: "作業実行・成果物作成・品質確保・期限遵守"
    assignment_rule: "1つの作業に対して1人または1チーム（明確な責任分担）"
    accountability: "作業完了・品質達成・期限遵守への完全責任"
    authority: "作業実行に必要な権限・リソースアクセス権"
    
  accountable_a_definition:
    role: "説明責任 - 最終的な結果に対する責任"
    characteristics: "意思決定・承認・最終責任・ステークホルダー説明"
    assignment_rule: "1つの作業に対して必ず1人のみ（単一責任者原則）"
    authority: "最終判定権限・進行停止権限・リソース配分権限"
    accountability: "結果への完全責任・ステークホルダーへの説明責任"
    
  consulted_c_definition:
    role: "協議対象 - 意思決定前に相談される立場"
    characteristics: "専門知識提供・助言・レビュー・推奨事項提示"
    assignment_rule: "必要に応じて複数人可能（専門性重視選定）"
    responsibility: "専門的見解・客観的評価・改善提案の提供"
    timing: "意思決定前の事前協議・双方向コミュニケーション"
    
  informed_i_definition:
    role: "情報共有対象 - 結果を知らされる立場"
    characteristics: "情報受領・状況把握・連携調整・関連対応"
    assignment_rule: "関係者全員を適切に指定（情報共有漏れ防止）"
    expectation: "情報受領・理解・必要時の適切な対応・連携協力"
    timing: "意思決定後の結果通知・一方向コミュニケーション"
```

## 2. プロセス別RACI表テンプレート

### 2.1 STEP0: ゴール定義プロセス RACI表

```yaml
step0_goal_definition_raci:
  template_name: "STEP0_ゴール定義_RACI表"
  process_scope: "プロジェクトゴール設定・ビジョン定義・成功基準確立"
  
  activities_raci_matrix:
    project_vision_definition:
      responsible: "プロジェクトマネージャー"
      accountable: "プロジェクトスポンサー"
      consulted: "ステークホルダー代表・ビジネスアナリスト"
      informed: "開発チーム・品質保証・運用チーム"
      
    success_criteria_establishment:
      responsible: "ビジネスアナリスト"
      accountable: "プロダクトオーナー"
      consulted: "技術リーダー・UXデザイナー"
      informed: "開発チーム・テストチーム・ステークホルダー"
      
    scope_boundary_definition:
      responsible: "プロジェクトマネージャー"
      accountable: "プロジェクトスポンサー"
      consulted: "アーキテクト・ビジネスアナリスト"
      informed: "全プロジェクトチーム・関連部門"
      
    stakeholder_identification:
      responsible: "ビジネスアナリスト"
      accountable: "プロジェクトマネージャー"
      consulted: "プロジェクトスポンサー・部門長"
      informed: "開発チーム・品質保証・運用チーム"
      
    risk_assumption_definition:
      responsible: "リスクマネージャー"
      accountable: "プロジェクトマネージャー"
      consulted: "技術リーダー・セキュリティ専門家"
      informed: "全プロジェクトチーム・ステークホルダー"
```

### 2.2 STEP1: 要件定義プロセス RACI表

```yaml
step1_requirements_definition_raci:
  template_name: "STEP1_要件定義_RACI表"
  process_scope: "機能要件・非機能要件・制約条件・画面一覧定義"
  
  activities_raci_matrix:
    functional_requirements_analysis:
      responsible: "ビジネスアナリスト"
      accountable: "プロダクトオーナー"
      consulted: "ステークホルダー代表・UXデザイナー"
      informed: "開発チーム・テストチーム・アーキテクト"
      
    non_functional_requirements_definition:
      responsible: "システムアナリスト"
      accountable: "技術責任者"
      consulted: "アーキテクト・インフラエンジニア・セキュリティ専門家"
      informed: "開発チーム・運用チーム・品質保証"
      
    screen_inventory_creation:
      responsible: "UXデザイナー"
      accountable: "プロダクトオーナー"
      consulted: "ビジネスアナリスト・フロントエンドリーダー"
      informed: "開発チーム・テストチーム・ステークホルダー"
      
    requirements_traceability_establishment:
      responsible: "ビジネスアナリスト"
      accountable: "品質保証責任者"
      consulted: "プロダクトオーナー・システムアナリスト"
      informed: "開発チーム・テストチーム・アーキテクト"
      
    acceptance_criteria_definition:
      responsible: "プロダクトオーナー"
      accountable: "ステークホルダー代表"
      consulted: "ビジネスアナリスト・テストリーダー"
      informed: "開発チーム・品質保証・運用チーム"
```

### 2.3 STEP2: アーキテクチャ設計プロセス RACI表

```yaml
step2_architecture_design_raci:
  template_name: "STEP2_アーキテクチャ設計_RACI表"
  process_scope: "システムアーキテクチャ・技術選定・画面アーキテクチャ設計"
  
  activities_raci_matrix:
    system_architecture_design:
      responsible: "システムアーキテクト"
      accountable: "技術責任者"
      consulted: "シニアエンジニア・インフラエンジニア"
      informed: "開発チーム・運用チーム・品質保証"
      
    technology_stack_selection:
      responsible: "技術リーダー"
      accountable: "技術責任者"
      consulted: "システムアーキテクト・シニアエンジニア"
      informed: "開発チーム・インフラチーム・セキュリティチーム"
      
    screen_architecture_design:
      responsible: "フロントエンドアーキテクト"
      accountable: "技術責任者"
      consulted: "UXデザイナー・システムアーキテクト"
      informed: "フロントエンドチーム・バックエンドチーム・テストチーム"
      
    data_architecture_design:
      responsible: "データアーキテクト"
      accountable: "技術責任者"
      consulted: "システムアーキテクト・DBA"
      informed: "開発チーム・運用チーム・品質保証"
      
    security_architecture_design:
      responsible: "セキュリティアーキテクト"
      accountable: "セキュリティ責任者"
      consulted: "システムアーキテクト・インフラエンジニア"
      informed: "開発チーム・運用チーム・コンプライアンス"
```

### 2.4 STEP3: 詳細設計プロセス RACI表

```yaml
step3_detailed_design_raci:
  template_name: "STEP3_詳細設計_RACI表"
  process_scope: "詳細設計・UI統合設計・視覚的設計表現・ワイヤーフレーム"
  
  activities_raci_matrix:
    detailed_design_creation:
      responsible: "リードエンジニア"
      accountable: "開発責任者"
      consulted: "システムアーキテクト・シニアエンジニア"
      informed: "開発チーム・テストチーム・品質保証"
      
    ui_detailed_design:
      responsible: "UIデザイナー"
      accountable: "UXリーダー"
      consulted: "フロントエンドリーダー・プロダクトオーナー"
      informed: "フロントエンドチーム・テストチーム・ステークホルダー"
      
    wireframe_creation:
      responsible: "UXデザイナー"
      accountable: "UXリーダー"
      consulted: "UIデザイナー・フロントエンドリーダー"
      informed: "開発チーム・テストチーム・プロダクトオーナー"
      
    visual_design_standardization:
      responsible: "ビジュアルデザイナー"
      accountable: "デザイン責任者"
      consulted: "UXデザイナー・ブランドマネージャー"
      informed: "開発チーム・マーケティング・ステークホルダー"
      
    api_specification_design:
      responsible: "APIデザイナー"
      accountable: "技術リーダー"
      consulted: "システムアーキテクト・フロントエンドリーダー"
      informed: "開発チーム・テストチーム・運用チーム"
```

### 2.5 STEP4: テスト設計プロセス RACI表

```yaml
step4_test_design_raci:
  template_name: "STEP4_テスト設計_RACI表"
  process_scope: "テスト戦略・テストケース・データベーステスト・自動化設計"
  
  activities_raci_matrix:
    test_strategy_definition:
      responsible: "テストリーダー"
      accountable: "品質保証責任者"
      consulted: "開発リーダー・システムアーキテクト"
      informed: "開発チーム・運用チーム・ステークホルダー"
      
    test_case_design:
      responsible: "テストエンジニア"
      accountable: "テストリーダー"
      consulted: "ビジネスアナリスト・開発エンジニア"
      informed: "開発チーム・品質保証・プロダクトオーナー"
      
    database_test_design:
      responsible: "データベーステストエンジニア"
      accountable: "品質保証責任者"
      consulted: "DBA・データアーキテクト"
      informed: "開発チーム・運用チーム・データ管理者"
      
    test_automation_design:
      responsible: "テスト自動化エンジニア"
      accountable: "テストリーダー"
      consulted: "開発リーダー・DevOpsエンジニア"
      informed: "開発チーム・運用チーム・品質保証"
      
    performance_test_design:
      responsible: "性能テストエンジニア"
      accountable: "品質保証責任者"
      consulted: "システムアーキテクト・インフラエンジニア"
      informed: "開発チーム・運用チーム・ステークホルダー"
```

### 2.6 STEP5: 開発計画プロセス RACI表

```yaml
step5_development_planning_raci:
  template_name: "STEP5_開発計画_RACI表"
  process_scope: "実装計画・リソース配分・スケジュール・リスク管理"
  
  activities_raci_matrix:
    implementation_plan_creation:
      responsible: "プロジェクトマネージャー"
      accountable: "開発責任者"
      consulted: "技術リーダー・リソースマネージャー"
      informed: "開発チーム・ステークホルダー・運用チーム"
      
    resource_allocation_planning:
      responsible: "リソースマネージャー"
      accountable: "開発責任者"
      consulted: "プロジェクトマネージャー・技術リーダー"
      informed: "開発チーム・人事・部門長"
      
    development_schedule_creation:
      responsible: "プロジェクトマネージャー"
      accountable: "開発責任者"
      consulted: "技術リーダー・テストリーダー"
      informed: "開発チーム・品質保証・ステークホルダー"
      
    risk_management_planning:
      responsible: "リスクマネージャー"
      accountable: "プロジェクトマネージャー"
      consulted: "技術リーダー・品質保証責任者"
      informed: "開発チーム・ステークホルダー・経営陣"
      
    quality_assurance_planning:
      responsible: "品質保証責任者"
      accountable: "開発責任者"
      consulted: "テストリーダー・プロジェクトマネージャー"
      informed: "開発チーム・テストチーム・ステークホルダー"
```

### 2.7 STEP6: タスクリストプロセス RACI表

```yaml
step6_task_list_raci:
  template_name: "STEP6_タスクリスト_RACI表"
  process_scope: "詳細タスク定義・7サブタスク標準・進捗追跡システム"
  
  activities_raci_matrix:
    detailed_task_definition:
      responsible: "開発リーダー"
      accountable: "プロジェクトマネージャー"
      consulted: "技術リーダー・シニアエンジニア"
      informed: "開発チーム・品質保証・ステークホルダー"
      
    seven_subtask_standardization:
      responsible: "プロセス改善担当"
      accountable: "開発責任者"
      consulted: "開発リーダー・品質保証責任者"
      informed: "開発チーム・プロジェクトマネージャー"
      
    task_estimation:
      responsible: "シニアエンジニア"
      accountable: "開発リーダー"
      consulted: "技術リーダー・アーキテクト"
      informed: "開発チーム・プロジェクトマネージャー"
      
    progress_tracking_system_setup:
      responsible: "プロジェクトマネージャー"
      accountable: "開発責任者"
      consulted: "ツール管理者・開発リーダー"
      informed: "開発チーム・ステークホルダー・品質保証"
      
    dependency_management:
      responsible: "開発リーダー"
      accountable: "プロジェクトマネージャー"
      consulted: "技術リーダー・アーキテクト"
      informed: "開発チーム・テストチーム・運用チーム"
```

### 2.8 STEP7: 実装プロセス RACI表

```yaml
step7_implementation_raci:
  template_name: "STEP7_実装_RACI表"
  process_scope: "コード実装・AI協調・品質確保・統合・デプロイ"
  
  activities_raci_matrix:
    code_implementation:
      responsible: "開発エンジニア"
      accountable: "開発リーダー"
      consulted: "シニアエンジニア・アーキテクト"
      informed: "テストチーム・品質保証・プロジェクトマネージャー"
      
    code_review:
      responsible: "シニアエンジニア"
      accountable: "開発リーダー"
      consulted: "アーキテクト・セキュリティ専門家"
      informed: "開発チーム・品質保証・技術リーダー"
      
    unit_testing:
      responsible: "開発エンジニア"
      accountable: "開発リーダー"
      consulted: "テストエンジニア・品質保証"
      informed: "テストチーム・プロジェクトマネージャー"
      
    integration_testing:
      responsible: "統合テストエンジニア"
      accountable: "テストリーダー"
      consulted: "開発リーダー・システムアーキテクト"
      informed: "開発チーム・運用チーム・品質保証"
      
    deployment_preparation:
      responsible: "DevOpsエンジニア"
      accountable: "運用責任者"
      consulted: "開発リーダー・インフラエンジニア"
      informed: "開発チーム・運用チーム・ステークホルダー"
```

## 3. 品質ゲート別RACI表テンプレート

### 3.1 品質ゲート1: 要件完全性 RACI表

```yaml
quality_gate_1_raci:
  template_name: "QG1_要件完全性_RACI表"
  gate_scope: "要件カバレッジ・トレーサビリティ・ステークホルダー承認"
  
  gate_activities_raci:
    requirements_coverage_verification:
      responsible: "品質ゲートキーパー(要件)"
      accountable: "品質保証責任者"
      consulted: "ビジネスアナリスト・プロダクトオーナー"
      informed: "開発チーム・ステークホルダー・プロジェクトマネージャー"
      
    traceability_matrix_validation:
      responsible: "品質ゲートキーパー(要件)"
      accountable: "品質保証責任者"
      consulted: "ビジネスアナリスト・システムアナリスト"
      informed: "開発チーム・テストチーム・アーキテクト"
      
    stakeholder_approval_confirmation:
      responsible: "品質ゲートキーパー(要件)"
      accountable: "品質保証責任者"
      consulted: "プロダクトオーナー・ステークホルダー代表"
      informed: "プロジェクトチーム・経営陣"
      
    gate_pass_fail_decision:
      responsible: "品質ゲートキーパー(要件)"
      accountable: "品質保証責任者"
      consulted: "なし（独立判定）"
      informed: "全プロジェクトチーム・ステークホルダー・経営陣"
```

### 3.2 品質ゲート2: アーキテクチャ実現可能性 RACI表

```yaml
quality_gate_2_raci:
  template_name: "QG2_アーキテクチャ実現可能性_RACI表"
  gate_scope: "技術実現可能性・性能要件・セキュリティ・視覚的設計確認"
  
  gate_activities_raci:
    technical_feasibility_assessment:
      responsible: "品質ゲートキーパー(設計)"
      accountable: "技術責任者"
      consulted: "システムアーキテクト・技術リーダー"
      informed: "開発チーム・インフラチーム・運用チーム"
      
    performance_requirements_validation:
      responsible: "品質ゲートキーパー(設計)"
      accountable: "技術責任者"
      consulted: "性能エンジニア・インフラエンジニア"
      informed: "開発チーム・運用チーム・ステークホルダー"
      
    security_architecture_review:
      responsible: "品質ゲートキーパー(設計)"
      accountable: "セキュリティ責任者"
      consulted: "セキュリティアーキテクト・セキュリティ専門家"
      informed: "開発チーム・運用チーム・コンプライアンス"
      
    visual_design_consistency_check:
      responsible: "品質ゲートキーパー(設計)"
      accountable: "技術責任者"
      consulted: "UXリーダー・デザイン責任者"
      informed: "開発チーム・デザインチーム・ステークホルダー"
```

## 4. RACI表カスタマイズガイドライン

### 4.1 プロジェクト特性別カスタマイズ

```yaml
project_specific_customization:
  small_project_adaptation:
    role_consolidation: "複数役割の1人への集約（品質維持前提）"
    simplified_process: "プロセス簡素化（必須要素維持）"
    flexible_consultation: "協議対象の柔軟な調整"
    streamlined_information: "情報共有の効率化"
    
  large_project_adaptation:
    role_specialization: "役割の専門化・細分化"
    hierarchical_structure: "階層的責任構造の導入"
    cross_functional_coordination: "機能横断的調整の強化"
    formal_communication: "正式コミュニケーションの確立"
    
  agile_project_adaptation:
    iterative_responsibility: "反復的責任サイクルの導入"
    collaborative_decision: "協調的意思決定の促進"
    rapid_feedback: "迅速フィードバックループの確立"
    adaptive_roles: "適応的役割調整の実装"
```

### 4.2 組織成熟度別適用

```yaml
organizational_maturity_adaptation:
  maturity_level_1_basic:
    clear_role_definition: "明確な役割定義・基本責任確立"
    simple_accountability: "シンプルな説明責任構造"
    structured_communication: "構造化コミュニケーション導入"
    basic_governance: "基本ガバナンス確立"
    
  maturity_level_2_managed:
    process_standardization: "プロセス標準化・一貫性確保"
    performance_measurement: "責任履行パフォーマンス測定"
    continuous_improvement: "継続的改善の組織化"
    stakeholder_alignment: "ステークホルダー整合の強化"
    
  maturity_level_3_defined:
    integrated_governance: "統合ガバナンス・全社最適化"
    predictive_management: "予測的責任管理・リスク予防"
    innovation_integration: "革新的責任モデルの統合"
    excellence_pursuit: "責任履行卓越性の追求"
```

---

**テンプレート作成者**: プロセスエンジニアリングシステム ver3.2  
**適用原則**: 責任・権限100%明確化・即座適用可能  
**保証レベル**: 曖昧性完全排除・確実な責任履行  
**更新日**: 2025-07-09
