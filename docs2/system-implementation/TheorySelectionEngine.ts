/**
 * 理論選択エンジン
 * プロジェクトプロファイルと現在のフェーズに基づき、最適な理論要素を選択
 */

import { ProjectProfile, ProjectScale, RiskLevel } from './ProjectAnalysisEngine';

export interface TheorySelectionInput {
  profile: ProjectProfile;     // プロジェクト分析結果
  phase: ProcessPhase;         // 現在のフェーズ
  maxTokens?: number;         // 最大トークン数制限
  forceInclude?: string[];    // 強制含有理論ID
  exclude?: string[];         // 除外理論ID
}

export interface TheorySelection {
  theories: Theory[];          // 選択された理論要素
  estimatedTokens: number;     // 推定トークン数
  loadingStrategy: LoadingStrategy; // ロード戦略
  fallbackOptions: Theory[];   // フォールバック選択肢
  selectionReason: string;     // 選択理由
}

export interface Theory {
  id: string;
  path: string;
  category: TheoryCategory;
  priority: number;
  estimatedTokens: number;
  dependencies: string[];
  applicability: Applicability;
  usageFrequency: number;
  effectivenessScore: number;
  description: string;
}

export interface Applicability {
  projectSize: ProjectScale[];
  complexity: RiskLevel[];
  phases: ProcessPhase[];
  taskTypes: string[];
}

export enum ProcessPhase {
  STEP_0_GOAL_DEFINITION = "STEP_0_GOAL_DEFINITION",
  STEP_1_REQUIREMENTS = "STEP_1_REQUIREMENTS",
  STEP_2_SYSTEM_DESIGN = "STEP_2_SYSTEM_DESIGN",
  STEP_2_5_AUTOMATION_DESIGN = "STEP_2_5_AUTOMATION_DESIGN",
  STEP_3_DETAILED_DESIGN = "STEP_3_DETAILED_DESIGN",
  STEP_4_TEST_DESIGN = "STEP_4_TEST_DESIGN",
  STEP_5_DEVELOPMENT_PLANNING = "STEP_5_DEVELOPMENT_PLANNING",
  STEP_6_TASK_CREATION = "STEP_6_TASK_CREATION",
  STEP_7_IMPLEMENTATION = "STEP_7_IMPLEMENTATION",
  STEP_8_CONTINUOUS_IMPROVEMENT = "STEP_8_CONTINUOUS_IMPROVEMENT"
}

export enum TheoryCategory {
  CORE = "core",
  GUIDE = "guide",
  DETAILED = "detailed"
}

export enum LoadingStrategy {
  IMMEDIATE = "IMMEDIATE",
  PROGRESSIVE = "PROGRESSIVE",
  ON_DEMAND = "ON_DEMAND"
}

export interface TheoryIndex {
  theories: Theory[];
  categories: { [key: string]: CategoryInfo };
  applicabilityIndex: ApplicabilityIndex;
}

export interface CategoryInfo {
  description: string;
  totalTokens: number;
  theories: string[];
}

export interface ApplicabilityIndex {
  byProjectSize: { [key: string]: { required: string[]; recommended?: string[]; optional?: string[] } };
  byComplexity: { [key: string]: { required: string[]; recommended?: string[]; optional?: string[] } };
  byPhase: { [key: string]: { theories: string[] } };
}

export class TheorySelectionEngine {
  private theoryIndex: TheoryIndex;
  private readonly MAX_TOKENS_BUDGET = 15000; // デフォルトの最大トークン予算

  constructor(theoryIndex: TheoryIndex) {
    this.theoryIndex = theoryIndex;
  }

