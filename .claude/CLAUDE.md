## 設計書リファレンス — 実装・レビュー・設計判断の前に参照すること

cat > ~/thumbnailpod/thumbnailpod-front/CLAUDE.md << 'EOF'
# ThumbnailPod — Frontend (Next.js + CSS Modules, Vercel)

## 技術スタック
Next.js (App Router), TypeScript, CSS Modules
ホスティング: Vercel
Tailwind は使わない。スタイルは全て CSS Modules。

## ディレクトリ構造（想定）
src/
├── app/
│   ├── dashboard/              # サムネイル一覧、ジョブ状態
│   ├── generate/               # 生成パラメータ入力・実行
│   ├── editor/[jobId]/         # Canvas ベースの軽度編集
│   ├── youtube/                # 動画一覧、サムネイル差し替え
│   ├── styles/                 # 学習管理（チャンネル連携・スタイル一覧）
│   └── download/[jobId]/       # レイヤー別プレビュー・DL
├── components/
│   ├── ThumbnailCard/
│   ├── LayerPreview/
│   ├── GenerationForm/
│   ├── Editor/                 # Canvas エディタ関連
│   │   ├── EditorCanvas.tsx    # メインCanvas
│   │   ├── TextTool.tsx        # テキスト編集ツール
│   │   ├── PositionTool.tsx    # 位置調整ツール
│   │   ├── ColorTool.tsx       # 色調補正ツール
│   │   └── LayerPanel.tsx      # レイヤー一覧・表示切替
│   └── YouTube/
│       ├── VideoList.tsx       # 動画一覧
│       └── ThumbnailReplace.tsx # 差し替え確認UI
├── lib/
│   ├── api-client.ts           # back との通信一元管理
│   ├── download.ts             # レイヤー別DLロジック
│   └── editor-state.ts        # エディタの状態管理
├── types/                      # API レスポンス型
└── styles/
    ├── globals.css
    └── variables.css           # CSS カスタムプロパティ定義

## スタイリング規約
- 全コンポーネントに `ComponentName.module.css` を作成
- グローバルな値は `variables.css` の CSS 変数で管理
- メディアクエリは各 module.css 内に記述
- クラス名は camelCase: `styles.editorCanvas`

## エディタ実装方針
- Canvas API (2D Context) or ライブラリ(fabric.js 等)で実装
- 編集操作は JSON パラメータとして back に送信
- ローカルプレビューは即時反映、保存時に back → ai で再合成
- 編集パラメータの形式:
```json
  {
    "operations": [
      {"type": "text_change", "layer": "text_layer", "content": "新テキスト", "position": {"x": 100, "y": 50}},
      {"type": "color_adjust", "layer": "background_layer", "brightness": 1.2, "contrast": 1.1},
      {"type": "move", "layer": "person_layer", "offset": {"dx": 30, "dy": -10}}
    ]
  }
```

## YouTube 差し替え
- YouTube 動画一覧は back 経由で取得（YouTube Data API）
- 差し替え実行も back 経由。front は back の API を呼ぶだけ。
- 差し替え前に確認ダイアログを必ず表示
- 差し替え結果（成功/失敗）をトースト通知

## API 通信
- `src/lib/api-client.ts` が全 API 呼び出しを管理
- back の snake_case → camelCase 変換レイヤーあり
- 認証は HttpOnly Cookie（自動送信）
- 画像表示は署名付きURL（img src に直接設定）

## 環境変数（Vercel で設定）
- NEXT_PUBLIC_API_URL: back の ALB エンドポイント
- NEXT_PUBLIC_APP_URL: front 自身の URL
EOF

設計に関わるタスク（実装・バグ修正・レビュー・新機能追加）では、作業開始前に `.claude/docs/` 配下の該当設計書を確認すること。
コードだけから読み取れない意図・制約・命名規則がドキュメントに記載されている。

| 使用する場面                                                                                                        | 参照すべきドキュメント                                                |
| ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| API 呼び出しパターン・fetch ラッパー・レスポンス型・エラー処理の判断に迷ったとき                                    | `.claude/docs/02-development-docs/03-api-design.md`                   |
| クライアントサイドの状態管理・キャッシュ戦略・TanStack Query の使用基準を確認したいとき                             | `.claude/docs/02-development-docs/02-database-design.md`              |
| ディレクトリ構成・Server Component と Client Component の分離・認証チェックの実装をするとき                         | `.claude/docs/02-development-docs/01-architecture-design.md`          |
| エラーをキャッチする・ユーザーに表示する・401 リフレッシュを実装するとき                                            | `.claude/docs/02-development-docs/04-error-handling.md`               |
| TypeScript の型・interface・Union 型・定数を新たに定義するとき                                                      | `.claude/docs/02-development-docs/05-type-definition.md`              |
| テストを追加・修正するとき、またはテスト戦略を確認したいとき                                                        | `.claude/docs/02-development-docs/06-test-strategy.md`                |
| 認証・認可・XSS・CSRF・環境変数・入力バリデーションに関わる実装をするとき                                           | `.claude/docs/02-development-docs/08-security-design.md`              |
| このプロジェクトが何をするサービスか・バックエンド API 仕様・認証フローを把握したいとき                             | `.claude/docs/01-project-overview/01-thumbnailpod-backend-concept.md` |
| CI/CD ワークフロー・デプロイフロー・GitHub Actions を変更・理解したいとき                                           | `.claude/docs/02-development-docs/07-cicd-design.md`                  |
| Shadcn UI のコンポーネント（Button・Form・Dialog・Toast 等）の使い方を確認したいとき                                | `.claude/docs/03-library-docs/01-shadcn-doc.md`                       |
| Next.js App Router の実装パターン（Server/Client Component 使い分け・データフェッチ・エラー処理等）を確認したいとき | `.claude/docs/03-library-docs/02-app-router-pattern.md`               |
| 画面遷移・ページ一覧・リダイレクトルール・ナビゲーション構造を確認したいとき                                        | `.claude/docs/02-development-docs/11-screen-transition-design.md`     |
| メタデータ・robots.txt・OGP・Core Web Vitals など SEO に関わる実装をするとき                                        | `.claude/docs/02-development-docs/12-seo-requirements.md`             |
| UI レイアウト・コンポーネント設計・ローディング/エラー表示・フォームバリデーション UI を実装するとき                | `.claude/docs/02-development-docs/13-frontend-design.md`              |
| E2E テスト（Playwright）のシナリオ・POM・認証フィクスチャ・CI 設定を確認したいとき                                  | `.claude/docs/02-development-docs/14-e2e-test-design.md`              |

## ワークフロー・オーケストレーション — 計画モード・サブエージェント・自己改善・検証・洗練さ・バグ修正のルール

@.claude/WORKFLOW.md

## タスク管理 — todo.md / lessons.md の運用ルール

@.claude/TASKS.md

## 基本原則 — シンプルさ・怠慢禁止・最小限の影響

@.claude/PRINCIPLES.md
