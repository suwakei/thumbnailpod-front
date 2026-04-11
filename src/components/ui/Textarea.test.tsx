import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Textarea from "./Textarea";

describe("Textarea", () => {
  it("renders with label", () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("accepts user input", async () => {
    render(<Textarea label="Prompt" />);
    const textarea = screen.getByLabelText("Prompt");
    await userEvent.type(textarea, "hello world");
    expect(textarea).toHaveValue("hello world");
  });

  it("shows error message", () => {
    render(<Textarea label="Prompt" error="Too short" />);
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });

  it("shows hint when no error", () => {
    render(<Textarea label="Prompt" hint="Be descriptive" />);
    expect(screen.getByText("Be descriptive")).toBeInTheDocument();
  });

  it("hides hint when error is present", () => {
    render(<Textarea label="Prompt" error="Required" hint="Describe" />);
    expect(screen.queryByText("Describe")).not.toBeInTheDocument();
  });
});
