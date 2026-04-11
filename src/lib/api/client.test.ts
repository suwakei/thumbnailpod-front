import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/setup";
import { get, post, put, del, ApiError, toCamelCase } from "./client";

const BASE = "http://localhost:8080/api/v1";

describe("toCamelCase", () => {
  it("snake_case のキーを camelCase に変換する", () => {
    const input = { user_id: "1", channel_name: "test", created_at: "2024" };
    const result = toCamelCase<Record<string, string>>(input);
    expect(result).toEqual({
      userId: "1",
      channelName: "test",
      createdAt: "2024",
    });
  });

  it("ネストされたオブジェクトも変換する", () => {
    const input = { outer_key: { inner_key: "value" } };
    const result = toCamelCase<Record<string, unknown>>(input);
    expect(result).toEqual({ outerKey: { innerKey: "value" } });
  });

  it("配列内のオブジェクトも変換する", () => {
    const input = [{ item_id: "1" }, { item_id: "2" }];
    const result = toCamelCase<Array<Record<string, string>>>(input);
    expect(result).toEqual([{ itemId: "1" }, { itemId: "2" }]);
  });

  it("プリミティブ値はそのまま返す", () => {
    expect(toCamelCase<string>("hello")).toBe("hello");
    expect(toCamelCase<number>(42)).toBe(42);
    expect(toCamelCase<null>(null)).toBeNull();
  });
});

describe("get", () => {
  it("GET リクエストでデータを取得し camelCase に変換する", async () => {
    server.use(
      http.get(`${BASE}/test`, () => {
        return HttpResponse.json({ test_key: "value" });
      }),
    );

    const result = await get<{ testKey: string }>("/test");
    expect(result.testKey).toBe("value");
  });

  it("404 エラーで ApiError をスローする", async () => {
    server.use(
      http.get(`${BASE}/not-found`, () => {
        return HttpResponse.json({ error: "not found" }, { status: 404 });
      }),
    );

    await expect(get("/not-found")).rejects.toThrow(ApiError);
    await expect(get("/not-found")).rejects.toMatchObject({ status: 404 });
  });
});

describe("post", () => {
  it("POST リクエストでデータを送信する", async () => {
    server.use(
      http.post(`${BASE}/create`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { id: "new-1", received_prompt: body.prompt },
          { status: 201 },
        );
      }),
    );

    const result = await post<{ id: string; receivedPrompt: string }>(
      "/create",
      { prompt: "test prompt" },
    );
    expect(result.id).toBe("new-1");
    expect(result.receivedPrompt).toBe("test prompt");
  });

  it("リクエストボディを snake_case に変換して送信する", async () => {
    server.use(
      http.post(`${BASE}/check-body`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          has_style_model_id: "styleModelId" in body ? "no" : "yes",
          received_key: Object.keys(body)[0],
        });
      }),
    );

    const result = await post<{
      hasStyleModelId: string;
      receivedKey: string;
    }>("/check-body", { styleModelId: "model-1" });
    expect(result.receivedKey).toBe("style_model_id");
  });
});

describe("put", () => {
  it("PUT リクエストを送信する", async () => {
    server.use(
      http.put(`${BASE}/update/1`, () => {
        return HttpResponse.json({ status: "ok" });
      }),
    );

    const result = await put<{ status: string }>("/update/1", {
      name: "updated",
    });
    expect(result.status).toBe("ok");
  });
});

describe("del", () => {
  it("DELETE リクエストで 204 を処理する", async () => {
    server.use(
      http.delete(`${BASE}/remove/1`, () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const result = await del<void>("/remove/1");
    expect(result).toBeUndefined();
  });
});
