import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Textarea from "./Textarea";

describe("Textarea", () => {
  it("ラベルを表示する", () => {
    render(<Textarea label="説明" />);
    expect(screen.getByLabelText("説明")).toBeInTheDocument();
  });

  it("テキストを入力できる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea label="メモ" onChange={onChange} />);

    await user.type(screen.getByLabelText("メモ"), "テスト入力");
    expect(onChange).toHaveBeenCalled();
  });

  it("エラーメッセージを表示する", () => {
    render(<Textarea label="プロンプト" error="入力が必要です" />);
    expect(screen.getByText("入力が必要です")).toBeInTheDocument();
  });

  it("ヒントを表示する", () => {
    render(<Textarea label="メモ" hint="最大1000文字" />);
    expect(screen.getByText("最大1000文字")).toBeInTheDocument();
  });

  it("placeholder を表示する", () => {
    render(<Textarea placeholder="ここに入力" />);
    expect(screen.getByPlaceholderText("ここに入力")).toBeInTheDocument();
  });
});
