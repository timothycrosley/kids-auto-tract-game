import React from 'react';
import { Car, Direction, TrackType } from '../types';
import { TILE_SIZE } from '../constants';
import { useEffect, useState } from 'react';

interface CarProps {
  car: Car;
  trackType: TrackType | null;
}

const CarComponent: React.FC<CarProps> = ({ car, trackType }) => {
  const [lightColor, setLightColor] = useState('#ef4444');

  useEffect(() => {
    const blinker = setInterval(() => {
      setLightColor(prev => prev === '#ef4444' ? '#7f1d1d' : '#ef4444'); // red : dark-red
    }, 500);
    return () => clearInterval(blinker);
  }, []);
  
  const { x, y, direction, progress, design, level } = car;

  let top: number;
  let left: number;
  let rotation: number;

  const R = TILE_SIZE / 2;
  const tileCenterX = x * TILE_SIZE + R;
  const tileCenterY = y * TILE_SIZE + R;

  switch (trackType) {
    case TrackType.CURVE_NE: { // ╔ (top, right)
      if (direction === Direction.NORTH) { // came from EAST
        const angle = -progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = -90 * progress;
      } else { // EAST, came from NORTH
        const angle = -Math.PI / 2 + progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = -90 + 90 * progress;
      }
      break;
    }
    case TrackType.CURVE_SE: { // ╚ (bottom, right)
      if (direction === Direction.SOUTH) { // came from EAST
        const angle = progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = 90 * progress;
      } else { // EAST, came from SOUTH
        const angle = Math.PI / 2 - progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = 90 - 90 * progress;
      }
      break;
    }
    case TrackType.CURVE_SW: { // ╝ (bottom, left)
      if (direction === Direction.WEST) { // came from SOUTH
        const angle = Math.PI / 2 + progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = 90 + 90 * progress;
      } else { // SOUTH, came from WEST
        const angle = Math.PI - progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = 180 - 90 * progress;
      }
      break;
    }
    case TrackType.CURVE_NW: { // ╗ (top, left)
      if (direction === Direction.NORTH) { // came from WEST
        const angle = Math.PI + progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = 180 + 90 * progress;
      } else { // WEST, came from NORTH
        const angle = 1.5 * Math.PI - progress * Math.PI / 2;
        left = tileCenterX + Math.cos(angle) * R;
        top = tileCenterY + Math.sin(angle) * R;
        rotation = -90 - 90 * progress;
      }
      break;
    }
    default: {
      // Handles straight tracks, turntables, and is a fallback for other cases
      const isVertical = direction === Direction.NORTH || direction === Direction.SOUTH;
      const startOffset = -R;
      const currentOffset = startOffset + TILE_SIZE * progress;

      rotation = {
        [Direction.NORTH]: -90,
        [Direction.EAST]: 0,
        [Direction.SOUTH]: 90,
        [Direction.WEST]: 180,
      }[direction];

      if (isVertical) {
        top = tileCenterY + (direction === Direction.SOUTH ? currentOffset : -currentOffset);
        left = tileCenterX;
      } else {
        left = tileCenterX + (direction === Direction.EAST ? currentOffset : -currentOffset);
        top = tileCenterY;
      }
      break;
    }
  }

  const CarDesignComponent = design.component;

  return (
    <div
      className="absolute w-8 h-8 -ml-4 -mt-4"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: `rotate(${rotation}deg)`,
        zIndex: level === 1 ? 15 : 5,
      }}
    >
      <CarDesignComponent color={design.color} lightColor={lightColor} />
    </div>
  );
};

export default CarComponent;