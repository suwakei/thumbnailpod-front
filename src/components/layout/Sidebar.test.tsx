import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar", () => {
  it("ロゴテキストを表示する", () => {
    render(<Sidebar />);
    expect(screen.getByText("ThumbnailPod")).toBeInTheDocument();
  });

  it("全ナビゲーションリンクを表示する", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Style Models")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("チャンネル名を表示する", () => {
    render(<Sidebar channelName="テストチャンネル" plan="creator" />);
    expect(screen.getByText("テストチャンネル")).toBeInTheDocument();
    expect(screen.getByText("creator plan")).toBeInTheDocument();
  });

  it("チャンネル名未指定時はデフォルト値を表示する", () => {
    render(<Sidebar />);
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("free plan")).toBeInTheDocument();
  });

  it("アバターにチャンネル名の頭文字を表示する", () => {
    render(<Sidebar channelName="ThumbnailPod" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });
});
