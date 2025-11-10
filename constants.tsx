import React from 'react';
import { Tool, CarDesign, SceneryType, TrackType, Direction } from './types';

export const GRID_WIDTH = 24;
export const GRID_HEIGHT = 16;
export const TILE_SIZE = 48; // in pixels
export const CAR_SPEED = 0.02; // progress per frame

type Point = { x: number; y: number };

const HALF_TILE = TILE_SIZE / 2;
const CENTER_POINT: Point = { x: HALF_TILE, y: HALF_TILE };

const EDGE_POINTS: Record<Direction, Point> = {
  [Direction.NORTH]: { x: HALF_TILE, y: 0 },
  [Direction.EAST]: { x: TILE_SIZE, y: HALF_TILE },
  [Direction.SOUTH]: { x: HALF_TILE, y: TILE_SIZE },
  [Direction.WEST]: { x: 0, y: HALF_TILE },
};

export type TrackConnection = { entry: Direction; exit: Direction };

export const TRACK_CONNECTIONS: Record<TrackType, TrackConnection[]> = {
  [TrackType.STRAIGHT_V]: [
    { entry: Direction.NORTH, exit: Direction.SOUTH },
    { entry: Direction.SOUTH, exit: Direction.NORTH },
  ],
  [TrackType.STRAIGHT_H]: [
    { entry: Direction.WEST, exit: Direction.EAST },
    { entry: Direction.EAST, exit: Direction.WEST },
  ],
  [TrackType.CURVE_NE]: [
    { entry: Direction.SOUTH, exit: Direction.EAST },
    { entry: Direction.EAST, exit: Direction.SOUTH },
    { entry: Direction.WEST, exit: Direction.NORTH },
    { entry: Direction.NORTH, exit: Direction.WEST },
  ],
  [TrackType.CURVE_SE]: [
    { entry: Direction.NORTH, exit: Direction.EAST },
    { entry: Direction.EAST, exit: Direction.NORTH },
    { entry: Direction.WEST, exit: Direction.SOUTH },
    { entry: Direction.SOUTH, exit: Direction.WEST },
  ],
  [TrackType.CURVE_SW]: [
    { entry: Direction.NORTH, exit: Direction.WEST },
    { entry: Direction.WEST, exit: Direction.NORTH },
    { entry: Direction.EAST, exit: Direction.SOUTH },
    { entry: Direction.SOUTH, exit: Direction.EAST },
  ],
  [TrackType.CURVE_NW]: [
    { entry: Direction.SOUTH, exit: Direction.WEST },
    { entry: Direction.WEST, exit: Direction.SOUTH },
    { entry: Direction.EAST, exit: Direction.NORTH },
    { entry: Direction.NORTH, exit: Direction.EAST },
  ],
  [TrackType.BRIDGE_V]: [
    { entry: Direction.NORTH, exit: Direction.SOUTH },
    { entry: Direction.SOUTH, exit: Direction.NORTH },
  ],
  [TrackType.BRIDGE_H]: [
    { entry: Direction.WEST, exit: Direction.EAST },
    { entry: Direction.EAST, exit: Direction.WEST },
  ],
  [TrackType.TUNNEL_V]: [
    { entry: Direction.NORTH, exit: Direction.SOUTH },
    { entry: Direction.SOUTH, exit: Direction.NORTH },
  ],
  [TrackType.TUNNEL_H]: [
    { entry: Direction.WEST, exit: Direction.EAST },
    { entry: Direction.EAST, exit: Direction.WEST },
  ],
  [TrackType.TURNTABLE]: [],
};

