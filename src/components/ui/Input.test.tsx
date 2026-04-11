import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "./Input";

describe("Input", () => {
  it("ラベルを表示する", () => {
    render(<Input label="メール" />);
    expect(screen.getByLabelText("メール")).toBeInTheDocument();
  });

  it("テキストを入力できる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="名前" onChange={onChange} />);

    await user.type(screen.getByLabelText("名前"), "テスト");
    expect(onChange).toHaveBeenCalled();
  });

  it("エラーメッセージを表示する", () => {
    render(<Input label="名前" error="必須項目です" />);
    expect(screen.getByText("必須項目です")).toBeInTheDocument();
  });

  it("ヒントテキストを表示する", () => {
    render(<Input label="名前" hint="任意" />);
    expect(screen.getByText("任意")).toBeInTheDocument();
  });

  it("エラー時はヒントが非表示になる", () => {
    render(<Input label="名前" error="エラー" hint="ヒント" />);
    expect(screen.getByText("エラー")).toBeInTheDocument();
    expect(screen.queryByText("ヒント")).not.toBeInTheDocument();
  });

  it("placeholder を表示する", () => {
    render(<Input placeholder="入力してください" />);
    expect(
      screen.getByPlaceholderText("入力してください"),
    ).toBeInTheDocument();
  });
});
