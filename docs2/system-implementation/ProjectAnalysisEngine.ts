/**
 * プロジェクト分析エンジン
 * プロジェクトの特性を自動分析し、最適な理論選択の基礎データを提供
 */

export interface ProjectAnalysisInput {
  projectPath: string;          // プロジェクトのルートパス
  teamSize?: number;           // チーム規模 (オプション)
  deadline?: Date;             // 期限 (オプション)
  customComplexity?: number;   // カスタム複雑度 (オプション)
}

export interface ProjectProfile {
  fileCount: number;           // 推定ファイル数
  adjustedFileCount: number;   // 調整後ファイル数
  scale: ProjectScale;         // 規模 (SMALL/MEDIUM/LARGE)
  techComplexity: number;      // 技術複雑度 (1.0-2.0)
  domainComplexity: number;    // ドメイン複雑度 (1.0-2.0)
  riskLevel: RiskLevel;        // リスクレベル (LOW/MEDIUM/HIGH)
  recommendedApproach: string; // 推奨アプローチ
  techStack: TechStack;        // 技術スタック情報
  projectType: ProjectType;    // プロジェクトタイプ
}

export enum ProjectScale {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM", 
  LARGE = "LARGE"
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum ProjectType {
  WEB_APPLICATION = "WEB_APPLICATION",
  API_SERVER = "API_SERVER",
  DESKTOP_APP = "DESKTOP_APP",
  MOBILE_APP = "MOBILE_APP",
  LIBRARY = "LIBRARY",
  CLI_TOOL = "CLI_TOOL"
}

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  frameworks?: string[];
  languages?: string[];
}

export interface FileStructure {
  estimatedFiles: number;
  directories: string[];
  fileTypes: Map<string, number>;
  complexity: number;
}

export class ProjectAnalysisEngine {
  private readonly fileSystemTools: any; // MCPツールへの参照
  
  constructor(fileSystemTools: any) {
    this.fileSystemTools = fileSystemTools;
  }

  /**
   * プロジェクトを分析してプロファイルを生成
   */
  async analyzeProject(input: ProjectAnalysisInput): Promise<ProjectProfile> {
    try {
      // 1. ファイル構造分析
      const structure = await this.analyzeFileStructure(input.projectPath);
      
      // 2. 技術スタック検出
      const techStack = await this.detectTechStack(input.projectPath);
      
      // 3. プロジェクトタイプ判定
      const projectType = this.determineProjectType(structure, techStack);
      
      // 4. 複雑度計算
      const complexity = this.calculateComplexity(structure, techStack, input);
      
      // 5. 規模判定
      const adjustedFileCount = structure.estimatedFiles * 
        complexity.technical * complexity.domain * complexity.team;
      
      const scale = this.determineScale(adjustedFileCount);
      const riskLevel = this.assessRisk(complexity);
      const recommendedApproach = this.selectApproach(scale, complexity);

      return {
        fileCount: structure.estimatedFiles,
        adjustedFileCount,
        scale,
        techComplexity: complexity.technical,
        domainComplexity: complexity.domain,
        riskLevel,
        recommendedApproach,
        techStack,
        projectType
      };
    } catch (error) {
      throw new ProjectAnalysisError(`プロジェクト分析に失敗しました: ${error.message}`);
    }
  }

  /**
   * ファイル構造を分析
   */
  private async analyzeFileStructure(projectPath: string): Promise<FileStructure> {
    // MCPツールを使用してファイル一覧を取得
    const files = await this.fileSystemTools.listFiles(projectPath, true);
    
    const fileTypes = new Map<string, number>();
    let estimatedFiles = 0;
    
    for (const file of files) {
      const extension = this.getFileExtension(file);
      fileTypes.set(extension, (fileTypes.get(extension) || 0) + 1);
      
      // 実装ファイルのみカウント (テスト、設定ファイル除く)
      if (this.isImplementationFile(file)) {
        estimatedFiles++;
      }
    }

    const directories = this.extractDirectories(files);
    const complexity = this.calculateStructuralComplexity(directories, fileTypes);

    return {
      estimatedFiles,
      directories,
      fileTypes,
      complexity
    };
  }

