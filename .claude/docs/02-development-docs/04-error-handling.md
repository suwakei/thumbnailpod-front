# エラーハンドリング規則

## 基本方針

- エラーは **発生した場所に応じた適切な方法** で処理する
- **内部エラーの詳細をユーザーに見せない**（スタックトレース・API エラー詳細等）
- ユーザーには「何が起きたか」と「次に何をすべきか」を伝える
- ネットワークエラーと API エラーを区別して扱う

---

## エラーの種類

| 種類                    | 説明                             | 対応                                 |
| ----------------------- | -------------------------------- | ------------------------------------ |
| ネットワークエラー      | fetch 自体が失敗（オフライン等） | リトライ案内                         |
| `400 Bad Request`       | 入力値が不正                     | フォームバリデーションで事前防止     |
| `401 Unauthorized`      | 未認証・トークン期限切れ         | 自動リフレッシュ or ログインページへ |
| `403 Forbidden`         | 権限なし                         | エラーメッセージ表示                 |
| `404 Not Found`         | リソースが存在しない             | `notFound()` または専用 UI           |
| `429 Too Many Requests` | 月次生成上限超過                 | プランアップグレード案内             |
| `500`                   | サーバー内部エラー               | 汎用エラーメッセージ + リトライ      |

---

## Server Component のエラーハンドリング

### `error.tsx` ファイルによる Error Boundary

各ルートセグメントに `error.tsx` を置くことで、Server Component のエラーをキャッチできる。

```tsx
// app/(dashboard)/error.tsx
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <p>問題が発生しました。しばらくしてから再試行してください。</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

### `notFound()` / `redirect()` の使用

```tsx
// app/(dashboard)/history/[jobId]/page.tsx
import { notFound } from "next/navigation";
import { getGenerationJob } from "@/lib/api/generate";
import { ApiError } from "@/lib/api/error";

export default async function JobPage({
  params,
}: {
  params: { jobId: string };
}) {
  try {
    const job = await getGenerationJob(params.jobId);
    return <JobDetail job={job} />;
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) notFound();
    throw e; // error.tsx に委譲
  }
}
```

---

## Client Component のエラーハンドリング

### フォーム送信エラー

```tsx
"use client";

export function GenerationForm() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(prompt: string) {
    setError(null);
    try {
      await createGenerationJob(prompt);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(getErrorMessage(e));
      } else {
        setError("ネットワークエラーが発生しました。再試行してください。");
      }
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {/* フォーム */}
    </>
  );
}
```

### `getErrorMessage` ヘルパー

```ts
// lib/api/error.ts
export function getErrorMessage(error: ApiError): string {
  switch (error.status) {
    case 429:
      return "月次生成上限に達しました。プランをアップグレードしてください。";
    case 403:
      return "この操作を行う権限がありません。";
    case 404:
      return "リソースが見つかりません。";
    default:
      return "予期しないエラーが発生しました。しばらくしてから再試行してください。";
  }
}
```

---

## フォームバリデーションエラー

入力値の検証エラーは Zod + React Hook Form でクライアントサイドで事前に防ぐ。
サーバー側の `400` レスポンスは「フォールバック」として扱い、フォームのエラー表示に反映する。

```ts
// React Hook Form + Zod の例
const {
  formState: { errors },
} = useForm({ resolver: zodResolver(schema) });
// errors.prompt.message でフィールドごとのエラーを表示
```

---

## 401 の自動リフレッシュ

`lib/api/client.ts` の fetch ラッパーで 401 発生時に自動リフレッシュを試みる。
リフレッシュ失敗（refresh token も期限切れ）は `/login` にリダイレクト。

```ts
async function tryRefreshToken(): Promise<boolean> {
  try {
    await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return true;
  } catch {
    return false;
  }
}
```

---

## エラーログ

- `console.error` はエラーログ目的のみ（開発時のデバッグ）
- 本番環境では Sentry 等のエラートラッキングサービスへ送信する（将来対応）
- ユーザーへの表示と内部ログは分離する（内部詳細をユーザーに見せない）

```ts
// Client Component
} catch (e) {
  console.error('[GenerationForm] createGenerationJob failed:', e);
  setError('エラーが発生しました。');
}
```