  /**
   * 最適な理論要素を選択
   */
  selectOptimalTheory(
    profile: ProjectProfile, 
    phase: ProcessPhase,
    options: Partial<TheorySelectionInput> = {}
  ): TheorySelection {
    try {
      const maxTokens = options.maxTokens || this.MAX_TOKENS_BUDGET;
      
      // 1. 必須理論（核心原則）の選択
      const coreTheories = this.selectCoreTheories(profile, phase);
      
      // 2. 条件付き理論（実装ガイド）の選択
      const conditionalTheories = this.selectConditionalTheories(profile, phase);
      
      // 3. 強制含有・除外の適用
      const adjustedTheories = this.applyForceIncludeExclude(
        [...coreTheories, ...conditionalTheories],
        options.forceInclude,
        options.exclude
      );
      
      // 4. トークン使用量最適化
      const optimizedTheories = this.optimizeTokenUsage(adjustedTheories, maxTokens);
      
      // 5. ロード戦略の決定
      const loadingStrategy = this.determineLoadingStrategy(optimizedTheories, maxTokens);
      
      // 6. フォールバック選択肢の生成
      const fallbackOptions = this.generateFallbacks(optimizedTheories, profile);
      
      // 7. 選択理由の生成
      const selectionReason = this.generateSelectionReason(profile, phase, optimizedTheories);

      return {
        theories: optimizedTheories,
        estimatedTokens: this.calculateTokens(optimizedTheories),
        loadingStrategy,
        fallbackOptions,
        selectionReason
      };
    } catch (error) {
      throw new TheorySelectionError(`理論選択に失敗しました: ${error.message}`);
    }
  }

  /**
   * 核心理論を選択
   */
  private selectCoreTheories(profile: ProjectProfile, phase: ProcessPhase): Theory[] {
    const coreTheories = this.theoryIndex.theories.filter(t => 
      t.category === TheoryCategory.CORE && t.priority === 1
    );

    // プロジェクト特性による核心理論のフィルタリング
    return coreTheories.filter(theory => 
      this.isApplicableToProject(theory, profile) &&
      this.isRelevantToPhase(theory, phase)
    );
  }

  /**
   * 条件付き理論を選択
   */
  private selectConditionalTheories(profile: ProjectProfile, phase: ProcessPhase): Theory[] {
    const guideTheories = this.theoryIndex.theories.filter(t => 
      t.category === TheoryCategory.GUIDE
    );

    // 適用性とフェーズの関連性でフィルタリング
    const applicableTheories = guideTheories.filter(theory => 
      this.isApplicableToProject(theory, profile) &&
      this.isRelevantToPhase(theory, phase)
    );

    // 効果性スコアでソート
    return applicableTheories.sort((a, b) => 
      (b.effectivenessScore * b.usageFrequency) - (a.effectivenessScore * a.usageFrequency)
    );
  }

  /**
   * プロジェクトへの適用性をチェック
   */
  private isApplicableToProject(theory: Theory, profile: ProjectProfile): boolean {
    // プロジェクト規模の適用性
    const sizeApplicable = theory.applicability.projectSize.includes(profile.scale);
    
    // 複雑度の適用性
    const complexityApplicable = theory.applicability.complexity.includes(profile.riskLevel);
    
    return sizeApplicable && complexityApplicable;
  }

  /**
   * フェーズへの関連性をチェック
   */
  private isRelevantToPhase(theory: Theory, phase: ProcessPhase): boolean {
    // 全フェーズ適用可能な理論
    if (theory.applicability.phases.includes('all' as any)) {
      return true;
    }
    
    // 特定フェーズに適用可能な理論
    return theory.applicability.phases.includes(phase);
  }

  /**
   * 強制含有・除外を適用
   */
  private applyForceIncludeExclude(
    theories: Theory[], 
    forceInclude?: string[], 
    exclude?: string[]
  ): Theory[] {
    let result = [...theories];

    // 除外理論の削除
    if (exclude) {
      result = result.filter(t => !exclude.includes(t.id));
    }

    // 強制含有理論の追加
    if (forceInclude) {
      for (const theoryId of forceInclude) {
        const theory = this.theoryIndex.theories.find(t => t.id === theoryId);
        if (theory && !result.some(t => t.id === theoryId)) {
          result.push(theory);
        }
      }
    }

    return result;
  }

