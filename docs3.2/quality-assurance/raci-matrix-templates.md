# RACI表テンプレート集

**バージョン**: 3.2.0
**作成日**: 2025-07-09
**理論分類**: 品質保証層
**テンプレート種別**: 責任・権限・RACI表・組織管理
**適用範囲**: 全プロセス・全活動・全責任・全権限明確化

## 1. RACI表テンプレート集 概要

### 1.1 テンプレート集の目的
RACI表テンプレート集は、**「曖昧な役割から明確な責任・権限への転換・組織効率最大化・品質保証確実性」**を実現するため、プロセス別RACI表・活動別責任定義・権限明確化・エスカレーション体系を体系的に提供し、組織が迷わず確実にプロセスを実行できる完全な責任・権限管理システムである。

```yaml
raci_matrix_templates_purpose:
  primary_objective: "曖昧役割→明確責任権限転換・組織効率最大化・品質保証確実性"
  critical_achievement: "責任明確性・権限確実性・組織効率・品質保証・実行確実性"
  elimination_target: "役割曖昧性・責任不明・権限混乱・組織非効率・品質リスク排除"
  foundation_guarantee: "確実プロセス実行・品質保証・組織効率・責任明確・成功確実性"

  template_characteristics:
    comprehensive_coverage: "包括的カバレッジ・全プロセス・全活動・全責任・全権限"
    explicit_definition: "明示的定義・詳細・明確・実行可能・測定可能・管理可能"
    scalable_structure: "拡張可能構造・組織規模・プロジェクト規模・適応・効率"
    quality_integration: "品質統合・品質保証・品質ゲート・責任・権限・確実性"
```

### 1.2 RACI定義・基本原則

```yaml
raci_definition_principles:
  raci_definitions:
    responsible: "実行責任・作業実行・成果物作成・品質確保・完了責任・価値創造"
    accountable: "説明責任・最終責任・承認権限・品質保証・成功責任・価値実現"
    consulted: "相談対象・専門知識・助言提供・品質向上・支援・価値貢献"
    informed: "情報共有・進捗報告・結果通知・透明性・理解・価値認識"

  assignment_principles:
    single_accountable: "単一説明責任・一人一責任・明確・決定・承認・責任・確実性"
    multiple_responsible: "複数実行責任・協調・分担・効率・品質・価値・成功"
    relevant_consulted: "関連相談・専門性・必要性・効率・品質・価値・最適化"
    appropriate_informed: "適切情報共有・必要性・透明性・効率・理解・価値"

  quality_principles:
    clear_boundaries: "明確境界・責任範囲・権限範囲・重複排除・漏れ防止・効率"
    measurable_outcomes: "測定可能成果・品質基準・完了基準・評価・改善・価値"
    escalation_paths: "エスカレーション経路・問題解決・意思決定・迅速・確実"
    continuous_improvement: "継続改善・最適化・効率・品質・価値・競争力・成長"
```

## 2. プロセス別RACI表テンプレート

### 2.1 STEP0: ゴール定義プロセス RACI表

```yaml
step0_goal_definition_raci:
  stakeholder_analysis:
    responsible: "ビジネスアナリスト・プロジェクトマネージャー"
    accountable: "プロジェクト責任者・ビジネス責任者"
    consulted: "ステークホルダー代表・ドメイン専門家・上級管理者"
    informed: "開発チーム・品質保証・運用チーム・関係部門"

  goal_definition:
    responsible: "プロジェクトマネージャー・ビジネスアナリスト"
    accountable: "プロジェクト責任者・ビジネス責任者"
    consulted: "ステークホルダー・戦略企画・上級管理者・専門家"
    informed: "開発チーム・品質保証・運用チーム・関係部門・経営陣"

  success_criteria_definition:
    responsible: "ビジネスアナリスト・品質保証責任者"
    accountable: "プロジェクト責任者・ビジネス責任者"
    consulted: "ステークホルダー・測定専門家・品質専門家"
    informed: "開発チーム・テストチーム・運用チーム・関係部門"

  stakeholder_alignment:
    responsible: "プロジェクトマネージャー・コミュニケーション責任者"
    accountable: "プロジェクト責任者・ビジネス責任者"
    consulted: "ステークホルダー代表・上級管理者・専門家"
    informed: "全チーム・関係部門・経営陣・パートナー"
```

### 2.2 STEP1: 要件定義プロセス RACI表

