import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "./Select";

const options = [
  { value: "", label: "選択してください" },
  { value: "a", label: "オプションA" },
  { value: "b", label: "オプションB" },
];

describe("Select", () => {
  it("ラベルを表示する", () => {
    render(<Select label="カテゴリ" options={options} />);
    expect(screen.getByLabelText("カテゴリ")).toBeInTheDocument();
  });

  it("すべてのオプションを表示する", () => {
    render(<Select options={options} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("値を選択できる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select label="カテゴリ" options={options} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText("カテゴリ"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("エラーメッセージを表示する", () => {
    render(<Select options={options} error="選択が必要です" />);
    expect(screen.getByText("選択が必要です")).toBeInTheDocument();
  });
});
