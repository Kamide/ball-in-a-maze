import { RigidBody } from "@react-three/rapier";
import { useSettings } from "./settings";

export function BottomCover() {
  const { color, height, radius, segments } = useSettings(
    (state) => state.bottomCover,
  );

  return (
    <RigidBody type="fixed" colliders="hull">
      <mesh
        position={[0, 0, height / -2]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, height, segments]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

export function TopCover() {
  const { color, opacity, specular, shininess, height, radius, segments } =
    useSettings((state) => state.topCover);

  const wallsHeight = useSettings((state) => state.walls.height);

  return (
    <RigidBody type="fixed" colliders="hull">
      <mesh
        position={[0, 0, wallsHeight + height / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[radius, radius, height, segments]} />
        <meshPhongMaterial
          color={color}
          opacity={opacity}
          specular={specular}
          shininess={shininess}
          depthWrite={false}
          transparent
        />
      </mesh>
    </RigidBody>
  );
}