const TRACK_PATHS: Record<TrackType, TrackConnection[]> = {
  [TrackType.STRAIGHT_V]: [{ entry: Direction.NORTH, exit: Direction.SOUTH }],
  [TrackType.STRAIGHT_H]: [{ entry: Direction.WEST, exit: Direction.EAST }],
  [TrackType.CURVE_NE]: [
    { entry: Direction.SOUTH, exit: Direction.EAST },
    { entry: Direction.WEST, exit: Direction.NORTH },
  ],
  [TrackType.CURVE_SE]: [
    { entry: Direction.NORTH, exit: Direction.EAST },
    { entry: Direction.WEST, exit: Direction.SOUTH },
  ],
  [TrackType.CURVE_SW]: [
    { entry: Direction.NORTH, exit: Direction.WEST },
    { entry: Direction.EAST, exit: Direction.SOUTH },
  ],
  [TrackType.CURVE_NW]: [
    { entry: Direction.SOUTH, exit: Direction.WEST },
    { entry: Direction.EAST, exit: Direction.NORTH },
  ],
  [TrackType.BRIDGE_V]: [{ entry: Direction.NORTH, exit: Direction.SOUTH }],
  [TrackType.BRIDGE_H]: [{ entry: Direction.WEST, exit: Direction.EAST }],
  [TrackType.TUNNEL_V]: [{ entry: Direction.NORTH, exit: Direction.SOUTH }],
  [TrackType.TUNNEL_H]: [{ entry: Direction.WEST, exit: Direction.EAST }],
  [TrackType.TURNTABLE]: [
    { entry: Direction.NORTH, exit: Direction.SOUTH },
    { entry: Direction.WEST, exit: Direction.EAST },
  ],
};

const areOpposite = (a: Direction, b: Direction) => ((a + 2) % 4) === b;

const buildRoadPath = (entry: Direction, exit: Direction) => {
  const start = EDGE_POINTS[entry];
  const end = EDGE_POINTS[exit];

  if (areOpposite(entry, exit)) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }
  return `M ${start.x} ${start.y} Q ${CENTER_POINT.x} ${CENTER_POINT.y} ${end.x} ${end.y}`;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const toDegrees = (rad: number) => (rad * 180) / Math.PI;

export const getTrackPose = (
  trackType: TrackType | null,
  entry: Direction,
  exit: Direction,
  rawProgress: number
) => {
  if (trackType === null) {
    return { x: CENTER_POINT.x, y: CENTER_POINT.y, rotation: 0 };
  }

  const progress = clamp01(rawProgress);
  const start = EDGE_POINTS[entry];
  const end = EDGE_POINTS[exit];

  if (areOpposite(entry, exit)) {
    const x = start.x + (end.x - start.x) * progress;
    const y = start.y + (end.y - start.y) * progress;
    const rotation = toDegrees(Math.atan2(end.y - start.y, end.x - start.x));
    return { x, y, rotation };
  }

  const oneMinusT = 1 - progress;
  const x =
    oneMinusT * oneMinusT * start.x +
    2 * oneMinusT * progress * CENTER_POINT.x +
    progress * progress * end.x;
  const y =
    oneMinusT * oneMinusT * start.y +
    2 * oneMinusT * progress * CENTER_POINT.y +
    progress * progress * end.y;

  const dx =
    2 * oneMinusT * (CENTER_POINT.x - start.x) +
    2 * progress * (end.x - CENTER_POINT.x);
  const dy =
    2 * oneMinusT * (CENTER_POINT.y - start.y) +
    2 * progress * (end.y - CENTER_POINT.y);
  const rotation = toDegrees(Math.atan2(dy, dx));

  return { x, y, rotation };
};

const Car1: React.FC<{ color: string, lightColor: string }> = ({ color, lightColor }) => (
  <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
    <rect x="2" y="5" width="16" height="10" rx="3" fill={color} stroke="black" strokeWidth="1"/>
    <rect x="5" y="2" width="10" height="15" rx="2" fill="rgba(255,255,255,0.3)" />
    <circle cx="10" cy="10" r="2" fill={lightColor} stroke="white" strokeWidth="0.5" className="car-light" style={{color: lightColor}}/>
  </svg>
);

const Car2: React.FC<{ color: string, lightColor: string }> = ({ color, lightColor }) => (
  <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
    <path d="M 2,10 L 5,5 L 15,5 L 18,10 L 15,15 L 5,15 Z" fill={color} stroke="black" strokeWidth="1"/>
    <circle cx="10" cy="10" r="2" fill={lightColor} stroke="white" strokeWidth="0.5" className="car-light" style={{color: lightColor}}/>
  </svg>
);

