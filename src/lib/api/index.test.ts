import { describe, it, expect, vi, beforeEach } from "vitest";
import * as client from "./client";
import {
  getOAuthURL,
  postOAuthCallback,
  refreshToken,
  logout,
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
} from "./index";

vi.mock("./client", () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  toCamelCase: vi.fn((v) => v),
  ApiError: class extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
      super(`API Error ${status}`);
      this.status = status;
      this.body = body;
    }
  },
}));

const mockGet = vi.mocked(client.get);
const mockPost = vi.mocked(client.post);
const mockPut = vi.mocked(client.put);
const mockDel = vi.mocked(client.del);

describe("API functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auth", () => {
    it("getOAuthURL calls get", async () => {
      mockGet.mockResolvedValueOnce({ url: "https://accounts.google.com" });
      const result = await getOAuthURL();
      expect(result).toEqual({ url: "https://accounts.google.com" });
      expect(mockGet).toHaveBeenCalledWith("/auth/youtube/url");
    });

    it("postOAuthCallback calls post", async () => {
      mockPost.mockResolvedValueOnce({
        userId: "u1",
        channelName: "Ch",
        plan: "free",
      });
      await postOAuthCallback("code123", "state456");
      expect(mockPost).toHaveBeenCalledWith("/auth/youtube/callback", {
        code: "code123",
        state: "state456",
      });
    });

    it("refreshToken calls post", async () => {
      mockPost.mockResolvedValueOnce({ accessToken: "new-token" });
      await refreshToken();
      expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
    });

    it("logout calls del", async () => {
      mockDel.mockResolvedValueOnce(undefined);
      await logout();
      expect(mockDel).toHaveBeenCalledWith("/auth/logout");
    });
  });

  describe("Users", () => {
    it("getMe fetches current user", async () => {
      mockGet.mockResolvedValueOnce({ id: "u1", channelName: "Test" });
      const user = await getMe();
      expect(user).toEqual({ id: "u1", channelName: "Test" });
    });

    it("getMyPlan fetches plan info", async () => {
      mockGet.mockResolvedValueOnce({ plan: "creator", remaining: 38 });
      const plan = await getMyPlan();
      expect(plan.plan).toBe("creator");
    });
  });

  describe("Generate", () => {
    it("createGenerationJob posts prompt", async () => {
      mockPost.mockResolvedValueOnce({ jobId: "j1", status: "pending" });
      const result = await createGenerationJob("test prompt", "model-1");
      expect(mockPost).toHaveBeenCalledWith("/generate", {
        prompt: "test prompt",
        styleModelId: "model-1",
      });
      expect(result.jobId).toBe("j1");
    });

    it("getJobStatus fetches job detail", async () => {
      mockGet.mockResolvedValueOnce({ jobId: "j1", status: "completed" });
      const detail = await getJobStatus("j1");
      expect(detail.status).toBe("completed");
    });

    it("getHistory fetches paginated results", async () => {
      mockGet.mockResolvedValueOnce({
        jobs: [],
        totalCount: 0,
        limit: 20,
        offset: 0,
      });
      await getHistory(20, 0);
      expect(mockGet).toHaveBeenCalledWith(
        "/generate/history?limit=20&offset=0",
      );
    });
  });

  describe("Style", () => {
    it("getStyleModels fetches all models", async () => {
      mockGet.mockResolvedValueOnce({ models: [{ id: "m1" }] });
      const result = await getStyleModels();
      expect(result.models).toHaveLength(1);
    });

    it("deleteStyleModel calls del", async () => {
      mockDel.mockResolvedValueOnce(undefined);
      await deleteStyleModel("m1");
      expect(mockDel).toHaveBeenCalledWith("/style/models/m1");
    });
  });

  describe("YouTube", () => {
    it("getYouTubeVideos fetches videos", async () => {
      mockGet.mockResolvedValueOnce({ videos: [{ videoId: "v1" }] });
      const result = await getYouTubeVideos();
      expect(result.videos).toHaveLength(1);
    });

    it("updateVideoThumbnail calls put", async () => {
      mockPut.mockResolvedValueOnce({ status: "ok" });
      await updateVideoThumbnail("v1", "t1");
      expect(mockPut).toHaveBeenCalledWith("/youtube/videos/v1/thumbnail", {
        thumbnailId: "t1",
      });
    });
  });

  describe("Download", () => {
    it("getDownloadURL returns URL", async () => {
      mockGet.mockResolvedValueOnce({
        downloadUrl: "https://s3.example.com/dl",
      });
      const result = await getDownloadURL("t1", "png");
      expect(result.downloadUrl).toBe("https://s3.example.com/dl");
    });
  });
});
