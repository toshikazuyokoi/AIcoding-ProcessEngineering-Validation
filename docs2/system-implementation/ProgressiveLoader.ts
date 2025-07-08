/**
 * 段階的ローダー
 * 選択された理論要素を適切なタイミングで段階的にロード
 */

import { Theory as BaseTheory, TheorySelection, LoadingStrategy } from './TheorySelectionEngine';

// コンテンツを含む拡張Theory型
export interface Theory extends BaseTheory {
  content?: string;
}

export interface LoadingInput {
  selection: TheorySelection;  // 理論選択結果
  context: TaskContext;       // タスクコンテキスト
  urgency: LoadingUrgency;    // 緊急度
}

export interface TaskContext {
  currentStep: string;        // 現在のSTEP
  taskType: string;          // タスクタイプ
  complexity: string;        // 複雑度
  timeConstraint: boolean;   // 時間制約あり
}

export interface LoadedTheory {
  core: Theory[];             // 即座ロード済み理論
  guides: ConditionalLoader;  // 条件付きローダー
  details: OnDemandLoader;    // オンデマンドローダー
  totalTokens: number;        // 現在ロード済みトークン数
  loadingHistory: LoadHistory[]; // ロード履歴
}

export interface LoadHistory {
  timestamp: string;
  action: LoadAction;
  theoryId: string;
  tokens: number;
  reason: string;
}

export interface LoadCriteria {
  complexity?: string;
  taskType?: string;
  urgency?: LoadingUrgency;
  maxTokens?: number;
}

export interface OnDemandRequest {
  topic: string;
  level: DetailLevel;
  urgency: LoadingUrgency;
  context?: any;
}

export enum LoadingUrgency {
  LOW = "LOW",
  NORMAL = "NORMAL", 
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum LoadAction {
  LOAD_CORE = "LOAD_CORE",
  LOAD_GUIDE = "LOAD_GUIDE",
  LOAD_DETAIL = "LOAD_DETAIL",
  UNLOAD = "UNLOAD",
  CACHE = "CACHE"
}

export enum DetailLevel {
  BASIC = "BASIC",
  STANDARD = "STANDARD",
  DETAILED = "DETAILED",
  COMPREHENSIVE = "COMPREHENSIVE"
}

export interface ConditionalLoader {
  loadWhenNeeded(criteria: LoadCriteria): Promise<Theory[]>;
  checkConditions(criteria: LoadCriteria): boolean;
  getAvailableTheories(): Theory[];
}

export interface OnDemandLoader {
  loadOnDemand(request: OnDemandRequest): Promise<Theory[]>;
  preloadCache(theories: Theory[]): Promise<void>;
  clearCache(): void;
}

export class ProgressiveLoader {
  private mcpMemoryTools: any; // MCPメモリサーバーへの参照
  private fileSystemTools: any; // MCPファイルシステムツールへの参照
  private cache: Map<string, Theory> = new Map();
  private loadingHistory: LoadHistory[] = [];
  private readonly MAX_CACHE_SIZE = 50; // 最大キャッシュサイズ

  constructor(mcpMemoryTools: any, fileSystemTools: any) {
    this.mcpMemoryTools = mcpMemoryTools;
    this.fileSystemTools = fileSystemTools;
  }

  /**
   * 段階的理論ロード
   */
  async loadTheoryProgressive(
    selection: TheorySelection,
    context: TaskContext,
    urgency: LoadingUrgency = LoadingUrgency.NORMAL
  ): Promise<LoadedTheory> {
    try {
      // フェーズ1: 核心理論の即座ロード
      const coreTheories = await this.loadImmediate(
        selection.theories.filter(t => t.category === 'core')
      );

      // フェーズ2: 実装ガイドの条件付きローダー作成
      const guideLoader = this.createConditionalLoader(
        selection.theories.filter(t => t.category === 'guide'),
        context
      );

      // フェーズ3: 詳細仕様のオンデマンドローダー作成
      const detailLoader = this.createOnDemandLoader(
        selection.theories.filter(t => t.category === 'detailed'),
        context
      );

      const totalTokens = this.calculateLoadedTokens(coreTheories);

      return {
        core: coreTheories,
        guides: guideLoader,
        details: detailLoader,
        totalTokens,
        loadingHistory: [...this.loadingHistory]
      };
    } catch (error) {
      throw new ProgressiveLoadingError(`段階的ロードに失敗しました: ${error.message}`);
    }
  }

