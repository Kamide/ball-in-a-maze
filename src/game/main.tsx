// https://polyhaven.com/a/the_sky_is_on_fire
import hdr from "./the_sky_is_on_fire_1k.hdr?url";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { Environment, OrbitControls, Stats } from "@react-three/drei";
import type { RapierRigidBody } from "@react-three/rapier";
import type { ComponentProps, PropsWithChildren } from "react";
import { useRef, useState } from "react";
import type { BallHandleRef } from "../circular-maze/3d/ball";
import { CircularMaze3D } from "../circular-maze/3d/canvas";
import {
  OrientationGravityController,
  PointerGravityController,
} from "../circular-maze/3d/controllers";
import { generateCircularMaze } from "../circular-maze/generate";
import { fireworks } from "./fireworks";
import { isTouchDevice } from "./is-touch-device";

export type ControllerType = "orientation" | "pointer";

export type GameProps = ComponentProps<"div"> & {
  initialControllerType?: ControllerType;
  initialFreeCamera?: boolean;
  initialShowStats?: boolean;
  random?: () => number;
};

export function Game(props: GameProps) {
  const {
    initialControllerType = isTouchDevice() ? "orientation" : "pointer",
    initialFreeCamera = false,
    initialShowStats = false,
    random = Math.random,
    ...divProps
  } = props;

  const generateMaze = () => generateCircularMaze(8, 16, random);

  const [maze, setMaze] = useState(generateMaze);
  const [controllerType, setControllerType] = useState(initialControllerType);
  const [freeCamera, setFreeCamera] = useState(initialFreeCamera);
  const [showStats, setShowStats] = useState(initialShowStats);
  const [paused, setPaused] = useState(false);

  const wallsRef = useRef<RapierRigidBody>(null);
  const ballRef: BallHandleRef = useRef(null);

  const newGame = (): void => {
    setMaze(generateMaze());

    const wakeUp = true;
    wallsRef.current?.resetTorques(wakeUp);
    wallsRef.current?.resetForces(wakeUp);

    ballRef.current?.reset();
  };

  const handleWin = (): void => {
    setTimeout(newGame, 1000);

    fireworks({
      duration: 5000,
      interval: 250,
      dependencies: { random },
      options: {
        shapes: ["square", "star", "circle"],
        colors: [
          "#ff5e7e",
          "#e63946",
          "#ff6f3c",
          "#ff8f1f",
          "#ffb000",
          "#ffd166",
          "#a3e635",
          "#1faa59",
          "#2ecc71",
          "#b7e4c7",
          "#2ed1c1",
          "#4ecdc4",
        ],
      },
    });
  };

  return (
    <div {...divProps} className="relative h-svh w-svw overflow-hidden">
      <CircularMaze3D
        maze={maze}
        ballRef={ballRef}
        onWin={handleWin}
        Camera={freeCamera ? OrbitControls : undefined}
        paused={paused}
        onContextMenu={(event) => {
          event.preventDefault();
          setPaused(true);
        }}
      >
        <Environment files={hdr} />
        {showStats && <Stats />}
        {controllerType === "orientation" ? (
          <OrientationGravityController />
        ) : (
          <PointerGravityController />
        )}
      </CircularMaze3D>

      <SettingsDrawer
        open={paused}
        onOpenChange={setPaused}
        settings={{ controllerType, freeCamera, showStats }}
        actions={{ setControllerType, setFreeCamera, setShowStats }}
        onNewGame={() => {
          newGame();
          setPaused(false);
        }}
      />
    </div>
  );
}

function SettingsDrawer({
  open,
  onOpenChange,
  settings,
  actions,
  onNewGame,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  settings: {
    controllerType: ControllerType;
    freeCamera: boolean;
    showStats: boolean;
  };
  actions: {
    setControllerType: (value: ControllerType) => void;
    setFreeCamera: (value: boolean) => void;
    setShowStats: (value: boolean) => void;
  };
  onNewGame: () => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
          <DrawerDescription className="sr-only">
            Adjust controls, camera settings, stats, or start a new maze.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex flex-col gap-6 px-6 pb-6">
          <SettingsSection title="Controls">
            <ControllerSelector
              value={settings.controllerType}
              onChange={actions.setControllerType}
            />
          </SettingsSection>

          <SettingsSection title="Debug">
            <ToggleRow
              label="Free Camera"
              value={settings.freeCamera}
              onChange={actions.setFreeCamera}
            />
            <ToggleRow
              label="Show Stats"
              value={settings.showStats}
              onChange={actions.setShowStats}
            />
          </SettingsSection>

          <div className="flex flex-col gap-3">
            <Button variant="default" className="w-full" onClick={onNewGame}>
              New Game
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              Resume
            </Button>
          </div>
        </div>

        <DrawerClose className="sr-only" />
      </DrawerContent>
    </Drawer>
  );
}

function SettingsSection({
  title,
  children,
}: PropsWithChildren<{
  title?: string;
}>) {
  return (
    <div className="bg-muted/50 space-y-4 rounded-xl p-6">
      {title && (
        <h3 className="text-muted-foreground text-sm font-semibold">{title}</h3>
      )}
      {children}
    </div>
  );
}

function ControllerSelector({
  value,
  onChange,
}: {
  value: ControllerType;
  onChange: (value: ControllerType) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        size="sm"
        variant={value === "orientation" ? "default" : "outline"}
        className="justify-center"
        onClick={() => onChange("orientation")}
      >
        Tilt
      </Button>
      <Button
        size="sm"
        variant={value === "pointer" ? "default" : "outline"}
        className="justify-center"
        onClick={() => onChange("pointer")}
      >
        {isTouchDevice() ? "Touch" : "Mouse"}
      </Button>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
