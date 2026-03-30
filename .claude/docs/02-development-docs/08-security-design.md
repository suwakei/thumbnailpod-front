# セキュリティ設計

## 認証・認可

### 認証トークンの保管

- JWT は **HttpOnly Cookie** に保管する（バックエンドが設定）
- `localStorage` / `sessionStorage` への保管禁止（XSS で窃取されるリスク）
- Cookie には `Secure`（HTTPS のみ）・`SameSite=None`（クロスサイト Cookie 許可）を設定

### フロントエンドでの認証チェック

- 認証チェックは Server Component で行う（`(dashboard)/layout.tsx`）
- クライアントサイドのみの認証ガードは補助的なもの（UX 向上目的）に限定
- セッション有無はサーバーサイドでのみ信頼する

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <>{children}</>;
}
```

---

## XSS 対策

### React のデフォルト保護を活用する

React は JSX での変数展開を自動でエスケープする。以下は禁止：

```tsx
// 禁止：dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />;

// 禁止：innerHTML の直接操作
element.innerHTML = userContent;
```

ユーザー入力をそのまま HTML として出力する必要がある場合は、`DOMPurify` でサニタイズしてから使う。

### Content Security Policy (CSP)

`next.config.ts` に CSP ヘッダーを設定する。

```ts
// next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js は unsafe-eval が必要
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://api.thumbnailpod.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

export default {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

---

## CSRF 対策

- バックエンドが Cookie の `SameSite=None` + カスタムヘッダーで CSRF 対策を行う
- フロントエンドは全ての API リクエストに `Content-Type: application/json` を付与する
- フォームの `action` に外部 URL を指定しない

---

## 環境変数のセキュリティ

| プレフィックス | 公開範囲             | 用途                            |
| -------------- | -------------------- | ------------------------------- |
| `NEXT_PUBLIC_` | ブラウザに公開される | API ベース URL・アプリ URL のみ |
| （なし）       | サーバーサイドのみ   | シークレット・内部 URL          |

```ts
// 正：公開情報のみ NEXT_PUBLIC_
NEXT_PUBLIC_API_BASE_URL=https://api.thumbnailpod.com

// 誤：シークレット情報を NEXT_PUBLIC_ に入れない
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=...  // ← 絶対禁止
```

---

## 入力バリデーション

### Server Actions・Route Handlers での必須バリデーション

外部入力はすべて Zod でバリデーションしてから使う。

```ts
// app/api/generate/route.ts
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(1).max(500),
  style_model_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return Response.json({ message: "invalid request" }, { status: 400 });
  }
  // result.data を使う
}
```

---

## オープンリダイレクト対策

OAuth コールバックでリダイレクト先 URL を動的に受け取る場合は、ホワイトリストで検証する。

```ts
const ALLOWED_REDIRECT_ORIGINS = [process.env.NEXT_PUBLIC_APP_URL];

function isSafeRedirect(url: string): boolean {
  try {
    const parsed = new URL(url, process.env.NEXT_PUBLIC_APP_URL);
    return ALLOWED_REDIRECT_ORIGINS.includes(parsed.origin);
  } catch {
    return false;
  }
}
```

---

## npm 依存関係の脆弱性管理

- `npm audit --audit-level=high` を CI で定期実行する
- High / Critical の脆弱性は即時対応（パッチバージョンアップまたは代替ライブラリへの移行）
- `npm audit fix` を使う前に変更内容を確認する