  /**
   * 即座ロード（核心理論）
   */
  private async loadImmediate(theories: Theory[]): Promise<Theory[]> {
    const loadedTheories: Theory[] = [];

    for (const theory of theories) {
      try {
        // キャッシュから確認
        if (this.cache.has(theory.id)) {
          const cachedTheory = this.cache.get(theory.id)!;
          loadedTheories.push(cachedTheory);
          this.recordLoadHistory(LoadAction.LOAD_CORE, theory.id, theory.estimatedTokens, "キャッシュから取得");
          continue;
        }

        // ファイルから読み込み
        const content = await this.loadTheoryContent(theory);
        const loadedTheory = { ...theory, content };
        
        loadedTheories.push(loadedTheory);
        this.cache.set(theory.id, loadedTheory);
        this.recordLoadHistory(LoadAction.LOAD_CORE, theory.id, theory.estimatedTokens, "ファイルから読み込み");

        // MCPメモリに保存
        await this.saveToMemory(loadedTheory);

      } catch (error) {
        console.warn(`理論 ${theory.id} の読み込みに失敗: ${error.message}`);
        // フォールバック: 基本情報のみの理論オブジェクトを作成
        const fallbackTheory = this.createFallbackTheory(theory);
        loadedTheories.push(fallbackTheory);
      }
    }

    return loadedTheories;
  }

  /**
   * 条件付きローダーを作成
   */
  private createConditionalLoader(theories: Theory[], context: TaskContext): ConditionalLoader {
    return {
      loadWhenNeeded: async (criteria: LoadCriteria): Promise<Theory[]> => {
        const relevantTheories = theories.filter(theory => 
          this.matchesCriteria(theory, criteria, context) &&
          this.hasCapacity(theory.estimatedTokens, criteria.maxTokens)
        );

        if (relevantTheories.length > 0) {
          return this.loadTheories(relevantTheories, LoadAction.LOAD_GUIDE);
        }

        // フォールバック: より軽量な代替理論を探す
        return this.loadFallback(criteria, context);
      },

      checkConditions: (criteria: LoadCriteria): boolean => {
        return theories.some(theory => 
          this.matchesCriteria(theory, criteria, context)
        );
      },

      getAvailableTheories: (): Theory[] => {
        return [...theories];
      }
    };
  }

  /**
   * オンデマンドローダーを作成
   */
  private createOnDemandLoader(theories: Theory[], context: TaskContext): OnDemandLoader {
    return {
      loadOnDemand: async (request: OnDemandRequest): Promise<Theory[]> => {
        // トピックに関連する理論を検索
        const relevantTheories = await this.searchRelevantTheories(request.topic, theories);
        
        // 詳細レベルに応じてフィルタリング
        const filteredTheories = this.filterByDetailLevel(relevantTheories, request.level);
        
        // 緊急度に応じて優先順位付け
        const prioritizedTheories = this.prioritizeByUrgency(filteredTheories, request.urgency);

        return this.loadTheories(prioritizedTheories, LoadAction.LOAD_DETAIL);
      },

      preloadCache: async (theories: Theory[]): Promise<void> => {
        for (const theory of theories.slice(0, 5)) { // 最大5つまでプリロード
          if (!this.cache.has(theory.id)) {
            try {
              const content = await this.loadTheoryContent(theory);
              this.cache.set(theory.id, { ...theory, content });
              this.recordLoadHistory(LoadAction.CACHE, theory.id, theory.estimatedTokens, "プリロード");
            } catch (error) {
              console.warn(`プリロード失敗: ${theory.id}`);
            }
          }
        }
      },

      clearCache: (): void => {
        this.cache.clear();
        this.recordLoadHistory(LoadAction.UNLOAD, "all", 0, "キャッシュクリア");
      }
    };
  }

