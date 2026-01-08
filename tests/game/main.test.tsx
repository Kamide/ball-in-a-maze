import { Game } from "@/game/main";
import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { ResizeObserver } from "../stubs/resize-observer";

vi.stubGlobal("ResizeObserver", ResizeObserver);

describe("Game", () => {
  it("renders without crashing", () => {
    render(<Game />);
  });
});
