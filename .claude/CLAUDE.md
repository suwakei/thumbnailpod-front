## 設計書リファレンス — 実装・レビュー・設計判断の前に参照すること

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

## ワークフロー・オーケストレーション — 計画モード・サブエージェント・自己改善・検証・洗練さ・バグ修正のルール

@.claude/WORKFLOW.md

## タスク管理 — todo.md / lessons.md の運用ルール

@.claude/TASKS.md

## 基本原則 — シンプルさ・怠慢禁止・最小限の影響

@.claude/PRINCIPLES.md
