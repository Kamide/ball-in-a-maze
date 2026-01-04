import { useThree } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useLayoutEffect, useState } from "react";
import { useSettings } from "./settings";

export function Floor() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const aspect = useThree((state) => state.viewport.aspect);
  const position = useThree((state) => state.camera.position);
  const backgroundEnabled = useSettings((state) => state.background.enabled);
  const bottomCoverHeight = useSettings((state) => state.bottomCover.height);
  const fov = useSettings((state) => state.fov);

  /**
   * When switching to portrait mode, the aspect ratio changes and the floor
   * size can be wrong for a single frame. useLayoutEffect updates the size
   * before rendering, and setState forces a re-render so the mesh and collider
   * stay in sync.
   */
  useLayoutEffect(() => {
    const distance = Math.abs(position.z + bottomCoverHeight);
    const height = 2 * distance * Math.tan((fov * Math.PI) / 360);
    const width = height * aspect;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidth(width);
    setHeight(height);
  }, [bottomCoverHeight, fov, position, aspect]);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[width / 2, height / 2, bottomCoverHeight / 2]}
        position={[0, 0, bottomCoverHeight * -1.5]}
      />
      {backgroundEnabled && (
        <mesh position={[0, 0, -bottomCoverHeight]} receiveShadow>
          <planeGeometry args={[width, height]} />
          <Background />
        </mesh>
      )}
    </RigidBody>
  );
}

function Background() {
  const color = useSettings((state) => state.background.color);
  return <meshStandardMaterial color={color} />;
}