```yaml
step1_requirements_definition_raci:
  functional_requirements:
    responsible: "ビジネスアナリスト・要件エンジニア"
    accountable: "要件責任者・ビジネス責任者"
    consulted: "ユーザー代表・ドメイン専門家・システムアーキテクト"
    informed: "開発チーム・テストチーム・UI/UXデザイナー・運用チーム"

  non_functional_requirements:
    responsible: "システムアーキテクト・性能専門家"
    accountable: "技術責任者・アーキテクチャ責任者"
    consulted: "インフラエンジニア・セキュリティ専門家・運用専門家"
    informed: "開発チーム・テストチーム・品質保証・ステークホルダー"

  constraint_conditions:
    responsible: "システムアーキテクト・技術リーダー"
    accountable: "技術責任者・プロジェクト責任者"
    consulted: "法務・コンプライアンス・セキュリティ専門家・調達"
    informed: "開発チーム・テストチーム・運用チーム・ステークホルダー"

  screen_inventory:
    responsible: "UI/UXデザイナー・ビジネスアナリスト"
    accountable: "デザイン責任者・要件責任者"
    consulted: "ユーザー代表・フロントエンドリーダー・ユーザビリティ専門家"
    informed: "開発チーム・テストチーム・ステークホルダー・プロダクトオーナー"
```

### 2.3 STEP2: アーキテクチャ設計プロセス RACI表

```yaml
step2_architecture_design_raci:
  system_architecture:
    responsible: "システムアーキテクト・技術リーダー"
    accountable: "技術責任者・アーキテクチャ責任者"
    consulted: "シニアエンジニア・インフラエンジニア・セキュリティ専門家"
    informed: "開発チーム・運用チーム・プロジェクトマネージャー・ステークホルダー"

  technology_selection:
    responsible: "技術リーダー・アーキテクト"
    accountable: "技術責任者・CTO"
    consulted: "シニアエンジニア・技術専門家・ベンダー・調達"
    informed: "開発チーム・運用チーム・プロジェクトマネージャー・経営陣"

  screen_architecture:
    responsible: "フロントエンドアーキテクト・UXデザイナー"
    accountable: "技術責任者・デザイン責任者"
    consulted: "UIデザイナー・システムアーキテクト・ユーザビリティ専門家"
    informed: "フロントエンドチーム・バックエンドチーム・テストチーム"

  data_security_architecture:
    responsible: "データアーキテクト・セキュリティアーキテクト"
    accountable: "技術責任者・セキュリティ責任者"
    consulted: "DBA・セキュリティ専門家・コンプライアンス・法務"
    informed: "開発チーム・運用チーム・監査・リスク管理・経営陣"
```

### 2.4 STEP3: 詳細設計プロセス RACI表

```yaml
step3_detailed_design_raci:
  component_detailed_design:
    responsible: "リードエンジニア・設計エンジニア"
    accountable: "開発責任者・技術リーダー"
    consulted: "システムアーキテクト・シニアエンジニア・ドメイン専門家"
    informed: "開発チーム・テストチーム・品質保証・プロジェクトマネージャー"

  ui_detailed_integration_design:
    responsible: "UIデザイナー・UXデザイナー"
    accountable: "デザイン責任者・UXリーダー"
    consulted: "フロントエンドリーダー・ユーザビリティ専門家・ブランドマネージャー"
    informed: "フロントエンドチーム・開発チーム・テストチーム・ステークホルダー"

  visual_design_mermaid:
    responsible: "システムアナリスト・設計エンジニア"
    accountable: "技術リーダー・設計責任者"
    consulted: "システムアーキテクト・ドメイン専門家・データアーキテクト"
    informed: "開発チーム・テストチーム・ステークホルダー・プロジェクトマネージャー"

  wireframe_prototype:
    responsible: "UXデザイナー・プロトタイプデザイナー"
    accountable: "UXリーダー・デザイン責任者"
    consulted: "UIデザイナー・ユーザビリティ専門家・ユーザー代表"
    informed: "フロントエンドチーム・開発チーム・ステークホルダー・プロダクトオーナー"
```

## 3. 品質ゲート別RACI表テンプレート

### 3.1 品質ゲート1: 要件完全性 RACI表

