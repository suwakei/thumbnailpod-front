import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";

vi.mock("@/lib/api", () => ({
  getOAuthURL: vi.fn().mockResolvedValue({ url: "https://accounts.google.com/oauth" }),
}));

describe("LoginPage", () => {
  it("タイトルを表示する", () => {
    render(<LoginPage />);
    expect(screen.getByText("ThumbnailPod")).toBeInTheDocument();
  });

  it("ログインボタンを表示する", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /YouTubeアカウントでログイン/i }),
    ).toBeInTheDocument();
  });

  it("機能紹介を表示する", () => {
    render(<LoginPage />);
    expect(screen.getByText("スタイル学習")).toBeInTheDocument();
    expect(screen.getByText("ワンクリック生成")).toBeInTheDocument();
    expect(screen.getByText("YouTube直接更新")).toBeInTheDocument();
  });

  it("説明テキストを表示する", () => {
    render(<LoginPage />);
    expect(
      screen.getByText(/クリック率を最大化するサムネイルを自動生成/),
    ).toBeInTheDocument();
  });

  it("ログインボタンをクリックするとローディング状態になる", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const btn = screen.getByRole("button", {
      name: /YouTubeアカウントでログイン/i,
    });
    await user.click(btn);
    expect(btn).toBeDisabled();
  });
});