  /**
   * トークン使用量を最適化
   */
  private optimizeTokenUsage(theories: Theory[], maxTokens: number): Theory[] {
    // 依存関係を考慮した理論の並び替え
    const sortedTheories = this.sortByDependencies(theories);
    
    const selected: Theory[] = [];
    let totalTokens = 0;

    for (const theory of sortedTheories) {
      // 依存関係のチェック
      const dependenciesMet = this.checkDependencies(theory, selected);
      
      if (dependenciesMet && totalTokens + theory.estimatedTokens <= maxTokens) {
        selected.push(theory);
        totalTokens += theory.estimatedTokens;
      }
    }

    // 核心理論が含まれていない場合の緊急対応
    const hasCoreTheory = selected.some(t => t.category === TheoryCategory.CORE);
    if (!hasCoreTheory) {
      return this.ensureCoreTheories(selected, maxTokens);
    }

    return selected;
  }

  /**
   * 依存関係に基づく並び替え
   */
  private sortByDependencies(theories: Theory[]): Theory[] {
    const sorted: Theory[] = [];
    const remaining = [...theories];
    
    while (remaining.length > 0) {
      const canAdd = remaining.filter(theory => 
        theory.dependencies.every(dep => 
          sorted.some(s => s.id === dep)
        )
      );
      
      if (canAdd.length === 0) {
        // 循環依存または未解決依存がある場合
        sorted.push(...remaining);
        break;
      }
      
      // 優先度とスコアでソート
      canAdd.sort((a, b) => {
        const scoreA = a.priority * 1000 + a.effectivenessScore * 100 + a.usageFrequency * 10;
        const scoreB = b.priority * 1000 + b.effectivenessScore * 100 + b.usageFrequency * 10;
        return scoreB - scoreA;
      });
      
      sorted.push(canAdd[0]);
      remaining.splice(remaining.indexOf(canAdd[0]), 1);
    }
    
    return sorted;
  }

  /**
   * 依存関係をチェック
   */
  private checkDependencies(theory: Theory, selectedTheories: Theory[]): boolean {
    return theory.dependencies.every(dep => 
      selectedTheories.some(s => s.id === dep)
    );
  }

  /**
   * 核心理論の確保
   */
  private ensureCoreTheories(selected: Theory[], maxTokens: number): Theory[] {
    const coreTheories = this.theoryIndex.theories.filter(t => 
      t.category === TheoryCategory.CORE && t.priority === 1
    );
    
    // 最小限の核心理論を選択
    const essentialCore = coreTheories
      .sort((a, b) => a.estimatedTokens - b.estimatedTokens)
      .slice(0, 1); // 最も軽量な核心理論を1つ
    
    let totalTokens = essentialCore.reduce((sum, t) => sum + t.estimatedTokens, 0);
    const result = [...essentialCore];
    
    // 残りの容量で他の理論を追加
    for (const theory of selected) {
      if (!result.some(r => r.id === theory.id) && 
          totalTokens + theory.estimatedTokens <= maxTokens) {
        result.push(theory);
        totalTokens += theory.estimatedTokens;
      }
    }
    
    return result;
  }

  /**
   * ロード戦略を決定
   */
  private determineLoadingStrategy(theories: Theory[], maxTokens: number): LoadingStrategy {
    const totalTokens = this.calculateTokens(theories);
    
    if (totalTokens <= maxTokens * 0.5) {
      return LoadingStrategy.IMMEDIATE;
    } else if (totalTokens <= maxTokens * 0.8) {
      return LoadingStrategy.PROGRESSIVE;
    } else {
      return LoadingStrategy.ON_DEMAND;
    }
  }

