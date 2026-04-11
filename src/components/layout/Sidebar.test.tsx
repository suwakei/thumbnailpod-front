import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar", () => {
  it("renders logo text", () => {
    render(<Sidebar />);
    expect(screen.getByText("ThumbnailPod")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows channel name in footer", () => {
    render(<Sidebar channelName="Test Channel" plan="creator" />);
    expect(screen.getByText("Test Channel")).toBeInTheDocument();
    expect(screen.getByText("creator plan")).toBeInTheDocument();
  });

  it("defaults to User when no channel name", () => {
    render(<Sidebar />);
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("free plan")).toBeInTheDocument();
  });

  it("shows admin link for admin role", () => {
    render(<Sidebar role="admin" />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
