import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CircularMaze2D } from "../../src/circular-maze/2d";
import { CircularMaze, INWARD } from "../../src/circular-maze/core";

describe("CircularMaze2D", () => {
  it("renders non-empty paths for a small maze", () => {
    const maze = CircularMaze.barricaded(2, 3);
    const { container } = render(<CircularMaze2D maze={maze} />);
    const paths = Array.from(container.querySelectorAll("path"));

    expect(paths.length).toBeGreaterThan(0);

    for (const path of paths) {
      expect(path.getAttribute("d")!.length).toBeGreaterThan(0);
    }
  });

  it("renders no duplicate paths", () => {
    const maze = CircularMaze.barricaded(3, 4);
    const { container } = render(<CircularMaze2D maze={maze} />);
    const paths = Array.from(container.querySelectorAll("path"));
    const pathData = paths.map((path) => path.getAttribute("d"));
    const uniquePathData = new Set(pathData);

    expect(uniquePathData.size).toBe(paths.length);
  });

  it("reduces the number of paths when INWARD walls are unblocked", () => {
    const initialMaze = CircularMaze.barricaded(1, 1);
    const { container, rerender } = render(
      <CircularMaze2D maze={initialMaze} />,
    );

    const countPaths = (): number => container.querySelectorAll("path").length;

    const pathsBefore = countPaths();
    expect(pathsBefore).toBeGreaterThan(0);

    const updatedMaze = new CircularMaze(initialMaze.data.slice());
    updatedMaze.unblock(0, 0, INWARD);
    rerender(<CircularMaze2D maze={updatedMaze} />);

    const pathsAfter = countPaths();
    expect(pathsAfter).toBeLessThan(pathsBefore);
  });

  it("renders deterministically for identical inputs", () => {
    const maze = CircularMaze.barricaded(2, 3);

    const firstHTML = render(<CircularMaze2D maze={maze} />).container
      .innerHTML;
    const secondHTML = render(<CircularMaze2D maze={maze} />).container
      .innerHTML;

    expect(firstHTML).toBe(secondHTML);
  });

  it("uses currentColor for stroke by default", () => {
    const maze = CircularMaze.barricaded(1, 1);
    const { container } = render(<CircularMaze2D maze={maze} />);
    const svg = container.querySelector("svg")!;

    expect(svg.getAttribute("stroke")).toBe("currentColor");
  });

  it("sets a default strokeWidth proportional to viewBoxSize", () => {
    const maze = CircularMaze.barricaded(1, 1);
    const viewBoxSize = 200;

    const { container } = render(
      <CircularMaze2D maze={maze} viewBoxSize={viewBoxSize} />,
    );

    const svg = container.querySelector("svg")!;
    const strokeWidth = Number(svg.getAttribute("stroke-width"));

    expect(strokeWidth).toBeCloseTo(viewBoxSize / 200, 6);
  });

  it("renders larger inner arcs with larger entranceRadiusRatio", () => {
    const maze = CircularMaze.barricaded(1, 8);

    const { container: smallEntranceContainer } = render(
      <CircularMaze2D maze={maze} entranceRadiusRatio={0.05} />,
    );

    const { container: largeEntranceContainer } = render(
      <CircularMaze2D maze={maze} entranceRadiusRatio={0.3} />,
    );

    const getFirstArcRadius = (container: HTMLElement): number => {
      const arcPath = Array.from(container.querySelectorAll("path")).find((p) =>
        p.getAttribute("d")!.includes("A "),
      )!;
      return Number(arcPath.getAttribute("d")!.match(/A\s+([\d.]+)/)![1]);
    };

    expect(getFirstArcRadius(largeEntranceContainer)).toBeGreaterThan(
      getFirstArcRadius(smallEntranceContainer),
    );
  });

  it("renders all path coordinates inside the viewBox accounting for strokeWidth", () => {
    const viewBoxSize = 1;
    const halfViewBox = viewBoxSize / 2;
    const strokeWidth = viewBoxSize / 200;
    const halfStroke = strokeWidth / 2;
    const maze = CircularMaze.barricaded(3, 10);

    const { container } = render(
      <CircularMaze2D
        maze={maze}
        viewBoxSize={viewBoxSize}
        strokeWidth={strokeWidth}
      />,
    );

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const pathElement of container.querySelectorAll("path")) {
      const pathData = pathElement.getAttribute("d")!;
      const commands = pathData.match(/[MLACZ][^MLACZ]*/gi) ?? [];

      for (const cmd of commands) {
        const type = cmd[0].toUpperCase();
        const args = cmd
          .slice(1)
          .trim()
          .split(/[\s,]+/)
          .map(Number);

        if (type === "A" && args.length >= 7) {
          const [, , , , , x, y] = args;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        } else if (["M", "L", "C"].includes(type)) {
          for (let i = 0; i < args.length; i += 2) {
            const x = args[i];
            const y = args[i + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      }
    }

    minX -= halfStroke;
    maxX += halfStroke;
    minY -= halfStroke;
    maxY += halfStroke;

    const tolerance = 1e-6;

    expect(minX).toBeGreaterThanOrEqual(-halfViewBox - tolerance);
    expect(maxX).toBeLessThanOrEqual(halfViewBox + tolerance);
    expect(minY).toBeGreaterThanOrEqual(-halfViewBox - tolerance);
    expect(maxY).toBeLessThanOrEqual(halfViewBox + tolerance);
  });
});