  /**
   * 技術スタックを検出
   */
  private async detectTechStack(projectPath: string): Promise<TechStack> {
    const techStack: TechStack = {
      frontend: [],
      backend: [],
      database: [],
      frameworks: [],
      languages: []
    };

    try {
      // package.jsonの分析
      const packageJson = await this.readPackageJson(projectPath);
      if (packageJson) {
        this.analyzePackageJson(packageJson, techStack);
      }

      // その他の設定ファイルの分析
      await this.analyzeConfigFiles(projectPath, techStack);
      
      // ファイル拡張子からの言語推定
      const files = await this.fileSystemTools.listFiles(projectPath, true);
      this.analyzeFileExtensions(files, techStack);

    } catch (error) {
      console.warn(`技術スタック検出でエラー: ${error.message}`);
    }

    return techStack;
  }

  /**
   * プロジェクトタイプを判定
   */
  private determineProjectType(structure: FileStructure, techStack: TechStack): ProjectType {
    // フロントエンド技術の存在チェック
    const hasFrontend = techStack.frontend && techStack.frontend.length > 0;
    
    // バックエンド技術の存在チェック
    const hasBackend = techStack.backend && techStack.backend.length > 0;
    
    // モバイル開発フレームワークのチェック
    const mobileFrameworks = ['react-native', 'flutter', 'ionic', 'cordova'];
    const isMobile = techStack.frameworks?.some(f => 
      mobileFrameworks.some(mf => f.toLowerCase().includes(mf))
    );

    // デスクトップアプリフレームワークのチェック
    const desktopFrameworks = ['electron', 'tauri', 'nwjs'];
    const isDesktop = techStack.frameworks?.some(f => 
      desktopFrameworks.some(df => f.toLowerCase().includes(df))
    );

    if (isMobile) return ProjectType.MOBILE_APP;
    if (isDesktop) return ProjectType.DESKTOP_APP;
    if (hasFrontend && hasBackend) return ProjectType.WEB_APPLICATION;
    if (hasBackend && !hasFrontend) return ProjectType.API_SERVER;
    
    // ディレクトリ構造からの推定
    const hasLibStructure = structure.directories.some(d => 
      d.includes('lib') || d.includes('src/lib')
    );
    if (hasLibStructure) return ProjectType.LIBRARY;

    const hasCLIStructure = structure.directories.some(d => 
      d.includes('bin') || d.includes('cli')
    );
    if (hasCLIStructure) return ProjectType.CLI_TOOL;

    // デフォルト
    return ProjectType.WEB_APPLICATION;
  }

  /**
   * 複雑度を計算
   */
  private calculateComplexity(
    structure: FileStructure, 
    techStack: TechStack, 
    input: ProjectAnalysisInput
  ): { technical: number; domain: number; team: number } {
    
    // 技術複雑度 (1.0-2.0)
    let technical = 1.0;
    
    // 新しい技術・フレームワークの使用
    const modernTech = ['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt.js'];
    const hasModernTech = techStack.frameworks?.some(f => 
      modernTech.some(mt => f.toLowerCase().includes(mt))
    );
    if (hasModernTech) technical += 0.2;

    // マイクロサービス・複雑なアーキテクチャ
    const complexArchPatterns = ['microservice', 'docker', 'kubernetes', 'graphql'];
    const hasComplexArch = techStack.frameworks?.some(f => 
      complexArchPatterns.some(cap => f.toLowerCase().includes(cap))
    );
    if (hasComplexArch) technical += 0.3;

    // 多言語プロジェクト
    if (techStack.languages && techStack.languages.length > 2) {
      technical += 0.2;
    }

    // ドメイン複雑度 (1.0-2.0)
    let domain = input.customComplexity || 1.0;
    
    // ファイル数による複雑度推定
    if (structure.estimatedFiles > 50) domain += 0.3;
    if (structure.estimatedFiles > 100) domain += 0.3;

    // チーム係数 (0.8-1.5)
    let team = 1.0;
    if (input.teamSize) {
      if (input.teamSize === 1) team = 0.9;
      else if (input.teamSize <= 3) team = 1.0;
      else if (input.teamSize <= 5) team = 1.1;
      else team = 1.3;
    }

    return {
      technical: Math.min(technical, 2.0),
      domain: Math.min(domain, 2.0),
      team: Math.max(Math.min(team, 1.5), 0.8)
    };
  }

  /**
   * プロジェクト規模を判定
   */
  private determineScale(adjustedFileCount: number): ProjectScale {
    if (adjustedFileCount < 10) return ProjectScale.SMALL;
    if (adjustedFileCount < 30) return ProjectScale.MEDIUM;
    return ProjectScale.LARGE;
  }