  /**
   * フォールバック選択肢を生成
   */
  private generateFallbacks(selectedTheories: Theory[], profile: ProjectProfile): Theory[] {
    // より軽量な代替理論を探す
    const alternatives: Theory[] = [];
    
    for (const theory of selectedTheories) {
      if (theory.category === TheoryCategory.GUIDE) {
        // より軽量な核心理論で代替可能かチェック
        const coreAlternatives = this.theoryIndex.theories.filter(t => 
          t.category === TheoryCategory.CORE &&
          t.estimatedTokens < theory.estimatedTokens &&
          this.isApplicableToProject(t, profile)
        );
        
        alternatives.push(...coreAlternatives);
      }
    }
    
    return alternatives.slice(0, 3); // 最大3つの代替案
  }

  /**
   * 選択理由を生成
   */
  private generateSelectionReason(
    profile: ProjectProfile, 
    phase: ProcessPhase, 
    theories: Theory[]
  ): string {
    const reasons: string[] = [];
    
    // プロジェクト特性による理由
    reasons.push(`${profile.scale}規模プロジェクト`);
    reasons.push(`${profile.riskLevel}リスクレベル`);
    
    // フェーズによる理由
    const phaseNames: { [key in ProcessPhase]: string } = {
      [ProcessPhase.STEP_0_GOAL_DEFINITION]: "ゴール定義フェーズ",
      [ProcessPhase.STEP_1_REQUIREMENTS]: "要件定義フェーズ",
      [ProcessPhase.STEP_2_SYSTEM_DESIGN]: "システム設計フェーズ",
      [ProcessPhase.STEP_2_5_AUTOMATION_DESIGN]: "自動化設計フェーズ",
      [ProcessPhase.STEP_3_DETAILED_DESIGN]: "詳細設計フェーズ",
      [ProcessPhase.STEP_4_TEST_DESIGN]: "テスト設計フェーズ",
      [ProcessPhase.STEP_5_DEVELOPMENT_PLANNING]: "開発計画フェーズ",
      [ProcessPhase.STEP_6_TASK_CREATION]: "タスク作成フェーズ",
      [ProcessPhase.STEP_7_IMPLEMENTATION]: "実装フェーズ",
      [ProcessPhase.STEP_8_CONTINUOUS_IMPROVEMENT]: "継続改善フェーズ"
    };
    
    reasons.push(phaseNames[phase]);
    
    // 選択された理論の特徴
    const coreCount = theories.filter(t => t.category === TheoryCategory.CORE).length;
    const guideCount = theories.filter(t => t.category === TheoryCategory.GUIDE).length;
    
    if (coreCount > 0) reasons.push(`核心理論${coreCount}個`);
    if (guideCount > 0) reasons.push(`実装ガイド${guideCount}個`);
    
    return reasons.join("、") + "に最適化";
  }

  /**
   * トークン数を計算
   */
  private calculateTokens(theories: Theory[]): number {
    return theories.reduce((sum, theory) => sum + theory.estimatedTokens, 0);
  }

  /**
   * 理論インデックスを更新
   */
  updateTheoryIndex(newIndex: TheoryIndex): void {
    this.theoryIndex = newIndex;
  }

  /**
   * 使用統計を更新
   */
  updateUsageStatistics(theoryId: string, effectiveness: number): void {
    const theory = this.theoryIndex.theories.find(t => t.id === theoryId);
    if (theory) {
      // 使用頻度と効果性スコアの更新ロジック
      // 実際の実装では外部の統計管理システムと連携
    }
  }
}

export class TheorySelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TheorySelectionError';
  }
}

// 使用例
/*
const theoryIndex = await loadTheoryIndex();
const selector = new TheorySelectionEngine(theoryIndex);

const selection = selector.selectOptimalTheory(
  projectProfile,
  ProcessPhase.STEP_1_REQUIREMENTS,
  {
    maxTokens: 5000,
    forceInclude: ["process-essence"]
  }
);

console.log(`選択理論: ${selection.theories.map(t => t.id).join(", ")}`);
console.log(`推定トークン: ${selection.estimatedTokens}`);
console.log(`選択理由: ${selection.selectionReason}`);
*/
