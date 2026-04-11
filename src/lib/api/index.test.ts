import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/setup";
import {
  getOAuthURL,
  getMe,
  getMyPlan,
  createGenerationJob,
  getJobStatus,
  getHistory,
  getStyleModels,
  deleteStyleModel,
  getYouTubeVideos,
  updateVideoThumbnail,
  getDownloadURL,
  logout,
} from "./index";

const BASE = "http://localhost:8080/api/v1";

describe("Auth API", () => {
  it("getOAuthURL で OAuth URL を取得する", async () => {
    const result = await getOAuthURL();
    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
  });

  it("logout で 204 を返す", async () => {
    const result = await logout();
    expect(result).toBeUndefined();
  });
});

describe("Users API", () => {
  it("getMe でユーザー情報を取得する", async () => {
    const user = await getMe();
    expect(user.id).toBe("user-001");
    expect(user.channelName).toBe("ThumbnailPod Demo");
    expect(user.plan).toBe("creator");
  });

  it("getMyPlan でプラン情報を取得する", async () => {
    const plan = await getMyPlan();
    expect(plan.plan).toBe("creator");
    expect(plan.generationCountMonth).toBe(12);
    expect(plan.monthlyLimit).toBe(50);
    expect(plan.remaining).toBe(38);
  });
});

describe("Generate API", () => {
  it("createGenerationJob でジョブを作成する", async () => {
    const result = await createGenerationJob("テスト用プロンプト");
    expect(result.jobId).toBeDefined();
    expect(result.status).toBe("pending");
  });

  it("getJobStatus でジョブ詳細を取得する", async () => {
    const job = await getJobStatus("job-001");
    expect(job.jobId).toBeDefined();
    expect(job.status).toBe("completed");
    expect(job.prompt).toContain("衝撃");
  });

  it("getHistory で生成履歴を取得する", async () => {
    const history = await getHistory(3, 0);
    expect(history.jobs.length).toBeLessThanOrEqual(3);
    expect(history.totalCount).toBe(6);
  });

  it("getHistory のオフセットで結果が変わる", async () => {
    const page1 = await getHistory(2, 0);
    const page2 = await getHistory(2, 2);
    expect(page1.jobs[0].id).not.toBe(page2.jobs[0].id);
  });
});

describe("Style API", () => {
  it("getStyleModels でスタイルモデル一覧を取得する", async () => {
    const result = await getStyleModels();
    expect(result.models.length).toBe(3);
    expect(result.models[0].name).toBe("メインチャンネルスタイル");
    expect(result.models[0].status).toBe("ready");
  });

  it("deleteStyleModel で削除する", async () => {
    const result = await deleteStyleModel("model-001");
    expect(result).toBeUndefined();
  });
});

describe("YouTube API", () => {
  it("getYouTubeVideos で動画一覧を取得する", async () => {
    const result = await getYouTubeVideos();
    expect(result.videos.length).toBe(5);
    expect(result.videos[0].videoId).toBe("dQw4w9WgXcQ");
    expect(result.videos[0].title).toContain("AI");
  });

  it("updateVideoThumbnail でサムネイルを更新する", async () => {
    const result = await updateVideoThumbnail("dQw4w9WgXcQ", "thumb-001");
    expect(result.status).toBe("ok");
  });
});

describe("Download API", () => {
  it("getDownloadURL でダウンロード URL を取得する", async () => {
    const result = await getDownloadURL("thumb-001", "png");
    expect(result.downloadUrl).toBeDefined();
  });
});

describe("API エラーハンドリング", () => {
  it("500 エラーで ApiError がスローされる", async () => {
    server.use(
      http.get(`${BASE}/users/me`, () => {
        return HttpResponse.json(
          { error: "internal server error" },
          { status: 500 },
        );
      }),
    );

    await expect(getMe()).rejects.toMatchObject({ status: 500 });
  });

  it("401 エラーで ApiError がスローされる", async () => {
    server.use(
      http.get(`${BASE}/users/me`, () => {
        return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
      }),
    );

    await expect(getMe()).rejects.toMatchObject({ status: 401 });
  });
});
