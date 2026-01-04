import { create } from "zustand";

export type WithColor = {
  color: string;
};

export type WithHeight = {
  height: number;
};

export type WithRadius = {
  radius: number;
};

export type WithSegments = {
  segments: number;
};

export type Settings = {
  fov: number;
  gravity: number;
  padding: number;
  background: WithColor & {
    enabled: boolean;
  };
  bottomCover: WithColor & WithHeight & WithRadius & WithSegments;
  topCover: WithColor &
    WithHeight &
    WithRadius &
    WithSegments & {
      opacity: number;
      specular: string;
      shininess: number;
    };
  walls: WithColor &
    WithHeight & {
      thickness: number;
      maxRingRadius: number;
      entranceRadiusRatio: number;
    };
  ball: WithColor & WithRadius & WithSegments;
  ballOutline: WithColor & WithRadius & WithSegments;
};

export const useSettings = create(
  (): Settings => ({
    fov: 30,
    gravity: 9.81,
    padding: 7 / 6,
    background: {
      color: "#ffffff",
      enabled: true,
    },
    bottomCover: {
      color: "#d8b490",
      height: 1 / 36,
      radius: 1,
      segments: 64,
    },
    topCover: {
      color: "#d86c90",
      opacity: 1 / 3,
      specular: "#ffb45a",
      shininess: 90,
      height: 1 / 36,
      radius: 1,
      segments: 64,
    },
    walls: {
      color: "#6c3c2a",
      height: 1 / 12,
      thickness: 1 / 36,
      maxRingRadius: 1,
      entranceRadiusRatio: 1 / 6,
    },
    ball: {
      color: "#deb420",
      radius: 1 / 60,
      segments: 16,
    },
    ballOutline: {
      color: "#a25420",
      radius: 1 / 240,
      segments: 16,
    },
  }),
);
