import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

// Mock API
vi.mock("@/lib/api", () => ({
  getOAuthURL: vi
    .fn()
    .mockResolvedValue({ url: "https://accounts.google.com/oauth" }),
}));

describe("LoginPage", () => {
  it("renders the app title", () => {
    render(<LoginPage />);
    expect(screen.getByText("ThumbnailPod")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<LoginPage />);
    expect(screen.getByText("AI Thumbnail Studio")).toBeInTheDocument();
  });

  it("renders the login button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /YouTubeアカウントでログイン/i }),
    ).toBeInTheDocument();
  });

  it("renders feature descriptions", () => {
    render(<LoginPage />);
    expect(screen.getByText("スタイル学習")).toBeInTheDocument();
    expect(screen.getByText("ワンクリック生成")).toBeInTheDocument();
    expect(screen.getByText("YouTube直接更新")).toBeInTheDocument();
  });

  it("login button triggers OAuth flow", async () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
    });

    render(<LoginPage />);
    const btn = screen.getByRole("button", {
      name: /YouTubeアカウントでログイン/i,
    });
    await userEvent.click(btn);

    // Wait for async to resolve
    await vi.waitFor(() => {
      expect(window.location.href).toBe("https://accounts.google.com/oauth");
    });

    // Restore
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });
});
