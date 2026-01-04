import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import { BallCollider, RigidBody } from "@react-three/rapier";
import type { Ref } from "react";
import { useImperativeHandle, useRef } from "react";
import { BackSide } from "three";
import { useSettings } from "./settings";

export type BallHandle = {
  getPosition: () => { x: number; y: number; z: number } | undefined;
  hasWon: () => boolean;
  reset: () => void;
};

export type BallHandleRef = Ref<BallHandle | null>;

export type BallProps = {
  ref?: BallHandleRef;
  onWin?: () => void;
};

export function Ball(props: BallProps) {
  const { ref: ballRef, onWin } = props;
  const wonRef = useRef(false);
  const bodyRef = useRef<RapierRigidBody>(null);
  const { color, radius, segments } = useSettings((state) => state.ball);

  const {
    color: outlineColor,
    radius: outlineWidth,
    segments: outlineSegments,
  } = useSettings((state) => state.ballOutline);

  const winRadius = useSettings(
    (state) => state.bottomCover.radius + state.ball.radius,
  );

  useImperativeHandle(ballRef, () => ({
    getPosition: () => bodyRef.current?.translation(),
    hasWon: () => wonRef.current,
    reset: () => {
      const body = bodyRef.current;

      if (body == null) {
        return;
      }

      const wakeUp = false;
      body.setTranslation({ x: 0, y: 0, z: radius }, wakeUp);
      body.setLinvel({ x: 0, y: 0, z: 0 }, wakeUp);
      body.setAngvel({ x: 0, y: 0, z: 0 }, wakeUp);

      wonRef.current = false;
    },
  }));

  useFrame(() => {
    const body = bodyRef.current;

    if (body == null) {
      wonRef.current = false;
      return;
    }

    if (wonRef.current) {
      return;
    }

    const position = body.translation();
    const distanceFromCenter = Math.sqrt(position.x ** 2 + position.y ** 2);

    if (distanceFromCenter > winRadius) {
      wonRef.current = true;
      onWin?.();
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      restitution={0.2}
      friction={0.6}
      position={[0, 0, radius]}
      colliders={false}
      ccd
    >
      <BallCollider args={[radius]} />
      <group>
        <mesh>
          <sphereGeometry
            args={[radius + outlineWidth, outlineSegments, outlineSegments]}
          />
          <meshBasicMaterial color={outlineColor} side={BackSide} />
        </mesh>
        <mesh castShadow>
          <sphereGeometry args={[radius, segments, segments]} />
          <meshStandardMaterial
            color={color}
            roughness={0.25}
            metalness={0.75}
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
