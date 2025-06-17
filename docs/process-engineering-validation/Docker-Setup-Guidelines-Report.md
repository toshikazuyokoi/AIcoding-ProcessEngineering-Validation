# Docker環境セットアップ時の注意点レポート

## 📊 メタデータ
- **ドキュメントID**: RPT-001-Docker-Setup-Guidelines
- **作成日**: 2025-06-10
- **最終更新日**: 2025-06-10
- **関連文書**: フロントエンド・バックエンドDockerfile、docker-compose.dev.yml

---

## 🎯 概要

本レポートは、タスク管理システムのDocker環境セットアップ時に発生したトラブルシューティングの経験を基に、今後のDocker環境構築における注意点と対策をまとめたものです。

---

## 🚨 発生した主要問題と解決策

### 1. Windows環境でのbash互換性問題

#### 問題
- Windows環境でnpm scriptsが`/bin/bash`を見つけられずエラー
- フロントエンドのnpm installで`spawn /bin/bash ENOENT`エラー

#### 解決策
- **WSL環境の活用**: `wsl -e bash -c "command"`でLinux環境実行
- **HUSKY無効化**: `HUSKY=0`環境変数でGitフック問題を回避

#### 教訓
```bash
# 成功パターン
wsl -e bash -c "cd /path/to/project && HUSKY=0 npm install"
```

### 2. Vite権限問題 (最重要)

#### 問題
- Dockerコンテナ内でViteの依存関係最適化時に権限エラー
- `EACCES: permission denied, mkdir '/app/node_modules/.vite/deps_temp_*'`

#### 解決策
```dockerfile
# 必要ディレクトリの事前作成と権限設定
RUN mkdir -p build dist coverage node_modules/.vite && \
    chown -R frontend:nodejs build dist coverage node_modules && \
    chmod -R 755 node_modules
```

#### 教訓
- **事前ディレクトリ作成**: Viteが動的作成するディレクトリを予め作成
- **包括的権限設定**: chown + chmod の組み合わせが必須
- **時間コスト**: 権限修正に180秒程度要することを考慮

### 3. Husky Git フック問題

#### 問題
- Dockerビルド時にHuskyが.gitディレクトリを見つけられずエラー
- `husky - .git directory not found`

#### 解決策
```dockerfile
# Dockerfile内でHusky無効化
ENV HUSKY=0
```

#### 教訓
- **開発環境では無効化**: Docker環境ではGitフックは不要
- **環境変数での制御**: HUSKYの動作を環境変数で制御

---

## 📋 Docker環境セットアップチェックリスト

### 🔧 事前準備

#### ✅ 環境確認
- [ ] Windows環境でのWSL2インストール確認
- [ ] Docker Desktop for Windowsの動作確認
- [ ] WSL環境でのNode.js動作確認

#### ✅ プロジェクト構成確認
- [ ] package.jsonのscripts確認
- [ ] Huskyの設定有無確認
- [ ] Vite使用プロジェクトの場合は権限要件確認

### 🐳 Dockerfile作成時の注意点

#### ✅ 基本設定
```dockerfile
# 必須環境変数
ENV NODE_ENV=development
ENV HUSKY=0

# ユーザー・グループ作成
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001 -G nodejs
```

#### ✅ 権限設定 (Viteプロジェクト)
```dockerfile
# 重要: Vite用ディレクトリの事前作成
RUN mkdir -p build dist coverage node_modules/.vite && \
    chown -R frontend:nodejs build dist coverage node_modules && \
    chmod -R 755 node_modules
```

#### ✅ 依存関係インストール
```dockerfile
# Husky無効化でのインストール
RUN npm ci --silent && \
    npm cache clean --force
```

### 🔄 docker-compose設定

#### ✅ 環境変数設定
```yaml
environment:
  - NODE_ENV=development
  - HUSKY=0
  - VITE_API_URL=http://localhost:8000
  - VITE_WS_URL=ws://localhost:8000
```

#### ✅ ヘルスチェック設定
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

## ⏱️ 時間コスト見積もり

### 📊 ビルド時間の目安

