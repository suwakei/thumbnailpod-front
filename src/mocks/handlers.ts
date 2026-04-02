import { http, HttpResponse } from 'msw';
import {
  mockUser,
  mockPlanInfo,
  mockJobs,
  mockJobDetail,
  mockStyleModels,
  mockYouTubeVideos,
  mockLayers,
} from './data';

const BASE = 'http://localhost:8080/api/v1';

export const handlers = [
  // Auth
  http.get(`${BASE}/auth/youtube/url`, () => {
    return HttpResponse.json({ url: '/login?mock=true' });
  }),

  http.post(`${BASE}/auth/youtube/callback`, () => {
    return HttpResponse.json({
      user_id: mockUser.id,
      channel_name: mockUser.channel_name,
      plan: mockUser.plan,
    });
  }),

  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json({ access_token: 'mock-token' });
  }),

  http.delete(`${BASE}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Users
  http.get(`${BASE}/users/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.get(`${BASE}/users/me/plan`, () => {
    return HttpResponse.json(mockPlanInfo);
  }),

  // Generate
  http.post(`${BASE}/generate`, () => {
    return HttpResponse.json(
      { job_id: `job-${Date.now()}`, status: 'pending' },
      { status: 201 },
    );
  }),

  http.get(`${BASE}/generate/history`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || 20);
    const offset = Number(url.searchParams.get('offset') || 0);
    const sliced = mockJobs.slice(offset, offset + limit);
    return HttpResponse.json({
      jobs: sliced,
      total_count: mockJobs.length,
      limit,
      offset,
    });
  }),

  http.get(`${BASE}/generate/:jobId`, ({ params }) => {
    const job = mockJobs.find((j) => j.id === params.jobId);
    if (!job) {
      return HttpResponse.json(
        { ...mockJobDetail, job_id: params.jobId },
      );
    }
    return HttpResponse.json({
      job_id: job.id,
      status: job.status,
      prompt: job.prompt,
      created_at: job.created_at,
      image_url: null,
      thumbnail_id: job.status === 'completed' ? `thumb-${job.id}` : null,
      error: job.error_message,
    });
  }),

  // Segment / Layers
  http.post(`${BASE}/generate/:jobId/segment`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: mockLayers.map((l) => ({ label: l.label, s3_key: `s3/${l.label}.png` })),
    });
  }),

  http.get(`${BASE}/generate/:jobId/layers`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: mockLayers,
      psd_url: null,
    });
  }),

  // Edit
  http.post(`${BASE}/generate/:jobId/edit`, ({ params }) => {
    return HttpResponse.json({
      job_id: params.jobId,
      layers: {},
      unchanged_layers: [],
    });
  }),

  http.get(`${BASE}/generate/:jobId/edits`, () => {
    return HttpResponse.json({ edits: [] });
  }),

  // Download
  http.get(`${BASE}/thumbnails/:id/download`, () => {
    return HttpResponse.json({ download_url: '#mock-download' });
  }),

  // Style
  http.post(`${BASE}/style/learn`, () => {
    return HttpResponse.json(
      { model_id: `model-${Date.now()}`, status: 'pending' },
      { status: 201 },
    );
  }),

  http.get(`${BASE}/style/models`, () => {
    return HttpResponse.json({ models: mockStyleModels });
  }),

  http.get(`${BASE}/style/models/:modelId`, ({ params }) => {
    const model = mockStyleModels.find((m) => m.id === params.modelId);
    return HttpResponse.json(model || mockStyleModels[0]);
  }),

  http.delete(`${BASE}/style/models/:modelId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // YouTube
  http.get(`${BASE}/youtube/videos`, () => {
    return HttpResponse.json({ videos: mockYouTubeVideos });
  }),

  http.put(`${BASE}/youtube/videos/:videoId/thumbnail`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