```yaml
quality_gate_1_requirements_completeness_raci:
  requirements_verification:
    responsible: "品質ゲートキーパー(要件)・品質保証エンジニア"
    accountable: "品質保証責任者・要件責任者"
    consulted: "ビジネスアナリスト・ステークホルダー代表・ドメイン専門家"
    informed: "開発チーム・テストチーム・プロジェクトマネージャー・ステークホルダー"

  completeness_assessment:
    responsible: "要件エンジニア・品質保証エンジニア"
    accountable: "要件責任者・品質保証責任者"
    consulted: "ビジネスアナリスト・システムアーキテクト・ユーザー代表"
    informed: "開発チーム・テストチーム・ステークホルダー・経営陣"

  gate_decision:
    responsible: "品質ゲートキーパー(要件)"
    accountable: "品質保証責任者・要件責任者"
    consulted: "プロジェクト責任者・技術責任者・ステークホルダー代表"
    informed: "全チーム・ステークホルダー・経営陣・関係部門"

  improvement_actions:
    responsible: "要件エンジニア・ビジネスアナリスト"
    accountable: "要件責任者・プロジェクト責任者"
    consulted: "品質保証・ステークホルダー・専門家・上級管理者"
    informed: "開発チーム・テストチーム・ステークホルダー・経営陣"
```

### 3.2 品質ゲート2: アーキテクチャ実現可能性 RACI表

```yaml
quality_gate_2_architecture_feasibility_raci:
  technical_feasibility_verification:
    responsible: "品質ゲートキーパー(アーキテクチャ)・技術品質保証"
    accountable: "技術責任者・アーキテクチャ責任者"
    consulted: "システムアーキテクト・セキュリティ専門家・性能専門家"
    informed: "開発チーム・運用チーム・プロジェクトマネージャー・ステークホルダー"

  performance_requirements_verification:
    responsible: "性能専門家・システムアーキテクト"
    accountable: "技術責任者・性能責任者"
    consulted: "インフラエンジニア・開発リーダー・運用専門家"
    informed: "開発チーム・テストチーム・運用チーム・ステークホルダー"

  security_adequacy_assessment:
    responsible: "セキュリティ専門家・セキュリティアーキテクト"
    accountable: "セキュリティ責任者・技術責任者"
    consulted: "コンプライアンス・法務・監査・リスク管理"
    informed: "開発チーム・運用チーム・経営陣・ステークホルダー"

  gate_decision:
    responsible: "品質ゲートキーパー(アーキテクチャ)"
    accountable: "技術責任者・アーキテクチャ責任者"
    consulted: "システムアーキテクト・セキュリティ専門家・性能専門家"
    informed: "開発チーム・運用チーム・プロジェクトマネージャー・ステークホルダー"
```

### 3.3 品質ゲート3: 設計完全性 RACI表

```yaml
quality_gate_3_design_completeness_raci:
  design_completeness_verification:
    responsible: "品質ゲートキーパー(詳細設計)・設計品質保証"
    accountable: "開発責任者・設計責任者"
    consulted: "リードエンジニア・UXデザイナー・システムアーキテクト"
    informed: "開発チーム・テストチーム・フロントエンドチーム・ステークホルダー"

  ui_integration_quality_verification:
    responsible: "UXデザイナー・フロントエンドリーダー"
    accountable: "デザイン責任者・UXリーダー"
    consulted: "UIデザイナー・ユーザビリティ専門家・ブランドマネージャー"
    informed: "フロントエンドチーム・開発チーム・テストチーム・ステークホルダー"

  implementation_readiness_assessment:
    responsible: "開発リーダー・技術リーダー"
    accountable: "開発責任者・技術責任者"
    consulted: "システムアーキテクト・シニアエンジニア・専門家"
    informed: "開発チーム・テストチーム・運用チーム・プロジェクトマネージャー"

  gate_decision:
    responsible: "品質ゲートキーパー(詳細設計)"
    accountable: "開発責任者・設計責任者"
    consulted: "リードエンジニア・UXデザイナー・システムアーキテクト"
    informed: "開発チーム・テストチーム・フロントエンドチーム・ステークホルダー"
```

### 3.4 品質ゲート4: 実装品質 RACI表

