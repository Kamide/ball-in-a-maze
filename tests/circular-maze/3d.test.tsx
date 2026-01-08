import { CircularMaze3D } from "@/circular-maze/3d/canvas";
import { generateCircularMaze } from "@/circular-maze/generate";
import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { ResizeObserver } from "../stubs/resize-observer";

vi.stubGlobal("ResizeObserver", ResizeObserver);

describe("CircularMaze3D", () => {
  it("renders without crashing", () => {
    render(<CircularMaze3D maze={generateCircularMaze(8, 16)} />);
  });
});
