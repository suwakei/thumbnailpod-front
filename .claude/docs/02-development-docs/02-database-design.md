# クライアントサイド状態・データ管理設計

フロントエンドには DB は存在しない。このドキュメントはクライアントサイドのデータ管理戦略を定義する。

---

## 状態の種類と管理方針

| 状態の種類                         | 管理方法                              | 例                           |
| ---------------------------------- | ------------------------------------- | ---------------------------- |
| サーバーデータ（読み取り）         | Server Component でフェッチ           | 生成履歴、スタイルモデル一覧 |
| サーバーデータ（変更・ポーリング） | TanStack Query（Client Component）    | ジョブステータス、楽観的更新 |
| UI ローカル状態                    | `useState` / `useReducer`             | フォーム入力、モーダル開閉   |
| 認証状態                           | Server Component（セッション Cookie） | ユーザー情報、プラン         |
| フォーム状態                       | React Hook Form                       | バリデーション付きフォーム   |

---

## サーバーデータのキャッシュ戦略

Next.js の `fetch` に `cache` / `next.revalidate` を明示する。

```ts
// 静的（ビルド時取得）
fetch(url, { cache: "force-cache" });

// リアルタイム（毎回フェッチ）
fetch(url, { cache: "no-store" });

// 時間ベース再検証（60 秒ごと）
fetch(url, { next: { revalidate: 60 } });

// タグベース再検証（Server Action で revalidateTag を呼ぶ）
fetch(url, { next: { tags: ["generation-history"] } });
```

### キャッシュ方針の目安

| データ                           | 方針                            | 理由                   |
| -------------------------------- | ------------------------------- | ---------------------- |
| 生成履歴一覧                     | `revalidateTag` + Server Action | 新規生成後にのみ再取得 |
| ジョブステータス（ポーリング中） | `no-store`                      | 常に最新状態が必要     |
| スタイルモデル一覧               | `revalidate: 30`                | 変更頻度が低い         |
| ユーザープロフィール             | `no-store`                      | プラン変更を即時反映   |
| YouTube 動画一覧                 | `revalidate: 300`               | 変更頻度が低い         |

---

## TanStack Query の使用基準

以下の場合に TanStack Query（`@tanstack/react-query`）を使う：

- **ポーリング**が必要（生成ジョブの完了待機）
- **楽観的更新**が必要（即座に UI を更新してバックグラウンドで同期）
- **無限スクロール**（生成履歴のページング）
- Client Component からフェッチしてキャッシュ・再利用したい

```ts
// hooks/useGenerationJob.ts
import { useQuery } from "@tanstack/react-query";
import { getGenerationJob } from "@/lib/api/generate";

export function useGenerationJob(jobId: string) {
  return useQuery({
    queryKey: ["generation-job", jobId],
    queryFn: () => getGenerationJob(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 2000 : false;
    },
    staleTime: 0,
  });
}
```

---

## フォームのバリデーション

フォームには React Hook Form + Zod を使う。

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(1, "プロンプトを入力してください").max(500),
  styleModelId: z.string().uuid().optional(),
});

type FormValues = z.infer<typeof schema>;
```

---

## グローバル状態管理

グローバル状態は最小限にする。現状で必要なグローバル状態：

- 認証ユーザー情報（Server Component で Cookie から取得。Context で子に渡す）
- トースト通知（UI フィードバック）

Redux・Zustand 等の状態管理ライブラリは、Server Components で解決できない場合のみ導入を検討する。

---

## ローカルストレージの使用禁止

- JWT・認証情報を `localStorage` / `sessionStorage` に保存しない（XSS リスク）
- 認証トークンは HttpOnly Cookie でバックエンドが管理する
- ユーザー設定の永続化が必要な場合は Cookie または Server 側での保存を検討する