```yaml
quality_gate_4_implementation_quality_raci:
  implementation_quality_verification:
    responsible: "品質ゲートキーパー(実装・テスト)・品質保証エンジニア"
    accountable: "開発責任者・品質保証責任者"
    consulted: "テストリーダー・プロダクトオーナー・ステークホルダー代表"
    informed: "開発チーム・テストチーム・ステークホルダー・経営陣・運用チーム"

  test_coverage_verification:
    responsible: "テストエンジニア・品質保証エンジニア"
    accountable: "テストリーダー・品質保証責任者"
    consulted: "開発エンジニア・ビジネスアナリスト・ユーザー代表"
    informed: "開発チーム・ステークホルダー・プロジェクトマネージャー・運用チーム"

  value_realization_verification:
    responsible: "プロダクトオーナー・ビジネスアナリスト"
    accountable: "プロジェクト責任者・ビジネス責任者"
    consulted: "ユーザー代表・ステークホルダー・運用チーム・専門家"
    informed: "開発チーム・経営陣・関係部門・パートナー"

  gate_decision:
    responsible: "品質ゲートキーパー(実装・テスト)"
    accountable: "開発責任者・品質保証責任者"
    consulted: "テストリーダー・プロダクトオーナー・ステークホルダー代表"
    informed: "開発チーム・テストチーム・ステークホルダー・経営陣・運用チーム"
```

## 4. 組織規模別RACI表テンプレート

### 4.1 小規模組織(5-15名) RACI表

```yaml
small_organization_raci:
  role_consolidation:
    project_manager_business_analyst: "プロジェクトマネージャー兼ビジネスアナリスト"
    tech_lead_architect: "技術リーダー兼アーキテクト"
    senior_developer_designer: "シニア開発者兼デザイナー"
    qa_engineer_tester: "品質保証エンジニア兼テスター"

  simplified_raci:
    requirements_definition:
      responsible: "プロジェクトマネージャー兼ビジネスアナリスト"
      accountable: "プロジェクト責任者"
      consulted: "技術リーダー・ユーザー代表"
      informed: "開発チーム・ステークホルダー"

    architecture_design:
      responsible: "技術リーダー兼アーキテクト"
      accountable: "プロジェクト責任者"
      consulted: "シニア開発者・外部専門家"
      informed: "開発チーム・ステークホルダー"

    implementation:
      responsible: "開発チーム"
      accountable: "技術リーダー"
      consulted: "プロジェクトマネージャー・品質保証"
      informed: "ステークホルダー"

    testing:
      responsible: "品質保証エンジニア兼テスター"
      accountable: "技術リーダー"
      consulted: "開発チーム・ユーザー代表"
      informed: "ステークホルダー・プロジェクト責任者"
```

### 4.2 中規模組織(16-50名) RACI表

```yaml
medium_organization_raci:
  specialized_roles:
    project_manager: "プロジェクトマネージャー"
    business_analyst: "ビジネスアナリスト"
    system_architect: "システムアーキテクト"
    tech_lead: "技術リーダー"
    ui_ux_designer: "UI/UXデザイナー"
    qa_lead: "品質保証リーダー"

  detailed_raci:
    requirements_definition:
      responsible: "ビジネスアナリスト"
      accountable: "プロジェクトマネージャー"
      consulted: "ステークホルダー・システムアーキテクト・UI/UXデザイナー"
      informed: "開発チーム・品質保証チーム・運用チーム"

    architecture_design:
      responsible: "システムアーキテクト"
      accountable: "技術リーダー"
      consulted: "シニアエンジニア・セキュリティ専門家・インフラエンジニア"
      informed: "開発チーム・品質保証チーム・プロジェクトマネージャー"

    ui_design:
      responsible: "UI/UXデザイナー"
      accountable: "デザインリーダー"
      consulted: "ユーザー代表・フロントエンドリーダー・ブランドマネージャー"
      informed: "フロントエンドチーム・開発チーム・ステークホルダー"

    quality_assurance:
      responsible: "品質保証エンジニア"
      accountable: "品質保証リーダー"
      consulted: "開発チーム・ビジネスアナリスト・ユーザー代表"
      informed: "プロジェクトマネージャー・ステークホルダー・経営陣"
```

### 4.3 大規模組織(51名以上) RACI表

