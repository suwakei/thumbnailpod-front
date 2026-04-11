import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImageIcon } from "lucide-react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("タイトルを表示する", () => {
    render(<EmptyState icon={ImageIcon} title="データがありません" />);
    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });

  it("説明文を表示する", () => {
    render(
      <EmptyState
        icon={ImageIcon}
        title="空です"
        description="新しいアイテムを作成してください"
      />,
    );
    expect(
      screen.getByText("新しいアイテムを作成してください"),
    ).toBeInTheDocument();
  });

  it("children を表示する", () => {
    render(
      <EmptyState icon={ImageIcon} title="空です">
        <button>作成する</button>
      </EmptyState>,
    );
    expect(
      screen.getByRole("button", { name: "作成する" }),
    ).toBeInTheDocument();
  });

  it("description が未指定の場合は説明文を表示しない", () => {
    const { container } = render(
      <EmptyState icon={ImageIcon} title="空です" />,
    );
    expect(container.querySelector("p")).toBeNull();
  });
});
