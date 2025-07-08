# 7サブタスク標準定義

**バージョン**: 3.0.0  
**作成日**: 2025-07-01  
**理論分類**: タスク管理層  
**標準分類**: ファイル単位実行標準  

## 1. 7サブタスク標準概要

### 1.1 標準定義
7サブタスク標準は、**ファイル単位で実行する7つの標準サブタスクの詳細定義、入出力、品質基準、実行手順を体系化**し、全規模プロジェクトで統一的に適用可能な実行単位を提供する。

### 1.2 標準目的
```yaml
seven_subtask_standard_objectives:
  primary_purpose: "ファイル単位実行の標準化と品質保証"
  
  specific_goals:
    - execution_standardization: "実行標準化"
    - quality_consistency: "品質一貫性"
    - efficiency_optimization: "効率性最適化"
    - scalability_assurance: "拡張性保証"
    - maintainability_enhancement: "保守性向上"
```

### 1.3 適用範囲
```yaml
seven_subtask_application_scope:
  target_files:
    - source_code_files: "ソースコードファイル"
    - configuration_files: "設定ファイル"
    - documentation_files: "文書ファイル"
    - test_files: "テストファイル"
    - deployment_files: "デプロイファイル"
    - data_files: "データファイル"
  
  scale_coverage:
    - essential_level: "小規模プロジェクト"
    - standard_level: "中規模プロジェクト"
    - comprehensive_level: "大規模プロジェクト"
```

## 2. 7サブタスク標準定義

### 2.1 サブタスク1: 要件分析・設計確認
```yaml
subtask_1_requirement_design_verification:
  subtask_metadata:
    subtask_id: "ST1"
    subtask_name: "要件分析・設計確認"
    execution_order: 1
    mandatory: true
    estimated_duration: "10-30分"
  
  subtask_definition:
    purpose: "ファイル作成前の要件・設計確認"
    scope: "対象ファイルに関連する要件・設計の理解と確認"
    deliverable: "要件・設計確認チェックリスト"
  
  input_specifications:
    required_inputs:
      - functional_requirements: "機能要件"
      - technical_specifications: "技術仕様"
      - design_documents: "設計文書"
      - coding_standards: "コーディング標準"
      - quality_criteria: "品質基準"
    
    optional_inputs:
      - reference_implementations: "参考実装"
      - best_practices: "ベストプラクティス"
      - architectural_guidelines: "アーキテクチャガイドライン"
  
  execution_procedures:
    step_1_requirement_review:
      description: "要件レビュー"
      activities:
        - requirement_understanding: "要件理解"
        - acceptance_criteria_clarification: "受入基準明確化"
        - constraint_identification: "制約特定"
      quality_checkpoints:
        - requirement_completeness: "要件完全性100%"
        - understanding_clarity: "理解明確性100%"
    
    step_2_design_verification:
      description: "設計検証"
      activities:
        - design_document_review: "設計文書レビュー"
        - architecture_alignment_check: "アーキテクチャ整合性チェック"
        - interface_specification_review: "インターフェース仕様レビュー"
      quality_checkpoints:
        - design_consistency: "設計一貫性100%"
        - architecture_compliance: "アーキテクチャ準拠100%"
    
    step_3_implementation_planning:
      description: "実装計画"
      activities:
        - implementation_approach_definition: "実装アプローチ定義"
        - technology_selection: "技術選択"
        - quality_assurance_planning: "品質保証計画"
      quality_checkpoints:
        - approach_feasibility: "アプローチ実現可能性100%"
        - technology_appropriateness: "技術適切性100%"
  
  output_specifications:
    primary_outputs:
      - requirement_understanding_document: "要件理解文書"
      - design_verification_checklist: "設計検証チェックリスト"
      - implementation_plan: "実装計画"
    
    quality_artifacts:
      - verification_results: "検証結果"
      - compliance_confirmation: "準拠確認"
      - risk_assessment: "リスク評価"
  
  quality_criteria:
    completeness_criteria:
      - requirement_coverage: "要件カバレッジ100%"
      - design_verification_completeness: "設計検証完全性100%"
      - planning_adequacy: "計画妥当性100%"
    
    accuracy_criteria:
      - understanding_accuracy: "理解精度100%"
      - verification_validity: "検証妥当性100%"
      - plan_feasibility: "計画実現可能性100%"
```

