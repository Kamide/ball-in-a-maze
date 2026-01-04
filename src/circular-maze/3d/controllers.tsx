import { useRapier } from "@react-three/rapier";
import { useEffect } from "react";
import { useSettings } from "./settings";

function useGravity(): number {
  return useSettings((state) => state.gravity);
}

export function OrientationGravityController() {
  const { world } = useRapier();
  const gravity = useGravity();

  useEffect(() => {
    const updateGravity = (event: DeviceOrientationEvent) => {
      const betaDegrees = event.beta ?? 0;
      const gammaDegrees = event.gamma ?? 0;
      const betaRadians = (betaDegrees * Math.PI) / 180;
      const gammaRadians = (gammaDegrees * Math.PI) / 180;

      world.gravity = {
        x: gravity * Math.sin(gammaRadians),
        y: -gravity * Math.sin(betaRadians) * Math.cos(gammaRadians),
        z: -gravity * Math.cos(betaRadians) * Math.cos(gammaRadians),
      };
    };

    window.addEventListener("deviceorientation", updateGravity);

    return () => {
      window.removeEventListener("deviceorientation", updateGravity);
    };
  }, [world, gravity]);

  return null;
}
export function PointerGravityController() {
  const { world } = useRapier();
  const gravity = useGravity();

  useEffect(() => {
    const updateGravity = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;

      world.gravity = {
        x: gravity * x,
        y: -gravity * y,
        z: -gravity,
      };
    };

    window.addEventListener("pointerdown", updateGravity);
    window.addEventListener("pointermove", updateGravity);

    return () => {
      window.removeEventListener("pointerdown", updateGravity);
      window.removeEventListener("pointermove", updateGravity);
    };
  }, [world, gravity]);

  return null;
}
