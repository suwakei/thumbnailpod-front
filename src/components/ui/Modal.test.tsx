import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    };
});

describe("Modal", () => {
  it("open=true でタイトルと内容を表示する", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="確認">
        <p>本当に削除しますか？</p>
      </Modal>,
    );
    expect(screen.getByText("確認")).toBeInTheDocument();
    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
  });

  it("open=false で何も表示しない", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="確認">
        <p>内容</p>
      </Modal>,
    );
    expect(screen.queryByText("確認")).not.toBeInTheDocument();
  });

  it("閉じるボタンをクリックすると onClose が呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="テスト">
        <p>内容</p>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
