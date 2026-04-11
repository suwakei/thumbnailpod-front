import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "./Select";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

describe("Select", () => {
  it("renders with label", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<Select label="Category" options={options} />);
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("allows selecting an option", async () => {
    render(<Select label="Category" options={options} />);
    const select = screen.getByLabelText("Category");
    await userEvent.selectOptions(select, "b");
    expect(select).toHaveValue("b");
  });

  it("shows error message", () => {
    render(<Select label="Category" options={options} error="Please select" />);
    expect(screen.getByText("Please select")).toBeInTheDocument();
  });
});
