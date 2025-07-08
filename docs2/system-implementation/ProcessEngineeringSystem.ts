/**
 * プロセスエンジニアリング理論効率化システム
 * 全体システムの統合・調整を行うメインクラス
 */

import { ProjectAnalysisEngine, ProjectProfile, ProjectAnalysisInput } from './ProjectAnalysisEngine';
import { TheorySelectionEngine, TheorySelection, ProcessPhase } from './TheorySelectionEngine';
import { ProgressiveLoader, LoadedTheory, TaskContext, LoadingUrgency } from './ProgressiveLoader';

export interface SystemConfiguration {
  maxTokensBudget: number;        // 最大トークン予算
  autoOptimization: boolean;      // 自動最適化有効
  cachingEnabled: boolean;        // キャッシュ機能有効
  statisticsTracking: boolean;    // 統計追跡有効
  fallbackStrategy: FallbackStrategy; // フォールバック戦略
}

export interface ProcessEngineeringRequest {
  projectPath: string;           // プロジェクトパス
  phase: ProcessPhase;          // 現在のフェーズ
  taskType?: string;            // タスクタイプ
  teamSize?: number;            // チーム規模
  deadline?: Date;              // 期限
  customComplexity?: number;    // カスタム複雑度
  urgency?: LoadingUrgency;     // 緊急度
  forceInclude?: string[];      // 強制含有理論
  exclude?: string[];           // 除外理論
}

export interface ProcessEngineeringResponse {
  profile: ProjectProfile;       // プロジェクト分析結果
  selection: TheorySelection;    // 理論選択結果
  loadedTheory: LoadedTheory;    // ロード済み理論
  recommendations: Recommendation[]; // 推奨事項
  optimizationSuggestions: OptimizationSuggestion[]; // 最適化提案
  executionPlan: ExecutionPlan;  // 実行計画
  metadata: SystemMetadata;      // システムメタデータ
}

export interface Recommendation {
  type: RecommendationType;
  priority: Priority;
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: number;       // 1-5スケール
}

export interface OptimizationSuggestion {
  category: OptimizationCategory;
  suggestion: string;
  potentialSaving: number;       // トークン節約量
  implementationEffort: ImplementationEffort;
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  estimatedDuration: number;     // 分
  resourceRequirements: ResourceRequirement[];
  riskFactors: RiskFactor[];
}

export interface ExecutionPhase {
  name: string;
  description: string;
  theories: string[];
  estimatedTime: number;
  dependencies: string[];
}

export interface ResourceRequirement {
  type: ResourceType;
  amount: number;
  unit: string;
  description: string;
}

export interface RiskFactor {
  factor: string;
  probability: number;           // 0-1
  impact: number;               // 1-5
  mitigation: string;
}

export interface SystemMetadata {
  version: string;
  timestamp: string;
  processingTime: number;
  tokenUsage: TokenUsage;
  systemHealth: SystemHealth;
}

export interface TokenUsage {
  total: number;
  breakdown: { [category: string]: number };
  efficiency: number;
}

export interface SystemHealth {
  status: HealthStatus;
  issues: string[];
  performance: PerformanceMetrics;
}

export interface PerformanceMetrics {
  analysisTime: number;
  selectionTime: number;
  loadingTime: number;
  cacheHitRate: number;
}

export enum FallbackStrategy {
  MINIMAL = "MINIMAL",
  CONSERVATIVE = "CONSERVATIVE",
  AGGRESSIVE = "AGGRESSIVE"
}