  /**
   * 理論コンテンツを読み込み
   */
  private async loadTheoryContent(theory: Theory): Promise<string> {
    try {
      // MCPメモリから検索
      const memoryResult = await this.mcpMemoryTools.search_nodes(theory.id);
      if (memoryResult && memoryResult.length > 0) {
        return memoryResult[0].content;
      }

      // ファイルシステムから読み込み
      const filePath = `docs2/theory-optimized/${theory.path}`;
      const content = await this.fileSystemTools.readFile(filePath);
      return content;
    } catch (error) {
      throw new Error(`理論コンテンツの読み込みに失敗: ${error.message}`);
    }
  }

  /**
   * MCPメモリに保存
   */
  private async saveToMemory(theory: Theory): Promise<void> {
    try {
      await this.mcpMemoryTools.create_entities([{
        name: theory.id,
        entityType: "theory",
        observations: [theory.content, JSON.stringify(theory)]
      }]);
    } catch (error) {
      console.warn(`MCPメモリ保存失敗: ${theory.id}`);
    }
  }

  /**
   * 条件マッチング
   */
  private matchesCriteria(theory: Theory, criteria: LoadCriteria, context: TaskContext): boolean {
    // 複雑度マッチング
    if (criteria.complexity && !this.matchesComplexity(theory, criteria.complexity)) {
      return false;
    }

    // タスクタイプマッチング
    if (criteria.taskType && !this.matchesTaskType(theory, criteria.taskType)) {
      return false;
    }

    // 緊急度による優先度チェック
    if (criteria.urgency === LoadingUrgency.HIGH && theory.priority > 2) {
      return false;
    }

    return true;
  }

  /**
   * 複雑度マッチング
   */
  private matchesComplexity(theory: Theory, complexity: string): boolean {
    const complexityMap: { [key: string]: string[] } = {
      'low': ['low'],
      'medium': ['low', 'medium'],
      'high': ['low', 'medium', 'high']
    };

    return complexityMap[complexity]?.some(c => 
      theory.applicability.complexity.includes(c as any)
    ) || false;
  }

  /**
   * タスクタイプマッチング
   */
  private matchesTaskType(theory: Theory, taskType: string): boolean {
    return theory.applicability.taskTypes.includes(taskType) ||
           theory.applicability.taskTypes.includes('all');
  }

  /**
   * 容量チェック
   */
  private hasCapacity(requiredTokens: number, maxTokens?: number): boolean {
    if (!maxTokens) return true;
    
    const currentUsage = this.getCurrentTokenUsage();
    return currentUsage + requiredTokens <= maxTokens;
  }

  /**
   * 理論群をロード
   */
  private async loadTheories(theories: Theory[], action: LoadAction): Promise<Theory[]> {
    const loadedTheories: Theory[] = [];

    for (const theory of theories) {
      try {
        if (this.cache.has(theory.id)) {
          loadedTheories.push(this.cache.get(theory.id)!);
        } else {
          const content = await this.loadTheoryContent(theory);
          const loadedTheory = { ...theory, content };
          loadedTheories.push(loadedTheory);
          this.cache.set(theory.id, loadedTheory);
        }

        this.recordLoadHistory(action, theory.id, theory.estimatedTokens, "条件付きロード");
      } catch (error) {
        console.warn(`理論ロード失敗: ${theory.id}`);
      }
    }

    return loadedTheories;
  }

  /**
   * フォールバック理論をロード
   */
  private async loadFallback(criteria: LoadCriteria, context: TaskContext): Promise<Theory[]> {
    // より軽量な核心理論を代替として提供
    const fallbackTheories = await this.mcpMemoryTools.search_nodes("core");
    
    if (fallbackTheories && fallbackTheories.length > 0) {
      return fallbackTheories.slice(0, 1); // 1つの核心理論のみ
    }

    return [];
  }