```yaml
large_organization_raci:
  hierarchical_structure:
    executive_level: "経営レベル・戦略・承認・リソース・投資決定"
    management_level: "管理レベル・計画・調整・監督・品質保証"
    operational_level: "実行レベル・実装・テスト・運用・保守"
    specialist_level: "専門レベル・専門知識・助言・支援・革新"

  enterprise_raci:
    strategic_alignment:
      responsible: "戦略企画・プロジェクトマネージャー"
      accountable: "事業責任者・CTO"
      consulted: "経営陣・ステークホルダー・外部コンサルタント"
      informed: "全組織・関係部門・パートナー・顧客"

    architecture_governance:
      responsible: "エンタープライズアーキテクト・アーキテクチャ委員会"
      accountable: "CTO・技術責任者"
      consulted: "システムアーキテクト・セキュリティ責任者・コンプライアンス"
      informed: "開発組織・運用組織・事業部門・経営陣"

    quality_governance:
      responsible: "品質保証組織・品質委員会"
      accountable: "品質責任者・CQO"
      consulted: "監査・コンプライアンス・リスク管理・外部監査"
      informed: "全組織・経営陣・ステークホルダー・顧客"

    delivery_execution:
      responsible: "開発組織・プロジェクトチーム"
      accountable: "プロジェクト責任者・開発責任者"
      consulted: "アーキテクチャ組織・品質保証組織・セキュリティ組織"
      informed: "事業部門・運用組織・経営陣・ステークホルダー"
```

## 5. エスカレーション・意思決定RACI表

### 5.1 問題エスカレーション RACI表

```yaml
problem_escalation_raci:
  level_1_operational_issues:
    responsible: "チームリーダー・実行担当者"
    accountable: "プロジェクトマネージャー・開発責任者"
    consulted: "専門家・シニアメンバー・関連チーム"
    informed: "チームメンバー・関係者・上位管理者"

  level_2_project_issues:
    responsible: "プロジェクトマネージャー・部門責任者"
    accountable: "プロジェクト責任者・事業責任者"
    consulted: "ステークホルダー・専門家・外部コンサルタント"
    informed: "プロジェクトチーム・関係部門・上級管理者"

  level_3_strategic_issues:
    responsible: "事業責任者・上級管理者"
    accountable: "経営陣・CEO・CTO"
    consulted: "取締役会・外部専門家・戦略コンサルタント"
    informed: "全組織・ステークホルダー・投資家・顧客"

  escalation_criteria:
    time_based: "時間ベース・期限・遅延・影響・緊急度・重要度"
    impact_based: "影響ベース・範囲・重大性・リスク・損失・機会"
    complexity_based: "複雑度ベース・技術・組織・政治・法的・規制"
    resource_based: "リソースベース・予算・人員・技術・時間・権限"
```

### 5.2 意思決定権限 RACI表

```yaml
decision_authority_raci:
  technical_decisions:
    architecture_decisions:
      responsible: "システムアーキテクト・技術委員会"
      accountable: "CTO・技術責任者"
      consulted: "開発リーダー・セキュリティ専門家・運用責任者"
      informed: "開発組織・運用組織・プロジェクトマネージャー"

    technology_selection:
      responsible: "技術リーダー・技術委員会"
      accountable: "CTO・技術責任者"
      consulted: "アーキテクト・専門家・ベンダー・調達"
      informed: "開発組織・運用組織・経営陣・調達部門"

  business_decisions:
    scope_changes:
      responsible: "プロジェクトマネージャー・ビジネスアナリスト"
      accountable: "プロジェクト責任者・事業責任者"
      consulted: "ステークホルダー・技術責任者・品質責任者"
      informed: "プロジェクトチーム・関係部門・経営陣"

    budget_allocation:
      responsible: "プロジェクトマネージャー・財務担当"
      accountable: "事業責任者・CFO"
      consulted: "経営陣・監査・リスク管理・調達"
      informed: "プロジェクトチーム・関係部門・ステークホルダー"

  quality_decisions:
    quality_gate_decisions:
      responsible: "品質ゲートキーパー・品質委員会"
      accountable: "品質責任者・プロジェクト責任者"
      consulted: "専門家・ステークホルダー・監査・コンプライアンス"
      informed: "プロジェクトチーム・経営陣・ステークホルダー"

    release_decisions:
      responsible: "リリース委員会・プロダクトオーナー"
      accountable: "事業責任者・プロジェクト責任者"
      consulted: "品質責任者・運用責任者・セキュリティ責任者"
      informed: "全組織・ステークホルダー・顧客・パートナー"
```

---

**RACI表テンプレート集作成者**: プロセスエンジニアリングシステム ver3.2
**適用原則**: 明確責任・単一説明責任・関連相談・適切情報共有
**保証レベル**: 責任明確性・権限確実性・組織効率・品質保証確実性
**更新日**: 2025-07-09