import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "./Button";

describe("Button", () => {
  it("テキストを表示する", () => {
    render(<Button>クリック</Button>);
    expect(screen.getByRole("button", { name: "クリック" })).toBeInTheDocument();
  });

  it("クリックイベントが発火する", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>送信</Button>);

    await user.click(screen.getByRole("button", { name: "送信" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 時にクリックできない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        無効
      </Button>,
    );

    const btn = screen.getByRole("button", { name: "無効" });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("loading 時にスピナーが表示されクリックできない", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        読み込み中
      </Button>,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("className を追加できる", () => {
    render(<Button className="custom-class">テスト</Button>);
    const btn = screen.getByRole("button", { name: "テスト" });
    expect(btn.className).toContain("custom-class");
  });
});
