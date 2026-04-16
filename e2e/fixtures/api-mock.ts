import type { Page, Route } from '@playwright/test';

type Handler = (route: Route) => Promise<void> | void;

function corsHeaders(route: Route): Record<string, string> {
  const origin = route.request().headers()['origin'] ?? '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

/**
 * Intercepts the frontend's backend API calls (NEXT_PUBLIC_API_URL points to
 * http://127.0.0.1:9999/api/v1 during e2e). Because the frontend runs on a
 * different origin, every fulfilled response must carry CORS headers or the
 * browser blocks it. OPTIONS preflights are auto-answered.
 */
export class ApiMock {
  private handlers: Array<{ match: RegExp | string; method?: string; handler: Handler }> = [];

  constructor(private page: Page) {}

  async install() {
    await this.page.route('**/api/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const pathname = url.pathname.replace(/^\/api\/v1/, '');
      const method = route.request().method();

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: corsHeaders(route) });
        return;
      }

      for (const entry of this.handlers) {
        if (entry.method && entry.method !== method) continue;
        const matched =
          typeof entry.match === 'string'
            ? entry.match === pathname
            : entry.match.test(pathname);
        if (matched) {
          await entry.handler(wrapRoute(route));
          return;
        }
      }

      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        headers: corsHeaders(route),
        body: JSON.stringify({ error: `unmocked ${method} ${pathname}` }),
      });
    });
  }

  on(method: string, match: RegExp | string, handler: Handler) {
    this.handlers.push({ method, match, handler });
    return this;
  }

  get(match: RegExp | string, handler: Handler) {
    return this.on('GET', match, handler);
  }

  post(match: RegExp | string, handler: Handler) {
    return this.on('POST', match, handler);
  }

  json(match: RegExp | string, body: unknown, status = 200) {
    return this.get(match, (route) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      }),
    );
  }
}

/**
 * Wraps `route.fulfill` so any response a handler emits automatically gains
 * the CORS headers it needs to pass the browser's preflight check. Other
 * methods on Route are passed through unchanged.
 */
function wrapRoute(route: Route): Route {
  const originalFulfill = route.fulfill.bind(route);
  const wrappedFulfill: Route['fulfill'] = async (options = {}) => {
    const headers = { ...corsHeaders(route), ...(options.headers ?? {}) };
    return originalFulfill({ ...options, headers });
  };
  return new Proxy(route, {
    get(target, prop, receiver) {
      if (prop === 'fulfill') return wrappedFulfill;
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

/**
 * Helper that wraps a raw `page.route` handler to attach CORS headers to its
 * fulfilled response. Use this when registering routes directly on the page
 * (outside of the ApiMock helper) so they stay compatible with the browser's
 * cross-origin rules.
 */
export function withCors(handler: Handler): Handler {
  return (route) => handler(wrapRoute(route));
}

/**
 * Seeds the `access_token` cookie the Next middleware (`src/proxy.ts`) checks
 * to gate private routes. No value is validated by the backend — mocks
 * intercept all API calls — so any non-empty string works.
 */
export async function seedAuthCookie(page: Page) {
  await page.context().addCookies([
    {
      name: 'access_token',
      value: 'e2e-fake-token',
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}
