# フロントエンド UI 設計

## スタイリング方針

スタイルは **CSS Modules** を基本とする。グローバルスタイルは `app/globals.css` に最小限定義し、コンポーネント固有のスタイルは同階層に `ComponentName.module.css` を作成して管理する。Tailwind CSS は使用しない。

### CSS Modules の基本パターン

```tsx
// components/features/generation/GenerationForm.tsx
import styles from "./GenerationForm.module.css";

export function GenerationForm() {
  return (
    <form className={styles.form}>
      <textarea className={styles.promptInput} />
      <button className={styles.submitButton}>生成する</button>
    </form>
  );
}
```

```css
/* components/features/generation/GenerationForm.module.css */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.promptInput {
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
}

.submitButton {
  align-self: flex-end;
  padding: 0.5rem 1.5rem;
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.submitButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 条件付きクラスの適用

複数クラスや条件付きクラスの結合には `clsx` を使う。

```tsx
import clsx from "clsx";
import styles from "./Button.module.css";

<button className={clsx(styles.button, isLoading && styles.loading, className)}>
  {children}
</button>;
```

### CSS 変数（デザイントークン）

`app/globals.css` に CSS カスタムプロパティでデザイントークンを定義し、各 CSS Modules から参照する。

```css
/* app/globals.css */
:root {
  --color-primary: #0f172a;
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-destructive: #ef4444;
  --color-border: #e2e8f0;
  --color-muted-foreground: #64748b;
  --color-background: #ffffff;

  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}
```

UI コンポーネントは `components/ui/` 配下に配置し、スタイルのみを担う純粋な UI コンポーネントとして扱う（ロジックを持たない）。

---

## レイアウト構造

### ダッシュボード全体

```
┌─────────────────────────────────────────────────────┐
│  Header（ロゴ / ナビ / ユーザーメニュー）             │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Main Content（ページごとに異なる）                   │
│                                                       │
└─────────────────────────────────────────────────────┘
```

レスポンシブ対応:

- **デスクトップ（md 以上）**: ヘッダーにナビゲーションリンクを横並び表示
- **モバイル（md 未満）**: ヘッダーにハンバーガーメニューを配置、ドロワーでナビゲーションを表示

### ページ最大幅

```tsx
// 共通コンテナ
<main className={styles.container}>{children}</main>
```

```css
/* app/(dashboard)/layout.module.css */
.container {
  max-width: 64rem; /* 1024px */
  margin: 0 auto;
  padding: 2rem 1rem;
}
```

---

## 主要コンポーネントの設計方針

### ダッシュボード（`/`）

```
┌─────────────────────────────────────────────────────┐
│  使用状況バナー（今月の生成数 / 上限）                │
├─────────────────────────────────────────────────────┤
│  生成フォーム                                         │
│  ┌───────────────────────────────────────────────┐  │
│  │ プロンプト入力（Textarea）                      │  │
│  │ スタイルモデル選択（Select）                    │  │
│  │ [生成する] ボタン                               │  │
│  └───────────────────────────────────────────────┘  │
│  生成結果（ポーリング完了後にインライン表示）          │
├─────────────────────────────────────────────────────┤
│  最近の生成履歴（最大 5 件）                          │
└─────────────────────────────────────────────────────┘
```

### 生成履歴（`/history`）

```
┌─────────────────────────────────────────────────────┐
│  フィルター（ステータス・日付）                        │
├─────────────────────────────────────────────────────┤
│  サムネイルグリッド（3 列 / モバイル: 2 列）          │
│  ┌──────┐ ┌──────┐ ┌──────┐                        │
│  │ Card │ │ Card │ │ Card │                        │
│  └──────┘ └──────┘ └──────┘                        │
├─────────────────────────────────────────────────────┤
│  ページネーション                                     │
└─────────────────────────────────────────────────────┘
```

### スタイル学習（`/style`）

```
┌─────────────────────────────────────────────────────┐
│  [+ 新しいスタイルを追加] ボタン                      │
├─────────────────────────────────────────────────────┤
│  スタイルモデルグリッド                               │
│  ┌──────────┐ ┌──────────┐                          │
│  │ status   │ │ status   │                          │
│  │ 名前     │ │ 名前     │                          │
│  └──────────┘ └──────────┘                          │
└─────────────────────────────────────────────────────┘
```

---

## ステータス表示

`JobStatus` / `StyleModelStatus` はバッジで表示する。

| ステータス   | バリアント    | 表示テキスト |
| ------------ | ------------- | ------------ |
| `pending`    | `secondary`   | 待機中       |
| `processing` | `default`     | 処理中       |
| `completed`  | `success`     | 完了         |
| `failed`     | `destructive` | 失敗         |
| `training`   | `default`     | 学習中       |
| `ready`      | `success`     | 利用可能     |

```tsx
// components/ui/StatusBadge.tsx
import clsx from "clsx";
import styles from "./StatusBadge.module.css";
import type { JobStatus } from "@/types/api";

