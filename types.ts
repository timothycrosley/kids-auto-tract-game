import { FC } from 'react';

export enum Direction {
  NORTH, EAST, SOUTH, WEST
}

export enum SceneryType {
  TREE, ROCKS, HOUSE, MOUNTAIN, SPACE_NEEDLE, SCHOOL
}

export enum Tool {
  STRAIGHT_V, STRAIGHT_H,
  CURVE_NE, CURVE_SE, CURVE_SW, CURVE_NW,
  BRIDGE_V, BRIDGE_H,
  TUNNEL_V, TUNNEL_H,
  TURNTABLE,
  TREE, ROCKS, HOUSE, MOUNTAIN, SPACE_NEEDLE, SCHOOL,
  CAR_1, CAR_2, CAR_3, CAR_4, CAR_5,
  ERASER
}

export enum TrackType {
  STRAIGHT_V, STRAIGHT_H,
  CURVE_NE, CURVE_SE, CURVE_SW, CURVE_NW,
  BRIDGE_V, BRIDGE_H,
  TUNNEL_V, TUNNEL_H,
  TURNTABLE
}

export interface GridCell {
  ground: TrackType | null;
  air: TrackType | null;
  scenery: SceneryType | null;
}

export interface TurntableState {
  x: number;
  y: number;
  activeExit: Direction | null;
}

export interface CarDesign {
  id: number;
  component: FC<{ color: string, lightColor: string }>;
  color: string;
}

export interface Car {
  id: number;
  x: number; // grid x
  y: number; // grid y
  level: 0 | 1; // 0 for ground/tunnel, 1 for bridge
  direction: Direction;
  progress: number; // progress along current tile (0 to 1)
  design: CarDesign;
}