### 2.2 サブタスク2: 実装・作成
```yaml
subtask_2_implementation_creation:
  subtask_metadata:
    subtask_id: "ST2"
    subtask_name: "実装・作成"
    execution_order: 2
    mandatory: true
    estimated_duration: "30分-4時間"
  
  subtask_definition:
    purpose: "要件・設計に基づくファイル実装・作成"
    scope: "設計仕様に従った高品質なファイル作成"
    deliverable: "実装済みファイル"
  
  input_specifications:
    required_inputs:
      - implementation_plan: "実装計画"
      - design_specifications: "設計仕様"
      - coding_standards: "コーディング標準"
      - quality_guidelines: "品質ガイドライン"
    
    reference_materials:
      - code_templates: "コードテンプレート"
      - style_guides: "スタイルガイド"
      - best_practice_examples: "ベストプラクティス例"
  
  execution_procedures:
    step_1_environment_setup:
      description: "環境設定"
      activities:
        - development_environment_preparation: "開発環境準備"
        - tool_configuration: "ツール設定"
        - dependency_setup: "依存関係設定"
      quality_checkpoints:
        - environment_readiness: "環境準備性100%"
        - tool_functionality: "ツール機能性100%"
    
    step_2_core_implementation:
      description: "核心実装"
      activities:
        - primary_functionality_implementation: "主要機能実装"
        - interface_implementation: "インターフェース実装"
        - error_handling_implementation: "エラーハンドリング実装"
      quality_checkpoints:
        - functionality_completeness: "機能完全性100%"
        - interface_compliance: "インターフェース準拠100%"
        - error_handling_robustness: "エラーハンドリング堅牢性100%"
    
    step_3_quality_implementation:
      description: "品質実装"
      activities:
        - code_quality_optimization: "コード品質最適化"
        - performance_optimization: "性能最適化"
        - security_implementation: "セキュリティ実装"
      quality_checkpoints:
        - code_quality_standards: "コード品質標準100%"
        - performance_requirements: "性能要件100%"
        - security_compliance: "セキュリティ準拠100%"
  
  output_specifications:
    primary_outputs:
      - implemented_file: "実装済みファイル"
      - implementation_documentation: "実装文書"
      - quality_metrics: "品質メトリクス"
    
    supporting_artifacts:
      - implementation_notes: "実装ノート"
      - decision_rationale: "判断根拠"
      - optimization_records: "最適化記録"
  
  quality_criteria:
    functional_criteria:
      - requirement_satisfaction: "要件満足度100%"
      - specification_compliance: "仕様準拠100%"
      - functionality_correctness: "機能正確性100%"
    
    non_functional_criteria:
      - code_quality_score: "コード品質スコア90点以上"
      - performance_efficiency: "性能効率95%以上"
      - maintainability_index: "保守性指数80以上"
```

