import { describe, it, expect, vi, beforeEach } from "vitest";
import { toCamelCase, ApiError } from "./client";
import { server } from "@/test/setup";
import { http, HttpResponse } from "msw";
import { env } from "@/envs";

const BASE = env.apiBaseUrl;

describe("toCamelCase", () => {
  it("converts snake_case keys to camelCase", () => {
    const result = toCamelCase<{ jobId: string; createdAt: string }>({
      job_id: "abc",
      created_at: "2024-01-01",
    });
    expect(result).toEqual({ jobId: "abc", createdAt: "2024-01-01" });
  });

  it("handles nested objects", () => {
    const result = toCamelCase<{ user: { channelName: string } }>({
      user: { channel_name: "test" },
    });
    expect(result).toEqual({ user: { channelName: "test" } });
  });

  it("handles arrays", () => {
    const result = toCamelCase<Array<{ jobId: string }>>([
      { job_id: "a" },
      { job_id: "b" },
    ]);
    expect(result).toEqual([{ jobId: "a" }, { jobId: "b" }]);
  });

  it("returns primitives as-is", () => {
    expect(toCamelCase<string>("hello")).toBe("hello");
    expect(toCamelCase<number>(42)).toBe(42);
    expect(toCamelCase<null>(null)).toBeNull();
  });
});

describe("API client requests", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("GET request returns camelCase data", async () => {
    const { get } = await import("./client");
    const result = await get<{ id: string; channelName: string }>("/users/me");
    expect(result.id).toBe("user-001");
    expect(result.channelName).toBe("ThumbnailPod Demo");
  });

  it("POST request works", async () => {
    const { post } = await import("./client");
    const result = await post<{ jobId: string; status: string }>("/generate", {
      prompt: "test",
    });
    expect(result.status).toBe("pending");
  });

  it("PUT request works", async () => {
    server.use(
      http.put(`${BASE}/test/put`, () => {
        return HttpResponse.json({ result: "ok" });
      }),
    );
    const { put } = await import("./client");
    const result = await put<{ result: string }>("/test/put", { data: "test" });
    expect(result.result).toBe("ok");
  });

  it("DELETE request works", async () => {
    const { del } = await import("./client");
    const result = await del("/auth/logout");
    expect(result).toBeUndefined();
  });

  it("throws ApiError on non-ok responses", async () => {
    server.use(
      http.get(`${BASE}/test/error`, () => {
        return HttpResponse.json({ detail: "Unauthorized" }, { status: 401 });
      }),
    );
    const { get } = await import("./client");
    await expect(get("/test/error")).rejects.toThrow(ApiError);
  });

  it("handles 204 No Content", async () => {
    server.use(
      http.delete(`${BASE}/test/no-content`, () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const { del } = await import("./client");
    const result = await del("/test/no-content");
    expect(result).toBeUndefined();
  });
});
