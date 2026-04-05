import { get, post, put, del } from "./client";
import type {
  User,
  PlanInfo,
  JobDetail,
  HistoryResponse,
  StyleModel,
  YouTubeVideo,
  LayerInfo,
  EditRecord,
} from "@/types/api";

// === Auth ===
export async function getOAuthURL(): Promise<{ url: string }> {
  return get("/auth/youtube/url");
}

export async function postOAuthCallback(code: string, state: string) {
  return post<{ userId: string; channelName: string; plan: string }>(
    "/auth/youtube/callback",
    { code, state },
  );
}

export async function refreshToken() {
  return post<{ accessToken: string }>("/auth/refresh");
}

export async function logout() {
  return del<void>("/auth/logout");
}

// === Users ===
export async function getMe(): Promise<User> {
  return get("/users/me");
}

export async function getMyPlan(): Promise<PlanInfo> {
  return get("/users/me/plan");
}

// === Generate ===
export async function createGenerationJob(
  prompt: string,
  styleModelId?: string,
) {
  return post<{ jobId: string; status: string }>("/generate", {
    prompt,
    styleModelId,
  });
}

export async function getJobStatus(jobId: string): Promise<JobDetail> {
  return get(`/generate/${jobId}`);
}

export async function getHistory(
  limit = 20,
  offset = 0,
): Promise<HistoryResponse> {
  return get(`/generate/history?limit=${limit}&offset=${offset}`);
}

// === Segment / Layers ===
export async function segmentJob(jobId: string) {
  return post<{
    jobId: string;
    layers: Array<{ label: string; s3Key: string }>;
  }>(`/generate/${jobId}/segment`);
}

export async function getLayers(jobId: string) {
  return get<{ jobId: string; layers: LayerInfo[]; psdUrl?: string }>(
    `/generate/${jobId}/layers`,
  );
}

// === Edit ===
export async function editThumbnail(jobId: string, operations: unknown[]) {
  return post<{
    jobId: string;
    layers: Record<string, string>;
    unchangedLayers: string[];
  }>(`/generate/${jobId}/edit`, { operations });
}

export async function getEditHistory(jobId: string) {
  return get<{ edits: EditRecord[] }>(`/generate/${jobId}/edits`);
}

// === Download ===
export async function getDownloadURL(
  thumbnailId: string,
  format = "png",
  layer?: string,
) {
  let path = `/thumbnails/${thumbnailId}/download?format=${format}`;
  if (layer) path += `&layer=${layer}`;
  return get<{ downloadUrl: string }>(path);
}

// === Style ===
export async function createLearnJob(name: string, imageUrls: string[]) {
  return post<{ modelId: string; status: string }>("/style/learn", {
    name,
    imageUrls,
  });
}

export async function getStyleModels() {
  return get<{ models: StyleModel[] }>("/style/models");
}

export async function getStyleModel(modelId: string): Promise<StyleModel> {
  return get(`/style/models/${modelId}`);
}

export async function deleteStyleModel(modelId: string) {
  return del<void>(`/style/models/${modelId}`);
}

// === YouTube ===
export async function getYouTubeVideos() {
  return get<{ videos: YouTubeVideo[] }>("/youtube/videos");
}

export async function updateVideoThumbnail(
  videoId: string,
  thumbnailId: string,
) {
  return put<{ status: string }>(`/youtube/videos/${videoId}/thumbnail`, {
    thumbnailId,
  });
}