### 2.3 サブタスク3: 単体テスト
```yaml
subtask_3_unit_testing:
  subtask_metadata:
    subtask_id: "ST3"
    subtask_name: "単体テスト"
    execution_order: 3
    mandatory: true
    estimated_duration: "20分-2時間"
  
  subtask_definition:
    purpose: "実装ファイルの単体レベル品質検証"
    scope: "ファイル単位での機能・品質テスト"
    deliverable: "単体テスト結果・レポート"
  
  input_specifications:
    required_inputs:
      - implemented_file: "実装済みファイル"
      - test_specifications: "テスト仕様"
      - test_data: "テストデータ"
      - quality_criteria: "品質基準"
    
    testing_resources:
      - test_frameworks: "テストフレームワーク"
      - mock_objects: "モックオブジェクト"
      - test_utilities: "テストユーティリティ"
  
  execution_procedures:
    step_1_test_preparation:
      description: "テスト準備"
      activities:
        - test_environment_setup: "テスト環境設定"
        - test_data_preparation: "テストデータ準備"
        - mock_object_creation: "モックオブジェクト作成"
      quality_checkpoints:
        - test_environment_readiness: "テスト環境準備性100%"
        - test_data_adequacy: "テストデータ妥当性100%"
    
    step_2_functional_testing:
      description: "機能テスト"
      activities:
        - positive_test_execution: "正常系テスト実行"
        - negative_test_execution: "異常系テスト実行"
        - boundary_test_execution: "境界値テスト実行"
      quality_checkpoints:
        - test_coverage: "テストカバレッジ90%以上"
        - test_pass_rate: "テスト合格率100%"
    
    step_3_quality_testing:
      description: "品質テスト"
      activities:
        - performance_testing: "性能テスト"
        - security_testing: "セキュリティテスト"
        - maintainability_testing: "保守性テスト"
      quality_checkpoints:
        - performance_compliance: "性能要件準拠100%"
        - security_validation: "セキュリティ検証100%"
  
  output_specifications:
    primary_outputs:
      - test_results: "テスト結果"
      - test_report: "テストレポート"
      - coverage_report: "カバレッジレポート"
    
    quality_evidence:
      - test_execution_logs: "テスト実行ログ"
      - defect_reports: "欠陥レポート"
      - quality_metrics: "品質メトリクス"
  
  quality_criteria:
    test_effectiveness:
      - test_coverage_threshold: "テストカバレッジ90%以上"
      - defect_detection_rate: "欠陥検出率95%以上"
      - test_automation_rate: "テスト自動化率80%以上"
    
    quality_validation:
      - functional_correctness: "機能正確性100%"
      - performance_compliance: "性能準拠100%"
      - security_validation: "セキュリティ検証100%"
```

### 2.4 サブタスク4: コードレビュー
```yaml
subtask_4_code_review:
  subtask_metadata:
    subtask_id: "ST4"
    subtask_name: "コードレビュー"
    execution_order: 4
    mandatory: true
    estimated_duration: "15分-1時間"
  
  subtask_definition:
    purpose: "実装品質の客観的評価・改善"
    scope: "コード品質・設計・保守性の包括的レビュー"
    deliverable: "コードレビュー結果・改善提案"
  
  input_specifications:
    required_inputs:
      - implemented_file: "実装済みファイル"
      - coding_standards: "コーディング標準"
      - review_checklist: "レビューチェックリスト"
      - quality_guidelines: "品質ガイドライン"
    
    review_resources:
      - static_analysis_tools: "静的解析ツール"
      - code_quality_metrics: "コード品質メトリクス"
      - best_practice_guidelines: "ベストプラクティスガイドライン"
  
  execution_procedures:
    step_1_automated_review:
      description: "自動レビュー"
      activities:
        - static_analysis_execution: "静的解析実行"
        - coding_standard_verification: "コーディング標準検証"
        - quality_metrics_calculation: "品質メトリクス計算"
      quality_checkpoints:
        - analysis_completeness: "解析完全性100%"
        - standard_compliance: "標準準拠100%"
    
    step_2_manual_review:
      description: "手動レビュー"
      activities:
        - design_quality_assessment: "設計品質評価"
        - logic_correctness_verification: "ロジック正確性検証"
        - maintainability_evaluation: "保守性評価"
      quality_checkpoints:
        - design_appropriateness: "設計適切性100%"
        - logic_soundness: "ロジック健全性100%"
    
    step_3_improvement_identification:
      description: "改善特定"
      activities:
        - improvement_opportunity_identification: "改善機会特定"
        - refactoring_recommendation: "リファクタリング推奨"
        - optimization_suggestion: "最適化提案"
      quality_checkpoints:
        - improvement_validity: "改善妥当性100%"
        - recommendation_feasibility: "推奨実現可能性100%"
  
  output_specifications:
    primary_outputs:
      - review_results: "レビュー結果"
      - improvement_recommendations: "改善推奨事項"
      - quality_assessment: "品質評価"
    
    supporting_artifacts:
      - review_checklist_results: "レビューチェックリスト結果"
      - static_analysis_report: "静的解析レポート"
      - metrics_report: "メトリクスレポート"
  
  quality_criteria:
    review_thoroughness:
      - checklist_completion: "チェックリスト完了100%"
      - coverage_completeness: "カバレッジ完全性100%"
      - analysis_depth: "分析深度95%以上"
    
    improvement_quality:
      - recommendation_relevance: "推奨関連性100%"
      - improvement_impact: "改善インパクト90%以上"
      - feasibility_assessment: "実現可能性評価100%"
```