export enum RecommendationType {
  PROCESS_IMPROVEMENT = "PROCESS_IMPROVEMENT",
  TOOL_USAGE = "TOOL_USAGE",
  TEAM_COLLABORATION = "TEAM_COLLABORATION",
  QUALITY_ASSURANCE = "QUALITY_ASSURANCE"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum OptimizationCategory {
  TOKEN_EFFICIENCY = "TOKEN_EFFICIENCY",
  LOADING_PERFORMANCE = "LOADING_PERFORMANCE",
  CACHE_OPTIMIZATION = "CACHE_OPTIMIZATION",
  THEORY_SELECTION = "THEORY_SELECTION"
}

export enum ImplementationEffort {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum ResourceType {
  COMPUTE = "COMPUTE",
  MEMORY = "MEMORY",
  STORAGE = "STORAGE",
  NETWORK = "NETWORK"
}

export enum HealthStatus {
  HEALTHY = "HEALTHY",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export class ProcessEngineeringSystem {
  private projectAnalyzer: ProjectAnalysisEngine;
  private theorySelector: TheorySelectionEngine;
  private progressiveLoader: ProgressiveLoader;
  private configuration: SystemConfiguration;
  private performanceMetrics: PerformanceMetrics;

  constructor(
    mcpTools: any,
    theoryIndex: any,
    configuration: Partial<SystemConfiguration> = {}
  ) {
    // デフォルト設定
    this.configuration = {
      maxTokensBudget: 15000,
      autoOptimization: true,
      cachingEnabled: true,
      statisticsTracking: true,
      fallbackStrategy: FallbackStrategy.CONSERVATIVE,
      ...configuration
    };

    // コンポーネント初期化
    this.projectAnalyzer = new ProjectAnalysisEngine(mcpTools.fileSystem);
    this.theorySelector = new TheorySelectionEngine(theoryIndex);
    this.progressiveLoader = new ProgressiveLoader(mcpTools.memory, mcpTools.fileSystem);

    // パフォーマンスメトリクス初期化
    this.performanceMetrics = {
      analysisTime: 0,
      selectionTime: 0,
      loadingTime: 0,
      cacheHitRate: 0
    };
  }

  /**
   * メイン処理: プロセスエンジニアリング理論の効率的適用
   */
  async processRequest(request: ProcessEngineeringRequest): Promise<ProcessEngineeringResponse> {
    const startTime = Date.now();

    try {
      // フェーズ1: プロジェクト分析
      const analysisStart = Date.now();
      const profile = await this.analyzeProject(request);
      this.performanceMetrics.analysisTime = Date.now() - analysisStart;

      // フェーズ2: 理論選択
      const selectionStart = Date.now();
      const selection = await this.selectTheories(profile, request);
      this.performanceMetrics.selectionTime = Date.now() - selectionStart;

      // フェーズ3: 段階的ロード
      const loadingStart = Date.now();
      const loadedTheory = await this.loadTheories(selection, request);
      this.performanceMetrics.loadingTime = Date.now() - loadingStart;

      // フェーズ4: 推奨事項生成
      const recommendations = this.generateRecommendations(profile, selection, loadedTheory);

      // フェーズ5: 最適化提案
      const optimizationSuggestions = this.generateOptimizationSuggestions(
        profile, selection, loadedTheory
      );

      // フェーズ6: 実行計画作成
      const executionPlan = this.createExecutionPlan(profile, selection, loadedTheory);

      // フェーズ7: システムメタデータ生成
      const metadata = this.generateSystemMetadata(startTime);

      return {
        profile,
        selection,
        loadedTheory,
        recommendations,
        optimizationSuggestions,
        executionPlan,
        metadata
      };

    } catch (error) {
      throw new ProcessEngineeringSystemError(`システム処理に失敗しました: ${error.message}`);
    }
  }

  /**
   * プロジェクト分析
   */
  private async analyzeProject(request: ProcessEngineeringRequest): Promise<ProjectProfile> {
    const analysisInput: ProjectAnalysisInput = {
      projectPath: request.projectPath,
      teamSize: request.teamSize,
      deadline: request.deadline,
      customComplexity: request.customComplexity
    };

    return await this.projectAnalyzer.analyzeProject(analysisInput);
  }

  /**
   * 理論選択
   */
  private async selectTheories(
    profile: ProjectProfile, 
    request: ProcessEngineeringRequest
  ): Promise<TheorySelection> {
    return this.theorySelector.selectOptimalTheory(
      profile,
      request.phase,
      {
        maxTokens: this.configuration.maxTokensBudget,
        forceInclude: request.forceInclude,
        exclude: request.exclude
      }
    );
  }

  /**
   * 理論ロード
   */
  private async loadTheories(
    selection: TheorySelection,
    request: ProcessEngineeringRequest
  ): Promise<LoadedTheory> {
    const taskContext: TaskContext = {
      currentStep: request.phase,
      taskType: request.taskType || 'general',
      complexity: this.mapRiskToComplexity(selection),
      timeConstraint: !!request.deadline
    };

    return await this.progressiveLoader.loadTheoryProgressive(
      selection,
      taskContext,
      request.urgency || LoadingUrgency.NORMAL
    );
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(
    profile: ProjectProfile,
    selection: TheorySelection,
    loadedTheory: LoadedTheory
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // プロジェクト規模に基づく推奨事項
    if (profile.scale === 'LARGE') {
      recommendations.push({
        type: RecommendationType.PROCESS_IMPROVEMENT,
        priority: Priority.HIGH,
        title: "大規模プロジェクト管理の強化",
        description: "実装フェーズ単位管理とカテゴリ設計の活用を推奨",
        actionItems: [
          "カテゴリ設計ガイドの詳細確認",
          "進捗管理システムの導入",
          "品質ゲートの厳格な運用"
        ],
        estimatedImpact: 4
      });
    }

    // リスクレベルに基づく推奨事項
    if (profile.riskLevel === 'HIGH') {
      recommendations.push({
        type: RecommendationType.QUALITY_ASSURANCE,
        priority: Priority.CRITICAL,
        title: "高リスクプロジェクトの品質管理強化",
        description: "全品質ゲートの実行と継続的監視が必要",
        actionItems: [
          "品質原則の徹底理解",
          "リスク管理プロセスの確立",
          "定期的な品質レビューの実施"
        ],
        estimatedImpact: 5
      });
    }

    // 理論選択に基づく推奨事項
    const coreTheoryCount = loadedTheory.core.length;
    if (coreTheoryCount < 2) {
      recommendations.push({
        type: RecommendationType.TOOL_USAGE,
        priority: Priority.MEDIUM,
        title: "核心理論の理解強化",
        description: "プロセスエンジニアリングの基本原則の習得が推奨",
        actionItems: [
          "プロセス本質の詳細学習",
          "品質原則の実践的適用",
          "タスク基本原則の活用"
        ],
        estimatedImpact: 3
      });
    }

    return recommendations;
  }

  /**
   * 最適化提案生成
   */
  private generateOptimizationSuggestions(
    profile: ProjectProfile,
    selection: TheorySelection,
    loadedTheory: LoadedTheory
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // トークン効率の最適化
    if (selection.estimatedTokens > this.configuration.maxTokensBudget * 0.8) {
      suggestions.push({
        category: OptimizationCategory.TOKEN_EFFICIENCY,
        suggestion: "選択的展開レベルの調整により、トークン使用量を削減",
        potentialSaving: Math.floor(selection.estimatedTokens * 0.2),
        implementationEffort: ImplementationEffort.LOW
      });
    }

    // キャッシュ最適化
    const cacheStats = this.progressiveLoader.getLoadingStatistics();
    if (cacheStats.cacheSize < 10) {
      suggestions.push({
        category: OptimizationCategory.CACHE_OPTIMIZATION,
        suggestion: "よく使用される理論のプリロードによる応答性向上",
        potentialSaving: 0,
        implementationEffort: ImplementationEffort.MEDIUM
      });
    }

    // 理論選択の最適化
    if (selection.theories.length > 5) {
      suggestions.push({
        category: OptimizationCategory.THEORY_SELECTION,
        suggestion: "フェーズ特化型理論選択による精度向上",
        potentialSaving: Math.floor(selection.estimatedTokens * 0.15),
        implementationEffort: ImplementationEffort.HIGH
      });
    }

    return suggestions;
  }

  /**
   * 実行計画作成
   */
  private createExecutionPlan(
    profile: ProjectProfile,
    selection: TheorySelection,
    loadedTheory: LoadedTheory
  ): ExecutionPlan {
    const phases: ExecutionPhase[] = [];

    // フェーズ1: 基盤理解
    phases.push({
      name: "基盤理解フェーズ",
      description: "核心理論の理解と適用準備",
      theories: loadedTheory.core.map(t => t.id),
      estimatedTime: 30,
      dependencies: []
    });

    // フェーズ2: 実装準備
    if (loadedTheory.guides) {
      phases.push({
        name: "実装準備フェーズ",
        description: "実装ガイドの確認と計画策定",
        theories: [], // 条件付きロードのため空
        estimatedTime: 45,
        dependencies: ["基盤理解フェーズ"]
      });
    }

    // フェーズ3: 実装実行
    phases.push({
      name: "実装実行フェーズ",
      description: "理論に基づく実装の実行",
      theories: selection.theories.map(t => t.id),
      estimatedTime: this.estimateImplementationTime(profile),
      dependencies: phases.map(p => p.name)
    });

    const totalDuration = phases.reduce((sum, phase) => sum + phase.estimatedTime, 0);

    return {
      phases,
      estimatedDuration: totalDuration,
      resourceRequirements: this.calculateResourceRequirements(profile, selection),
      riskFactors: this.identifyRiskFactors(profile, selection)
    };
  }

  /**
   * システムメタデータ生成
   */
  private generateSystemMetadata(startTime: number): SystemMetadata {
    const processingTime = Date.now() - startTime;
    
    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      processingTime,
      tokenUsage: this.calculateTokenUsage(),
      systemHealth: this.assessSystemHealth()
    };
  }

  /**
   * ユーティリティメソッド
   */
  private mapRiskToComplexity(selection: TheorySelection): string {
    if (selection.estimatedTokens > 10000) return 'high';
    if (selection.estimatedTokens > 5000) return 'medium';
    return 'low';
  }

  private estimateImplementationTime(profile: ProjectProfile): number {
    const baseTime = 120; // 2時間
    const scaleMultiplier = profile.scale === 'LARGE' ? 2 : profile.scale === 'MEDIUM' ? 1.5 : 1;
    const complexityMultiplier = profile.riskLevel === 'HIGH' ? 1.5 : 1;
    
    return Math.floor(baseTime * scaleMultiplier * complexityMultiplier);
  }

  private calculateResourceRequirements(
    profile: ProjectProfile,
    selection: TheorySelection
  ): ResourceRequirement[] {
    return [
      {
        type: ResourceType.COMPUTE,
        amount: selection.estimatedTokens,
        unit: "tokens",
        description: "理論処理に必要なトークン数"
      },
      {
        type: ResourceType.MEMORY,
        amount: Math.floor(selection.estimatedTokens / 100),
        unit: "MB",
        description: "理論キャッシュに必要なメモリ"
      }
    ];
  }

  private identifyRiskFactors(
    profile: ProjectProfile,
    selection: TheorySelection
  ): RiskFactor[] {
    const risks: RiskFactor[] = [];

    if (profile.riskLevel === 'HIGH') {
      risks.push({
        factor: "高複雑度プロジェクト",
        probability: 0.7,
        impact: 4,
        mitigation: "段階的実装と継続的レビューの実施"
      });
    }

    if (selection.estimatedTokens > this.configuration.maxTokensBudget * 0.9) {
      risks.push({
        factor: "トークン使用量上限接近",
        probability: 0.8,
        impact: 3,
        mitigation: "選択的展開とオンデマンドロードの活用"
      });
    }

    return risks;
  }

  private calculateTokenUsage(): TokenUsage {
    const cacheStats = this.progressiveLoader.getLoadingStatistics();
    
    return {
      total: cacheStats.totalTokensInCache,
      breakdown: {
        core: Math.floor(cacheStats.totalTokensInCache * 0.4),
        guide: Math.floor(cacheStats.totalTokensInCache * 0.4),
        detailed: Math.floor(cacheStats.totalTokensInCache * 0.2)
      },
      efficiency: cacheStats.totalTokensInCache / this.configuration.maxTokensBudget
    };
  }

  private assessSystemHealth(): SystemHealth {
    const issues: string[] = [];
    let status = HealthStatus.HEALTHY;

    // パフォーマンスチェック
    if (this.performanceMetrics.analysisTime > 5000) {
      issues.push("プロジェクト分析の処理時間が長い");
      status = HealthStatus.WARNING;
    }

    if (this.performanceMetrics.loadingTime > 3000) {
      issues.push("理論ロードの処理時間が長い");
      status = HealthStatus.WARNING;
    }

    return {
      status,
      issues,
      performance: this.performanceMetrics
    };
  }

  /**
   * 設定更新
   */
  updateConfiguration(newConfig: Partial<SystemConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };
  }

  /**
   * システム統計取得
   */
  getSystemStatistics(): any {
    return {
      configuration: this.configuration,
      performanceMetrics: this.performanceMetrics,
      loaderStatistics: this.progressiveLoader.getLoadingStatistics()
    };
  }
}

export class ProcessEngineeringSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessEngineeringSystemError';
  }
}

// 使用例
/*
const system = new ProcessEngineeringSystem(mcpTools, theoryIndex, {
  maxTokensBudget: 10000,
  autoOptimization: true,
  cachingEnabled: true
});

const response = await system.processRequest({
  projectPath: "./my-project",
  phase: ProcessPhase.STEP_2_SYSTEM_DESIGN,
  taskType: "architecture_design",
  teamSize: 5,
  urgency: LoadingUrgency.HIGH
});

console.log("プロジェクト分析:", response.profile);
console.log("選択理論:", response.selection.theories.map(t => t.id));
console.log("推奨事項:", response.recommendations);
console.log("実行計画:", response.executionPlan);
*/
