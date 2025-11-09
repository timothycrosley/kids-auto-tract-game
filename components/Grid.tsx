import React from 'react';
import { GridCell, Car as CarType, TrackType, SceneryType } from '../types';
import CarComponent from './Car';
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, TOOL_MAP, SCENERY_MAP } from '../constants';

interface GridProps {
  grid: GridCell[][];
  cars: CarType[];
  turntableRotations: Map<string, number>;
  handleCellClick: (x: number, y: number) => void;
}

const TrackPiece: React.FC<{ type: TrackType | null, rotation?: number }> = ({ type, rotation }) => {
  if (type === null) return null;
  const tool = TOOL_MAP.find(t => t.tool === type);
  if (!tool) return null;
  
  const style: React.CSSProperties = rotation !== undefined
    ? { transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease-in-out' }
    : {};

  return (
    <div className="w-full h-full" style={style}>
      {tool.icon}
    </div>
  );
};

const SceneryPiece: React.FC<{ type: SceneryType | null }> = ({ type }) => {
  if (type === null) return null;
  return (
    <div className="w-full h-full p-1 opacity-90">
      {SCENERY_MAP[type]}
    </div>
  );
};

const Grid: React.FC<GridProps> = ({ grid, cars, turntableRotations, handleCellClick }) => {
  return (
    <div className="relative bg-green-900/50 overflow-hidden" style={{ width: GRID_WIDTH * TILE_SIZE, height: GRID_HEIGHT * TILE_SIZE }}>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)` }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="relative border border-gray-700/50 hover:bg-gray-700/50 cursor-pointer"
              style={{ width: TILE_SIZE, height: TILE_SIZE, background: '#166534' }}
              onClick={() => handleCellClick(x, y)}
            >
              <div className="absolute inset-0 z-1">
                 <SceneryPiece type={cell.scenery} />
              </div>
              <div className="absolute inset-0 z-0">
                <TrackPiece type={cell.ground} rotation={cell.ground === TrackType.TURNTABLE ? turntableRotations.get(`${x},${y}`) : undefined} />
              </div>
              <div className="absolute inset-0 z-10">
                <TrackPiece type={cell.air} />
              </div>
            </div>
          ))
        )}
      </div>
      {cars.map((car) => {
        const cell = grid[car.y]?.[car.x];
        if (!cell) return null;
        const trackType = car.level === 1 ? cell.air : cell.ground;
        return <CarComponent key={car.id} car={car} trackType={trackType} />;
      })}
    </div>
  );
};

export default Grid;