### 2.5 サブタスク5: 統合テスト
```yaml
subtask_5_integration_testing:
  subtask_metadata:
    subtask_id: "ST5"
    subtask_name: "統合テスト"
    execution_order: 5
    mandatory: true
    estimated_duration: "20分-1.5時間"
  
  subtask_definition:
    purpose: "ファイル統合時の相互作用・整合性検証"
    scope: "他ファイル・システムとの統合品質確認"
    deliverable: "統合テスト結果・統合品質レポート"
  
  input_specifications:
    required_inputs:
      - implemented_file: "実装済みファイル"
      - integration_specifications: "統合仕様"
      - interface_contracts: "インターフェース契約"
      - integration_test_cases: "統合テストケース"
    
    integration_resources:
      - test_environment: "テスト環境"
      - integration_tools: "統合ツール"
      - monitoring_tools: "監視ツール"
  
  execution_procedures:
    step_1_integration_preparation:
      description: "統合準備"
      activities:
        - integration_environment_setup: "統合環境設定"
        - dependency_verification: "依存関係検証"
        - interface_validation: "インターフェース検証"
      quality_checkpoints:
        - environment_consistency: "環境一貫性100%"
        - dependency_resolution: "依存関係解決100%"
    
    step_2_interface_testing:
      description: "インターフェーステスト"
      activities:
        - api_contract_testing: "API契約テスト"
        - data_exchange_testing: "データ交換テスト"
        - protocol_compliance_testing: "プロトコル準拠テスト"
      quality_checkpoints:
        - contract_compliance: "契約準拠100%"
        - data_integrity: "データ整合性100%"
    
    step_3_end_to_end_testing:
      description: "エンドツーエンドテスト"
      activities:
        - workflow_testing: "ワークフローテスト"
        - scenario_testing: "シナリオテスト"
        - performance_testing: "性能テスト"
      quality_checkpoints:
        - workflow_correctness: "ワークフロー正確性100%"
        - scenario_coverage: "シナリオカバレッジ100%"
  
  output_specifications:
    primary_outputs:
      - integration_test_results: "統合テスト結果"
      - integration_quality_report: "統合品質レポート"
      - interface_validation_results: "インターフェース検証結果"
    
    quality_evidence:
      - test_execution_logs: "テスト実行ログ"
      - performance_metrics: "性能メトリクス"
      - error_analysis: "エラー分析"
  
  quality_criteria:
    integration_quality:
      - interface_compliance: "インターフェース準拠100%"
      - data_consistency: "データ一貫性100%"
      - workflow_integrity: "ワークフロー整合性100%"
    
    performance_quality:
      - response_time_compliance: "応答時間準拠100%"
      - throughput_requirements: "スループット要件100%"
      - resource_utilization: "リソース利用効率95%以上"
```

