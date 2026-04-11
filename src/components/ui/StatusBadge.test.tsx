import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it("Completed ステータスを表示する", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("Processing ステータスを表示する", () => {
    render(<StatusBadge status="processing" />);
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });

  it("Pending ステータスを表示する", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("Failed ステータスを表示する", () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("Training ステータスを表示する", () => {
    render(<StatusBadge status="training" />);
    expect(screen.getByText("Training")).toBeInTheDocument();
  });

  it("Ready ステータスを表示する", () => {
    render(<StatusBadge status="ready" />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });

  it("未知のステータスでもそのまま表示する", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });
});