interface StatusBadgeProps {
  status: JobStatus;
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending: "待機中",
  processing: "処理中",
  completed: "完了",
  failed: "失敗",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
```

```css
/* components/ui/StatusBadge.module.css */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.pending {
  background-color: #f1f5f9;
  color: #475569;
}
.processing {
  background-color: #dbeafe;
  color: #1d4ed8;
}
.completed {
  background-color: #dcfce7;
  color: #15803d;
}
.failed {
  background-color: #fee2e2;
  color: #b91c1c;
}
```

---

## ローディング状態

### Skeleton（データ取得中）

Server Component のデータ取得中は `loading.tsx` または `Suspense` の fallback で Skeleton を表示する。

```tsx
// components/features/history/ThumbnailSkeleton.tsx
import styles from "./ThumbnailSkeleton.module.css";

export function ThumbnailSkeleton() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.image} />
      <div className={styles.textLong} />
      <div className={styles.textShort} />
    </div>
  );
}
```

```css
/* components/features/history/ThumbnailSkeleton.module.css */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.image,
.textLong,
.textShort {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.375rem;
}

.image {
  aspect-ratio: 16 / 9;
  width: 100%;
}
.textLong {
  height: 1rem;
  width: 75%;
}
.textShort {
  height: 1rem;
  width: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### ポーリング中（生成処理中）

生成ジョブのポーリング中は、フォームの送信ボタンを `disabled` にしてスピナーを表示する。

```tsx
import styles from "./GenerationForm.module.css";

<button type="submit" disabled={isPending} className={styles.submitButton}>
  {isPending ? "生成中..." : "生成する"}
</button>;
```

```css
/* スピナーアニメーション */
.submitButton[disabled]::before {
  content: "";
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## エラー表示

### フォームエラー

```tsx
import styles from "./GenerationForm.module.css";

{
  error && (
    <p role="alert" className={styles.errorMessage}>
      {error}
    </p>
  );
}
```

```css
.errorMessage {
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}
```

### ページレベルエラー

`app/(dashboard)/error.tsx` で Error Boundary によるエラー表示（詳細は `04-error-handling.md` 参照）。

### Toast（操作完了通知）

非同期操作（ダウンロード完了・スタイル学習開始など）の完了通知は `sonner` の `toast` を使う。

```ts
import { toast } from "sonner";

toast.success("ダウンロードが完了しました");
toast.error("操作に失敗しました。再試行してください。");
```

---

## プラン使用量の表示

ダッシュボードと設定画面に月次の生成使用量を表示する。

```tsx
import styles from "./UsageBanner.module.css";

{
  monthlyLimit !== null && (
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${(generationCount / monthlyLimit) * 100}%` }}
      />
    </div>
  );
}
<p className={styles.usageText}>
  {generationCount} / {monthlyLimit ?? "無制限"} 件（今月）
</p>;
```

```css
/* components/features/UsageBanner.module.css */
.progressBar {
  height: 0.5rem;
  background-color: var(--color-secondary);
  border-radius: 9999px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background-color: var(--color-primary);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.usageText {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  margin-top: 0.25rem;
}
```

`monthlyLimit` が `null`（`business` プランの無制限）の場合はプログレスバーを非表示にする。

---

## 画像表示

生成されたサムネイル画像は `next/image` で表示する。CLS 防止のために `width` / `height` または `fill` を必ず指定する。

```tsx
import Image from "next/image";

// アスペクト比が固定（サムネイルは 16:9）
<div className="relative aspect-video w-full overflow-hidden rounded-md">
  <Image
    src={job.imageUrl}
    alt="生成されたサムネイル"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 50vw, 33vw"
  />
</div>;
```

---

## レスポンシブブレークポイント

CSS Modules 内の `@media` クエリで対応する。ブレークポイントは `app/globals.css` に CSS 変数として定義せず、各 module.css に直接記述する。

プロジェクト全体で統一するブレークポイント値:

| 名称 | 幅       | 対象端末     |
| ---- | -------- | ------------ |
| sm   | 640px〜  | 大型スマホ   |
| md   | 768px〜  | タブレット   |
| lg   | 1024px〜 | デスクトップ |

モバイルファーストで記述する。

```css
/* components/features/history/ThumbnailGrid.module.css */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## フォームバリデーション

フォームは **React Hook Form + Zod** で実装する。クライアントサイドでのバリデーションを必ず行い、サーバー側 400 エラーはフォールバックとして処理する（詳細は `04-error-handling.md` 参照）。

```ts
// 生成フォームのバリデーションスキーマ
const generationSchema = z.object({
  prompt: z
    .string()
    .min(1, "プロンプトを入力してください")
    .max(500, "プロンプトは 500 文字以内で入力してください"),
  styleModelId: z.string().uuid().optional(),
});
```