### 2.6 サブタスク6: 文書化
```yaml
subtask_6_documentation:
  subtask_metadata:
    subtask_id: "ST6"
    subtask_name: "文書化"
    execution_order: 6
    mandatory: true
    estimated_duration: "15分-45分"
  
  subtask_definition:
    purpose: "実装・テスト結果の包括的文書化"
    scope: "技術文書・ユーザー文書・保守文書の作成"
    deliverable: "完全文書パッケージ"
  
  input_specifications:
    required_inputs:
      - implemented_file: "実装済みファイル"
      - test_results: "テスト結果"
      - review_results: "レビュー結果"
      - documentation_standards: "文書化標準"
    
    documentation_resources:
      - documentation_templates: "文書テンプレート"
      - style_guides: "スタイルガイド"
      - documentation_tools: "文書化ツール"
  
  execution_procedures:
    step_1_technical_documentation:
      description: "技術文書作成"
      activities:
        - api_documentation_creation: "API文書作成"
        - code_comment_enhancement: "コードコメント強化"
        - architecture_documentation: "アーキテクチャ文書化"
      quality_checkpoints:
        - documentation_completeness: "文書完全性100%"
        - technical_accuracy: "技術正確性100%"
    
    step_2_user_documentation:
      description: "ユーザー文書作成"
      activities:
        - usage_guide_creation: "使用ガイド作成"
        - example_documentation: "例文書化"
        - troubleshooting_guide: "トラブルシューティングガイド"
      quality_checkpoints:
        - user_friendliness: "ユーザーフレンドリー性100%"
        - clarity_assessment: "明確性評価95%以上"
    
    step_3_maintenance_documentation:
      description: "保守文書作成"
      activities:
        - maintenance_guide_creation: "保守ガイド作成"
        - deployment_documentation: "デプロイ文書化"
        - configuration_documentation: "設定文書化"
      quality_checkpoints:
        - maintenance_adequacy: "保守妥当性100%"
        - operational_clarity: "運用明確性100%"
  
  output_specifications:
    primary_outputs:
      - technical_documentation: "技術文書"
      - user_documentation: "ユーザー文書"
      - maintenance_documentation: "保守文書"
    
    supporting_artifacts:
      - documentation_index: "文書インデックス"
      - version_history: "バージョン履歴"
      - cross_references: "相互参照"
  
  quality_criteria:
    documentation_quality:
      - completeness_score: "完全性スコア95%以上"
      - accuracy_verification: "正確性検証100%"
      - usability_assessment: "使いやすさ評価90%以上"
    
    maintenance_support:
      - maintainability_support: "保守性サポート100%"
      - operational_guidance: "運用ガイダンス100%"
      - troubleshooting_coverage: "トラブルシューティングカバレッジ95%以上"
```