  /**
   * 関連理論を検索
   */
  private async searchRelevantTheories(topic: string, theories: Theory[]): Promise<Theory[]> {
    // トピックキーワードによる検索
    const keywords = topic.toLowerCase().split(' ');
    
    return theories.filter(theory => {
      const searchText = `${theory.id} ${theory.description}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });
  }

  /**
   * 詳細レベルでフィルタリング
   */
  private filterByDetailLevel(theories: Theory[], level: DetailLevel): Theory[] {
    const levelMap: { [key in DetailLevel]: number } = {
      [DetailLevel.BASIC]: 500,
      [DetailLevel.STANDARD]: 1000,
      [DetailLevel.DETAILED]: 2000,
      [DetailLevel.COMPREHENSIVE]: 5000
    };

    const maxTokens = levelMap[level];
    return theories.filter(theory => theory.estimatedTokens <= maxTokens);
  }

  /**
   * 緊急度で優先順位付け
   */
  private prioritizeByUrgency(theories: Theory[], urgency: LoadingUrgency): Theory[] {
    const urgencyWeight: { [key in LoadingUrgency]: number } = {
      [LoadingUrgency.LOW]: 0.5,
      [LoadingUrgency.NORMAL]: 1.0,
      [LoadingUrgency.HIGH]: 1.5,
      [LoadingUrgency.CRITICAL]: 2.0
    };

    const weight = urgencyWeight[urgency];
    
    return theories.sort((a, b) => {
      const scoreA = (a.priority * 100 + a.effectivenessScore * 10) * weight;
      const scoreB = (b.priority * 100 + b.effectivenessScore * 10) * weight;
      return scoreB - scoreA;
    });
  }

  /**
   * フォールバック理論を作成
   */
  private createFallbackTheory(theory: Theory): Theory {
    return {
      ...theory,
      content: `# ${theory.id}\n\n基本情報のみ利用可能\n\n${theory.description}`,
      estimatedTokens: 100 // 最小限のトークン数
    };
  }

  /**
   * ロード履歴を記録
   */
  private recordLoadHistory(action: LoadAction, theoryId: string, tokens: number, reason: string): void {
    this.loadingHistory.push({
      timestamp: new Date().toISOString(),
      action,
      theoryId,
      tokens,
      reason
    });

    // 履歴サイズ制限
    if (this.loadingHistory.length > 100) {
      this.loadingHistory = this.loadingHistory.slice(-50);
    }
  }

  /**
   * 現在のトークン使用量を取得
   */
  private getCurrentTokenUsage(): number {
    return Array.from(this.cache.values())
      .reduce((sum, theory) => sum + theory.estimatedTokens, 0);
  }

  /**
   * ロード済みトークン数を計算
   */
  private calculateLoadedTokens(theories: Theory[]): number {
    return theories.reduce((sum, theory) => sum + theory.estimatedTokens, 0);
  }

  /**
   * キャッシュサイズを管理
   */
  private manageCacheSize(): void {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      // LRU方式でキャッシュをクリア
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 10);
      
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 統計情報を取得
   */
  getLoadingStatistics(): any {
    return {
      cacheSize: this.cache.size,
      totalTokensInCache: this.getCurrentTokenUsage(),
      loadingHistoryCount: this.loadingHistory.length,
      recentActions: this.loadingHistory.slice(-10)
    };
  }
}

export class ProgressiveLoadingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressiveLoadingError';
  }
}

// 使用例
/*
const loader = new ProgressiveLoader(mcpMemoryTools, mcpFileSystemTools);

const loadedTheory = await loader.loadTheoryProgressive(
  theorySelection,
  {
    currentStep: "STEP_3_DETAILED_DESIGN",
    taskType: "class_design",
    complexity: "high",
    timeConstraint: false
  },
  LoadingUrgency.NORMAL
);

// 核心理論は即座に利用可能
console.log("利用可能な核心理論:", loadedTheory.core.map(t => t.id));

// 条件付き追加ロード
if (taskContext.complexity === "high") {
  const additionalGuides = await loadedTheory.guides.loadWhenNeeded({
    complexity: "high",
    taskType: "class_design"
  });
  console.log("追加ロード:", additionalGuides.map(t => t.id));
}

// オンデマンド詳細ロード
const detailedTheory = await loadedTheory.details.loadOnDemand({
  topic: "quality-gates",
  level: DetailLevel.DETAILED,
  urgency: LoadingUrgency.HIGH
});
*/
