import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("子要素を表示する", () => {
    render(<Card>カード内容</Card>);
    expect(screen.getByText("カード内容")).toBeInTheDocument();
  });

  it("className を追加できる", () => {
    const { container } = render(
      <Card className="custom">テスト</Card>,
    );
    expect(container.firstChild).toHaveClass("custom");
  });

  it("padding=none で padding なしになる", () => {
    const { container } = render(
      <Card padding="none">テスト</Card>,
    );
    expect(container.firstChild).toHaveClass("padnone");
  });
});