| 工程 | 時間 | 備考 |
|------|------|------|
| npm ci | 30-60秒 | 依存関係の量による |
| 権限修正 | 120-180秒 | node_modulesのサイズによる |
| イメージ作成 | 3-5秒 | レイヤーキャッシュ効果 |
| **合計** | **3-4分** | 初回ビルド時 |

### 🔄 再ビルド時間短縮策
- **レイヤーキャッシュ活用**: package.jsonの変更がない場合
- **マルチステージビルド**: 本番環境では不要なファイル除外
- **.dockerignore設定**: 不要ファイルの除外

---

## 🛠️ トラブルシューティングガイド

### 🚨 よくある問題と対処法

#### 1. bash not found エラー
```bash
# 解決策: WSL環境使用
wsl -e bash -c "cd /project && npm install"
```

#### 2. Vite権限エラー
```bash
# 解決策: コンテナ内権限確認
docker exec -it container_name ls -la /app/node_modules/.vite
```

#### 3. Husky エラー
```bash
# 解決策: 環境変数確認
docker exec -it container_name env | grep HUSKY
```

### 🔍 デバッグコマンド
```bash
# コンテナ状態確認
docker-compose -f docker-compose.dev.yml ps

# ログ確認
docker-compose -f docker-compose.dev.yml logs frontend --tail=20

# コンテナ内部確認
docker exec -it task-management-frontend-dev sh
```

---

## 📈 品質向上のための推奨事項

### 🎯 開発効率向上

#### ✅ 段階的アプローチ
1. **ローカル環境での動作確認**: WSL環境でまず成功させる
2. **Dockerfileへの反映**: ローカル成功要因をDockerに適用
3. **段階的ビルド**: 問題を分離して解決

#### ✅ 自動化推進
- **ヘルスチェック**: 自動的な稼働状況監視
- **ログ監視**: 権限エラーの早期発見
- **CI/CD統合**: 自動ビルド・テスト環境

### 🔒 セキュリティ考慮事項
- **最小権限原則**: 必要最小限の権限設定
- **ユーザー分離**: rootユーザーでの実行回避
- **脆弱性スキャン**: 定期的なイメージスキャン

---

## 📋 完了確認チェックリスト

### ✅ 基本動作確認
- [ ] 全コンテナが正常起動 (healthy状態)
- [ ] フロントエンド HTTP 200応答確認
- [ ] バックエンド API応答確認
- [ ] ブラウザでの表示確認

### ✅ 権限確認
- [ ] node_modules/.viteディレクトリ存在確認
- [ ] ファイル権限設定確認 (755)
- [ ] ユーザー所有権確認 (frontend:nodejs)

### ✅ ログ確認
- [ ] 権限エラーの有無確認
- [ ] Vite起動ログ確認
- [ ] 依存関係最適化完了確認

---

## 🎯 今後の改善提案

### 📋 短期改善 (1-2週間)
1. **標準Dockerfileテンプレート作成**: 権限設定を含む
2. **セットアップスクリプト作成**: 自動化推進
3. **トラブルシューティングドキュメント整備**

### 🚀 中長期改善 (1-3ヶ月)
1. **CI/CD パイプライン統合**: 自動ビルド・テスト
2. **マルチステージビルド導入**: 本番環境最適化
3. **監視・アラート機能**: 問題の早期発見

---

## 📊 学習効果と知見

### ✅ 重要な学習ポイント
1. **Windows環境の特殊性**: bash互換性問題の理解
2. **Vite権限要件**: 動的ディレクトリ作成の権限問題
3. **段階的問題解決**: ローカル→Docker の段階的アプローチ
4. **WSL環境の有効性**: Windows開発環境での救世主

### 🎯 プロセスエンジニアリング観点
- **品質向上**: 段階的詳細化による問題の分離・解決
- **再現性確保**: 標準化されたセットアップ手順
- **継続改善**: トラブルシューティング経験の文書化

---

**📝 このレポートは、実際のトラブルシューティング経験を基に作成されており、同様の問題に直面した際の実用的なガイドとして活用できます。**