  /**
   * リスクレベルを評価
   */
  private assessRisk(complexity: { technical: number; domain: number; team: number }): RiskLevel {
    const avgComplexity = (complexity.technical + complexity.domain + complexity.team) / 3;
    
    if (avgComplexity < 1.2) return RiskLevel.LOW;
    if (avgComplexity < 1.5) return RiskLevel.MEDIUM;
    return RiskLevel.HIGH;
  }

  /**
   * 推奨アプローチを選択
   */
  private selectApproach(scale: ProjectScale, complexity: any): string {
    switch (scale) {
      case ProjectScale.SMALL:
        return "レイヤー単位管理";
      case ProjectScale.MEDIUM:
        return "機能モジュール単位管理";
      case ProjectScale.LARGE:
        return "実装フェーズ単位管理";
      default:
        return "標準アプローチ";
    }
  }

  // ユーティリティメソッド
  private getFileExtension(filePath: string): string {
    return filePath.split('.').pop()?.toLowerCase() || '';
  }

  private isImplementationFile(filePath: string): boolean {
    const implementationExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cs', 'cpp', 'c', 'go', 'rs', 'php'];
    const extension = this.getFileExtension(filePath);
    
    // テストファイルを除外
    if (filePath.includes('test') || filePath.includes('spec')) return false;
    
    return implementationExtensions.includes(extension);
  }

  private extractDirectories(files: string[]): string[] {
    const directories = new Set<string>();
    
    for (const file of files) {
      const parts = file.split('/');
      for (let i = 1; i < parts.length; i++) {
        directories.add(parts.slice(0, i).join('/'));
      }
    }
    
    return Array.from(directories);
  }

  private calculateStructuralComplexity(directories: string[], fileTypes: Map<string, number>): number {
    let complexity = 1.0;
    
    // ディレクトリ階層の深さ
    const maxDepth = Math.max(...directories.map(d => d.split('/').length));
    if (maxDepth > 5) complexity += 0.2;
    if (maxDepth > 8) complexity += 0.3;
    
    // ファイルタイプの多様性
    if (fileTypes.size > 5) complexity += 0.2;
    if (fileTypes.size > 10) complexity += 0.3;
    
    return Math.min(complexity, 2.0);
  }

  private async readPackageJson(projectPath: string): Promise<any> {
    try {
      const content = await this.fileSystemTools.readFile(`${projectPath}/package.json`);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private analyzePackageJson(packageJson: any, techStack: TechStack): void {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of Object.keys(dependencies)) {
      // フロントエンドフレームワーク
      if (['react', 'vue', 'angular', 'svelte'].includes(dep)) {
        techStack.frontend?.push(dep);
      }
      
      // バックエンドフレームワーク
      if (['express', 'koa', 'fastify', 'nest'].includes(dep)) {
        techStack.backend?.push(dep);
      }
      
      // データベース
      if (['mongoose', 'sequelize', 'typeorm', 'prisma'].includes(dep)) {
        techStack.database?.push(dep);
      }
      
      // フレームワーク
      techStack.frameworks?.push(dep);
    }
  }

  private async analyzeConfigFiles(projectPath: string, techStack: TechStack): Promise<void> {
    // 実装: 各種設定ファイルの分析
    // tsconfig.json, webpack.config.js, vite.config.js等
  }

  private analyzeFileExtensions(files: string[], techStack: TechStack): void {
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript', 
      'py': 'Python',
      'java': 'Java',
      'cs': 'C#',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rs': 'Rust',
      'php': 'PHP'
    };

    const extensions = new Set<string>();
    for (const file of files) {
      const ext = this.getFileExtension(file);
      if (languageMap[ext]) {
        extensions.add(languageMap[ext]);
      }
    }

    techStack.languages = Array.from(extensions);
  }
}

export class ProjectAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectAnalysisError';
  }
}

// 使用例
/*
const analyzer = new ProjectAnalysisEngine(mcpFileSystemTools);

const profile = await analyzer.analyzeProject({
  projectPath: "./my-project",
  teamSize: 3,
  deadline: new Date("2025-08-01")
});

console.log(`プロジェクト規模: ${profile.scale}`);
console.log(`推奨アプローチ: ${profile.recommendedApproach}`);
console.log(`技術複雑度: ${profile.techComplexity}`);
console.log(`リスクレベル: ${profile.riskLevel}`);
*/
