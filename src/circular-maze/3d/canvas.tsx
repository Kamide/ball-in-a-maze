import type { CanvasProps } from "@react-three/fiber";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import type { FC } from "react";
import { useLayoutEffect } from "react";
import type { CircularMaze } from "../core";
import type { BallHandleRef } from "./ball";
import { Ball } from "./ball";
import { BottomCover, TopCover } from "./covers";
import { Floor } from "./floor";
import { Lighting } from "./lighting";
import { useSettings } from "./settings";
import { Walls } from "./walls";

export type CircularMaze3DProps = CanvasProps & {
  maze: CircularMaze;
  ballRef?: BallHandleRef;
  onWin?: () => void;
  Camera?: FC;
  paused?: boolean;
};

export function CircularMaze3D(props: CircularMaze3DProps) {
  const {
    maze,
    ballRef,
    onWin,
    Camera = DefaultCamera,
    paused = false,
    children,
    ...canvasProps
  } = props;

  return (
    <Canvas camera={{ fov: 30 }} shadows {...canvasProps}>
      <Physics gravity={[0, 0, 0]} paused={paused}>
        <Camera />
        <Lighting />
        <Floor />
        <BottomCover />
        <TopCover />
        <Walls maze={maze} />
        <Ball ref={ballRef} onWin={onWin} />
        {children}
      </Physics>
    </Canvas>
  );
}

function DefaultCamera() {
  const aspect = useThree((state) => state.viewport.aspect);
  const position = useThree((state) => state.camera.position);
  const fov = useSettings((state) => (state.fov * Math.PI) / 180);
  const padding = useSettings((state) => state.padding);

  let z: number;
  if (aspect >= 1) {
    z = padding / Math.tan(fov / 2);
  } else {
    const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    z = padding / Math.tan(horizontalFov / 2);
  }

  useLayoutEffect(() => {
    position.setZ(z);
  }, [position, z]);

  return null;
}
