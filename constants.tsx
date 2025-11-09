import React from 'react';
import { Tool, CarDesign, SceneryType } from './types';

export const GRID_WIDTH = 24;
export const GRID_HEIGHT = 16;
export const TILE_SIZE = 48; // in pixels
export const CAR_SPEED = 0.02; // progress per frame

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
const roadColor = "#4b5563";
const lineColor = "#eab308";
const bridgeRoadColor = "#71717a";
const bridgeLineColor = "white";
const bridgeRailColor = "#a1a1aa";
const tunnelWallColor = "#374151";

function TrackStraightV() { return <svg viewBox="0 0 48 48"><rect x="16" y="0" width="16" height="48" fill={roadColor} /><path d="M 24 0 V 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" /></svg>; }
function TrackStraightH() { return <svg viewBox="0 0 48 48"><rect x="0" y="16" width="48" height="16" fill={roadColor} /><path d="M 0 24 H 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" /></svg>; }
function TrackCurveNE() { return <svg viewBox="0 0 48 48"><path d="M 24 0 V 16 A 8 8 0 0 0 32 24 H 48" stroke={roadColor} strokeWidth="16" fill="none" /><path d="M 24 0 V 24 C 24 28.4183 27.5817 32 32 32 H 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" fill="none" /></svg>; }
function TrackCurveSE() { return <svg viewBox="0 0 48 48"><path d="M 48 24 H 32 A 8 8 0 0 0 24 32 V 48" stroke={roadColor} strokeWidth="16" fill="none" /><path d="M 48 24 H 32 C 27.5817 24 24 27.5817 24 32 V 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" fill="none" /></svg>; }
function TrackCurveSW() { return <svg viewBox="0 0 48 48"><path d="M 24 48 V 32 A 8 8 0 0 0 16 24 H 0" stroke={roadColor} strokeWidth="16" fill="none" /><path d="M 24 48 V 32 C 24 27.5817 20.4183 24 16 24 H 0" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" fill="none" /></svg>; }
function TrackCurveNW() { return <svg viewBox="0 0 48 48"><path d="M 0 24 H 16 A 8 8 0 0 1 24 16 V 0" stroke={roadColor} strokeWidth="16" fill="none" /><path d="M 0 24 H 16 C 20.4183 24 24 20.4183 24 16 V 0" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" fill="none" /></svg>; }
function TrackBridgeV() { return <svg viewBox="0 0 48 48" style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.5))' }}><rect x="14" y="0" width="2" height="48" fill={bridgeRailColor}/><rect x="32" y="0" width="2" height="48" fill={bridgeRailColor}/><rect x="16" y="0" width="16" height="48" fill={bridgeRoadColor} /><path d="M 24 0 V 48" stroke={bridgeLineColor} strokeWidth="1.5" strokeDasharray="6 4" /></svg>; }
function TrackBridgeH() { return <svg viewBox="0 0 48 48" style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.5))' }}><rect x="0" y="14" width="48" height="2" fill={bridgeRailColor}/><rect x="0" y="32" width="48" height="2" fill={bridgeRailColor}/><rect x="0" y="16" width="48" height="16" fill={bridgeRoadColor} /><path d="M 0 24 H 48" stroke={bridgeLineColor} strokeWidth="1.5" strokeDasharray="6 4" /></svg>; }
function TrackTunnelV() { return <svg viewBox="0 0 48 48"><rect x="16" y="0" width="16" height="48" fill={roadColor} /><path d="M 24 0 V 10 M 24 38 V 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" /><path d="M 12 0 A 12 12 0 0 1 36 0 V 6 H 12 V 0 Z" fill={tunnelWallColor} /><path d="M 12 48 A 12 12 0 0 0 36 48 V 42 H 12 V 48 Z" fill={tunnelWallColor} /><rect x="16" y="0" width="16" height="6" fill="black" /><rect x="16" y="42" width="16" height="6" fill="black" /></svg>; }
function TrackTunnelH() { return <svg viewBox="0 0 48 48"><rect x="0" y="16" width="48" height="16" fill={roadColor} /><path d="M 0 24 H 10 M 38 24 H 48" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" /><path d="M 0 12 A 12 12 0 0 1 0 36 H 6 V 12 H 0 Z" fill={tunnelWallColor} /><path d="M 48 12 A 12 12 0 0 0 48 36 H 42 V 12 H 48 Z" fill={tunnelWallColor} /><rect x="0" y="16" width="6" height="16" fill="black" /><rect x="42" y="16" width="6" height="16" fill="black" /></svg>; }
function TrackTurntable() { return <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#374151" stroke="#8b5cf6" strokeWidth="2"/><g><rect x="4" y="16" width="40" height="16" rx="2" fill={roadColor} /><path d="M 4 24 H 44" stroke={lineColor} strokeWidth="1.5" strokeDasharray="6 4" /></g></svg>; }
function EraserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>; }

function SceneryTree() { return <svg viewBox="0 0 48 48" className="w-full h-full"><rect x="22" y="34" width="4" height="10" fill="#854d0e" rx="1" /><circle cx="24" cy="24" r="12" fill="#16a34a" /><circle cx="16" cy="28" r="8" fill="#22c55e" /><circle cx="32" cy="28" r="8" fill="#22c55e" /></svg>; }
function SceneryRocks() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 10 44 C 5 44, 5 34, 12 34 H 36 C 43 34, 43 44, 38 44 Z" fill="#a1a1aa" /><path d="M 18 32 C 15 32, 15 26, 20 26 H 28 C 33 26, 33 32, 28 32 Z" fill="#71717a" /></svg>; }
function SceneryHouse() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 8 44 V 24 L 24 14 L 40 24 V 44 H 8 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" /><rect x="20" y="32" width="8" height="12" fill="#92400e" /><rect x="12" y="28" width="6" height="6" fill="#7dd3fc"/><rect x="30" y="28" width="6" height="6" fill="#7dd3fc"/></svg>; }
function SceneryMountain() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 10 44 L 20 20 L 26 30 L 32 24 L 42 44 Z" fill="#a1a1aa" /><path d="M 2 44 L 12 24 L 18 34 L 24 28 L 34 44 Z" fill="#71717a" /><path d="M 20 20 L 22 18 L 24 20 L 23 22 Z" fill="white" /><path d="M 12 24 L 14 22 L 16 24 L 15 26 Z" fill="white" /></svg>; }
function ScenerySpaceNeedle() { return <svg viewBox="0 0 48 48" className="w-full h-full"><path d="M 22 44 L 22 18 L 20 18 L 20 12 L 28 12 L 28 18 L 26 18 L 26 44 Z" fill="#a1a1aa" /><ellipse cx="24" cy="12" rx="16" ry="5" fill="#e5e7eb" /><rect x="22" y="6" width="4" height="6" fill="#ef4444" /></svg>; }
function ScenerySchool() { return <svg viewBox="0 0 48 48" className="w-full h-full"><rect x="6" y="20" width="36" height="24" fill="#fca5a5" stroke="#b91c1c" strokeWidth="2" /><rect x="20" y="30" width="8" height="14" fill="#92400e" /><path d="M 4 20 L 24 10 L 44 20 Z" fill="#991b1b" /><rect x="22" y="6" width="4" height="6" fill="#fcd34d" /><path d="M 32 44 V 32 h 6 v 12 z" fill="#7dd3fc" /><path d="M 10 44 V 32 h 6 v 12 z" fill="#7dd3fc" /></svg>; }
