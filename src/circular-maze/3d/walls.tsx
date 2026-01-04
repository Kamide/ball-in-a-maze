import { RigidBody } from "@react-three/rapier";
import type { JSX } from "react";
import { ExtrudeGeometry, Shape } from "three";
import type { CircularMaze } from "../core";
import { CLOCKWISE, COUNTERCLOCKWISE, INWARD, OUTWARD } from "../core";
import { useSettings } from "./settings";

export type WallsProps = {
  maze: CircularMaze;
};

export function Walls(props: WallsProps) {
  const { maze } = props;

  const { color, height, thickness, maxRingRadius, entranceRadiusRatio } =
    useSettings((state) => state.walls);

  const ringThickness =
    (maxRingRadius - entranceRadiusRatio - thickness) / maze.rings;

  const angleStep = (2 * Math.PI) / maze.segments;

  const meshes: Array<JSX.Element> = [];

  const addStraightWall = (
    innerRadius: number,
    outerRadius: number,
    angle: number,
  ): void => {
    const medianRadius = (innerRadius + outerRadius) / 2;

    meshes.push(
      <mesh
        key={meshes.length}
        position={[
          medianRadius * Math.cos(angle),
          medianRadius * Math.sin(angle),
          height / 2,
        ]}
        rotation={[0, 0, angle]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[outerRadius - innerRadius, thickness, height]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>,
    );
  };

  const addCurvedWall = (
    innerRadius: number,
    outerRadius: number,
    startAngle: number,
    endAngle: number,
  ): void => {
    const shape = new Shape();

    shape.absarc(0, 0, innerRadius, startAngle, endAngle, false);
    shape.lineTo(
      outerRadius * Math.cos(endAngle),
      outerRadius * Math.sin(endAngle),
    );
    shape.absarc(0, 0, outerRadius, endAngle, startAngle, true);
    shape.closePath();

    const geometry = new ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });

    meshes.push(
      <mesh key={meshes.length} geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.3} />
      </mesh>,
    );
  };

  maze.forEach((ring, segment, walls) => {
    const innerRadius = entranceRadiusRatio + ring * ringThickness;
    const outerRadius = innerRadius + ringThickness + thickness;
    const startAngle = segment * angleStep;
    const endAngle = startAngle + angleStep;

    if (walls & CLOCKWISE) {
      addStraightWall(innerRadius, outerRadius, endAngle);
    }

    if (segment === 0 && walls & COUNTERCLOCKWISE) {
      addStraightWall(innerRadius, outerRadius, startAngle);
    }

    if (ring === 0 && walls & INWARD) {
      addCurvedWall(innerRadius, innerRadius + thickness, startAngle, endAngle);
    }

    if (walls & OUTWARD) {
      addCurvedWall(outerRadius - thickness, outerRadius, startAngle, endAngle);
    }
  });

  return (
    <RigidBody key={maze.toString()} type="fixed" colliders="trimesh">
      {meshes}
    </RigidBody>
  );
}