const Car3: React.FC<{ color: string, lightColor: string }> = ({ color, lightColor }) => (
  <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
    <rect x="3" y="3" width="14" height="14" rx="7" fill={color} stroke="black" strokeWidth="1"/>
    <rect x="7" y="1" width="6" height="18" fill="rgba(255,255,255,0.3)" />
    <circle cx="10" cy="10" r="2" fill={lightColor} stroke="white" strokeWidth="0.5" className="car-light" style={{color: lightColor}}/>
  </svg>
);

const Car4: React.FC<{ color: string, lightColor: string }> = ({ color, lightColor }) => (
  <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
    <path d="M 10,2 L 18,10 L 10,18 L 2,10 Z" fill={color} stroke="black" strokeWidth="1"/>
    <circle cx="10" cy="10" r="2" fill={lightColor} stroke="white" strokeWidth="0.5" className="car-light" style={{color: lightColor}}/>
  </svg>
);

const Car5: React.FC<{ color: string, lightColor: string }> = ({ color, lightColor }) => (
  <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 2px 2px rgba(0,0,0,0.5))` }}>
    <path d="M 3,5 L 17,5 L 19,10 L 17,15 L 3,15 L 1,10 Z" fill={color} stroke="black" strokeWidth="1"/>
    <circle cx="10" cy="10" r="2" fill={lightColor} stroke="white" strokeWidth="0.5" className="car-light" style={{color: lightColor}}/>
  </svg>
);

export const CAR_DESIGNS: CarDesign[] = [
  { id: 1, component: Car1, color: '#ef4444' }, // red
  { id: 2, component: Car2, color: '#3b82f6' }, // blue
  { id: 3, component: Car3, color: '#22c55e' }, // green
  { id: 4, component: Car4, color: '#eab308' }, // yellow
  { id: 5, component: Car5, color: '#a855f7' }, // purple
];

// FIX: Replaced `JSX.Element` with `React.ReactNode` to fix "Cannot find namespace 'JSX'".
export const TOOL_MAP: { tool: Tool | SceneryType, icon: React.ReactNode }[] = [
    { tool: Tool.STRAIGHT_V, icon: <TrackStraightV /> },
    { tool: Tool.STRAIGHT_H, icon: <TrackStraightH /> },
    { tool: Tool.CURVE_NE, icon: <TrackCurveNE /> },
    { tool: Tool.CURVE_SE, icon: <TrackCurveSE /> },
    { tool: Tool.CURVE_SW, icon: <TrackCurveSW /> },
    { tool: Tool.CURVE_NW, icon: <TrackCurveNW /> },
    { tool: Tool.BRIDGE_V, icon: <TrackBridgeV /> },
    { tool: Tool.BRIDGE_H, icon: <TrackBridgeH /> },
    { tool: Tool.TUNNEL_V, icon: <TrackTunnelV /> },
    { tool: Tool.TUNNEL_H, icon: <TrackTunnelH /> },
    { tool: Tool.TURNTABLE, icon: <TrackTurntable /> },
    { tool: Tool.TREE, icon: <SceneryTree /> },
    { tool: Tool.ROCKS, icon: <SceneryRocks /> },
    { tool: Tool.HOUSE, icon: <SceneryHouse /> },
    { tool: Tool.MOUNTAIN, icon: <SceneryMountain /> },
    { tool: Tool.SPACE_NEEDLE, icon: <ScenerySpaceNeedle /> },
    { tool: Tool.SCHOOL, icon: <ScenerySchool /> },
    ...CAR_DESIGNS.map((car, index) => ({
        tool: Tool.CAR_1 + index,
        icon: <div className="w-8 h-8 p-1"><car.component color={car.color} lightColor="transparent" /></div>
    })),
    { tool: Tool.ERASER, icon: <EraserIcon /> }
];

export const SCENERY_MAP: { [key in SceneryType]: React.ReactNode } = {
  [SceneryType.TREE]: <SceneryTree />,
  [SceneryType.ROCKS]: <SceneryRocks />,
  [SceneryType.HOUSE]: <SceneryHouse />,
  [SceneryType.MOUNTAIN]: <SceneryMountain />,
  [SceneryType.SPACE_NEEDLE]: <ScenerySpaceNeedle />,
  [SceneryType.SCHOOL]: <ScenerySchool />,
};

// SVG Components
const roadColor = "#3f3f46";
const lineColor = "#fbbf24";
const shoulderColor = "#0f172a";
const bridgeRoadColor = "#6b7280";
const bridgeLineColor = "#f8fafc";
const bridgeRailColor = "#e2e8f0";
const tunnelWallColor = "#1f2937";
const tunnelLineColor = "#bae6fd";
const ROAD_STROKE = 18;
const SHOULDER_STROKE = ROAD_STROKE + 6;
type Orientation = 'vertical' | 'horizontal' | 'curve';

interface RoadTileProps {
  track: TrackType;
  orientation: Orientation;
  variant?: 'ground' | 'bridge' | 'tunnel';
}

const RoadTile: React.FC<RoadTileProps> = ({ track, orientation, variant = 'ground' }) => {
  const isBridge = variant === 'bridge';
  const isTunnel = variant === 'tunnel';
  const asphalt = isBridge ? bridgeRoadColor : roadColor;
  const lane = isBridge ? bridgeLineColor : isTunnel ? tunnelLineColor : lineColor;
  const dash = isTunnel ? '4 6' : '10 6';
  const segments = TRACK_PATHS[track] ?? [];

  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      {isBridge && <BridgeDetails orientation={orientation} />}
      {isTunnel && <TunnelDetails orientation={orientation} />}
      {segments.map((seg) => {
        const d = buildRoadPath(seg.entry, seg.exit);
        return (
          <g key={`${seg.entry}-${seg.exit}`}>
            <path
              d={d}
              stroke={shoulderColor}
              strokeWidth={SHOULDER_STROKE}
              strokeLinecap="round"
              strokeOpacity="0.5"
              fill="none"
            />
            <path
              d={d}
              stroke={asphalt}
              strokeWidth={ROAD_STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={d}
              stroke={lane}
              strokeWidth={2}
              strokeDasharray={dash}
              strokeLinecap="round"
              fill="none"
            />
          </g>
        );
      })}
    </svg>
  );
};

const BridgeDetails: React.FC<{ orientation: Orientation }> = ({ orientation }) => (
  <g stroke={bridgeRailColor} strokeWidth="2" strokeLinecap="round">
    {orientation === 'vertical' && (
      <>
        <line x1="12" y1="0" x2="12" y2="48" />
        <line x1="36" y1="0" x2="36" y2="48" />
      </>
    )}
    {orientation === 'horizontal' && (
      <>
        <line x1="0" y1="12" x2="48" y2="12" />
        <line x1="0" y1="36" x2="48" y2="36" />
      </>
    )}
  </g>
);

const TunnelDetails: React.FC<{ orientation: Orientation }> = ({ orientation }) => (
  <g fill={tunnelWallColor} opacity="0.9">
    {orientation === 'vertical' && (
      <>
        <rect x="8" y="0" width="32" height="6" rx="3" />
        <rect x="8" y="42" width="32" height="6" rx="3" />
      </>
    )}
    {orientation === 'horizontal' && (
      <>
        <rect x="0" y="8" width="6" height="32" rx="3" />
        <rect x="42" y="8" width="6" height="32" rx="3" />
      </>
    )}
  </g>
);

function TrackStraightV() {
  return <RoadTile track={TrackType.STRAIGHT_V} orientation="vertical" />;
}

function TrackStraightH() {
  return <RoadTile track={TrackType.STRAIGHT_H} orientation="horizontal" />;
}

function TrackCurveNE() {
  return <RoadTile track={TrackType.CURVE_NE} orientation="curve" />;
}

function TrackCurveSE() {
  return <RoadTile track={TrackType.CURVE_SE} orientation="curve" />;
}

function TrackCurveSW() {
  return <RoadTile track={TrackType.CURVE_SW} orientation="curve" />;
}

function TrackCurveNW() {
  return <RoadTile track={TrackType.CURVE_NW} orientation="curve" />;
}

function TrackBridgeV() {
  return <RoadTile track={TrackType.BRIDGE_V} orientation="vertical" variant="bridge" />;
}

function TrackBridgeH() {
  return <RoadTile track={TrackType.BRIDGE_H} orientation="horizontal" variant="bridge" />;
}

function TrackTunnelV() {
  return <RoadTile track={TrackType.TUNNEL_V} orientation="vertical" variant="tunnel" />;
}

function TrackTunnelH() {
  return <RoadTile track={TrackType.TUNNEL_H} orientation="horizontal" variant="tunnel" />;
}

function TrackTurntable() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      <circle cx="24" cy="24" r="22" fill="#312e81" stroke="#a78bfa" strokeWidth="2" />
      <path d="M 24 6 V 42" stroke="#1f2937" strokeWidth="10" strokeLinecap="round" opacity="0.45" />
      <path d="M 6 24 H 42" stroke="#1f2937" strokeWidth="10" strokeLinecap="round" opacity="0.45" />
      <circle cx="24" cy="24" r="12" fill="#4338ca" stroke="#c4b5fd" strokeWidth="2" />
      <circle cx="24" cy="24" r="4" fill="#e0e7ff" />
    </svg>
  );
}
function EraserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>; }

function SceneryTree() { return <svg viewBox="0 0 48 48" className="w-full h-full"><rect x="22" y="34" width="4" height="10" fill="#854d0e" rx="1" /><circle cx="24" cy="24" r="12" fill="#16a34a" /><circle cx="16" cy="28" r="8" fill="#22c55e" /><circle cx="32" cy="28" r="8" fill="#22c55e" /></svg>; }
function SceneryRocks() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 10 44 C 5 44, 5 34, 12 34 H 36 C 43 34, 43 44, 38 44 Z" fill="#a1a1aa" /><path d="M 18 32 C 15 32, 15 26, 20 26 H 28 C 33 26, 33 32, 28 32 Z" fill="#71717a" /></svg>; }
function SceneryHouse() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 8 44 V 24 L 24 14 L 40 24 V 44 H 8 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" /><rect x="20" y="32" width="8" height="12" fill="#92400e" /><rect x="12" y="28" width="6" height="6" fill="#7dd3fc"/><rect x="30" y="28" width="6" height="6" fill="#7dd3fc"/></svg>; }
function SceneryMountain() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 10 44 L 20 20 L 26 30 L 32 24 L 42 44 Z" fill="#a1a1aa" /><path d="M 2 44 L 12 24 L 18 34 L 24 28 L 34 44 Z" fill="#71717a" /><path d="M 20 20 L 22 18 L 24 20 L 23 22 Z" fill="white" /><path d="M 12 24 L 14 22 L 16 24 L 15 26 Z" fill="white" /></svg>; }
function ScenerySpaceNeedle() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 22 44 L 22 18 L 20 18 L 20 12 L 28 12 L 28 18 L 26 18 L 26 44 Z" fill="#a1a1aa" /><ellipse cx="24" cy="12" rx="16" ry="5" fill="#e5e7eb" /><rect x="22" y="6" width="4" height="6" fill="#ef4444" /></svg>; }
function ScenerySchool() { return <svg viewBox="0 0 48 48" className="w-full h-full"><rect x="6" y="20" width="36" height="24" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2" /><rect x="20" y="30" width="8" height="14" fill="#92400e" /><path d="M 4 20 L 24 10 L 44 20 Z" fill="#991b1b" /><rect x="22" y="6" width="4" height="6" fill="#fcd34d" /><path d="M 32 44 V 32 h 6 v 12 z" fill="#7dd3fc" /><path d="M 10 44 V 32 h 6 v 12 z" fill="#7dd3fc" /></svg>; }