### 2.7 サブタスク7: 品質確認・承認
```yaml
subtask_7_quality_confirmation_approval:
  subtask_metadata:
    subtask_id: "ST7"
    subtask_name: "品質確認・承認"
    execution_order: 7
    mandatory: true
    estimated_duration: "10分-30分"
  
  subtask_definition:
    purpose: "最終品質確認と正式承認"
    scope: "全サブタスク結果の統合品質評価・承認"
    deliverable: "品質確認レポート・承認記録"
  
  input_specifications:
    required_inputs:
      - all_subtask_outputs: "全サブタスク出力"
      - quality_standards: "品質標準"
      - acceptance_criteria: "受入基準"
      - approval_requirements: "承認要件"
    
    validation_resources:
      - quality_checklists: "品質チェックリスト"
      - validation_tools: "検証ツール"
      - approval_workflows: "承認ワークフロー"
  
  execution_procedures:
    step_1_comprehensive_quality_check:
      description: "包括的品質チェック"
      activities:
        - output_completeness_verification: "出力完全性検証"
        - quality_standard_compliance: "品質標準準拠"
        - acceptance_criteria_validation: "受入基準検証"
      quality_checkpoints:
        - completeness_confirmation: "完全性確認100%"
        - standard_compliance: "標準準拠100%"
    
    step_2_stakeholder_review:
      description: "ステークホルダーレビュー"
      activities:
        - technical_review: "技術レビュー"
        - business_review: "ビジネスレビュー"
        - quality_assessment: "品質評価"
      quality_checkpoints:
        - stakeholder_satisfaction: "ステークホルダー満足度95%以上"
        - review_completeness: "レビュー完全性100%"
    
    step_3_formal_approval:
      description: "正式承認"
      activities:
        - approval_documentation: "承認文書化"
        - sign_off_completion: "サインオフ完了"
        - release_authorization: "リリース承認"
      quality_checkpoints:
        - approval_validity: "承認妥当性100%"
        - authorization_completeness: "承認完全性100%"
  
  output_specifications:
    primary_outputs:
      - quality_confirmation_report: "品質確認レポート"
      - approval_record: "承認記録"
      - release_authorization: "リリース承認"
    
    compliance_artifacts:
      - compliance_verification: "コンプライアンス検証"
      - audit_trail: "監査証跡"
      - quality_metrics_summary: "品質メトリクスサマリー"
  
  quality_criteria:
    final_quality_assurance:
      - overall_quality_score: "総合品質スコア95点以上"
      - compliance_rate: "準拠率100%"
      - stakeholder_approval_rate: "ステークホルダー承認率100%"
    
    release_readiness:
      - production_readiness: "本番準備性100%"
      - quality_assurance_completeness: "品質保証完全性100%"
      - approval_documentation_adequacy: "承認文書妥当性100%"
```

## 3. 規模別調整ルール

### 3.1 Essential レベル調整
```yaml
essential_level_adjustments:
  subtask_simplification:
    execution_time_reduction: "実行時間50%削減"
    documentation_scope_reduction: "文書化スコープ削減"
    review_depth_adjustment: "レビュー深度調整"
    testing_scope_optimization: "テストスコープ最適化"
  
  quality_maintenance:
    core_quality_preserved: "核心品質保持100%"
    essential_testing_coverage: "必須テストカバレッジ80%以上"
    basic_documentation_completeness: "基本文書化完全性100%"
    simplified_approval_process: "簡素化承認プロセス100%"
```

### 3.2 Standard レベル調整
```yaml
standard_level_adjustments:
  subtask_enhancement:
    comprehensive_execution: "包括的実行"
    detailed_documentation: "詳細文書化"
    thorough_review_process: "徹底的レビュープロセス"
    extensive_testing_coverage: "広範囲テストカバレッジ"
  
  quality_standards:
    full_quality_application: "完全品質適用100%"
    comprehensive_testing_coverage: "包括的テストカバレッジ90%以上"
    detailed_documentation_completeness: "詳細文書化完全性100%"
    formal_approval_process: "正式承認プロセス100%"
```

### 3.3 Comprehensive レベル調整
```yaml
comprehensive_level_adjustments:
  subtask_maximization:
    exhaustive_execution: "網羅的実行"
    enterprise_documentation: "エンタープライズ文書化"
    rigorous_review_process: "厳格レビュープロセス"
    maximum_testing_coverage: "最大テストカバレッジ"
  
  quality_excellence:
    enterprise_quality_application: "エンタープライズ品質適用100%"
    maximum_testing_coverage: "最大テストカバレッジ95%以上"
    enterprise_documentation_completeness: "エンタープライズ文書化完全性100%"
    enterprise_approval_process: "エンタープライズ承認プロセス100%"
```

---

**7サブタスク標準定義者**: プロセスエンジニアリングシステム ver3  
**標準品質レベル**: 最高（全規模統一）  
**適用範囲**: 全規模・全技術・全チーム  
**実行効率**: ファイル単位最適化  
**更新日**: 2025-07-01
