import type { JSX, SVGProps } from "react";
import {
  CircularMaze,
  CLOCKWISE,
  COUNTERCLOCKWISE,
  INWARD,
  OUTWARD,
} from "./core";

export type CircularMaze2DProps = SVGProps<SVGSVGElement> & {
  maze: CircularMaze;
  entranceRadiusRatio?: number;
  viewBoxSize?: number;
};

export function CircularMaze2D(props: CircularMaze2DProps) {
  const {
    maze,
    entranceRadiusRatio = 0.15,
    viewBoxSize = 1,
    strokeWidth,
    ...svgProps
  } = props;

  const numericStrokeWidth =
    typeof strokeWidth === "number" && Number.isFinite(strokeWidth)
      ? strokeWidth
      : viewBoxSize / 200;

  const halfViewBox = viewBoxSize / 2;
  const maxRadius = halfViewBox - numericStrokeWidth / 2;
  const entranceRadius = maxRadius * entranceRadiusRatio;
  const ringThickness = (maxRadius - entranceRadius) / maze.rings;
  const angleStep = (2 * Math.PI) / maze.segments;

  const paths: Array<JSX.Element> = [];

  const addPath = (d: string): void => {
    paths.push(<path key={paths.length} d={d} />);
  };

  maze.forEach((ring, segment, walls) => {
    const innerRadius = entranceRadius + ring * ringThickness;
    const outerRadius = innerRadius + ringThickness;
    const startAngle = segment * angleStep;
    const endAngle = startAngle + angleStep;

    if (walls & CLOCKWISE) {
      addPath(
        `M ${polar(innerRadius, endAngle)} L ${polar(outerRadius, endAngle)}`,
      );
    }

    if (segment === 0 && walls & COUNTERCLOCKWISE) {
      addPath(
        `M ${polar(innerRadius, startAngle)} L ${polar(outerRadius, startAngle)}`,
      );
    }

    if (ring === 0 && walls & INWARD) {
      addPath(
        `M ${polar(innerRadius, startAngle)} A ${innerRadius} ${innerRadius} 0 0 1 ${polar(innerRadius, endAngle)}`,
      );
    }

    if (walls & OUTWARD) {
      addPath(
        `M ${polar(outerRadius, startAngle)} A ${outerRadius} ${outerRadius} 0 0 1 ${polar(outerRadius, endAngle)}`,
      );
    }
  });

  return (
    <svg
      viewBox={`${-halfViewBox} ${-halfViewBox} ${viewBoxSize} ${viewBoxSize}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={numericStrokeWidth}
      {...svgProps}
    >
      {paths}
    </svg>
  );
}

function polar(r: number, a: number): string {
  return `${r * Math.cos(a)} ${r * Math.sin(a)}`;
}
