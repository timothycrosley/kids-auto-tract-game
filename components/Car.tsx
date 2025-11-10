import React from 'react';
import { Car, Direction, TrackType } from '../types';
import { TILE_SIZE, getTrackPose } from '../constants';
import { useEffect, useState } from 'react';

interface CarProps {
  car: Car;
  trackType: TrackType | null;
}

const CarComponent: React.FC<CarProps> = ({ car, trackType }) => {
  const [lightColor, setLightColor] = useState('#ef4444');

  useEffect(() => {
    const blinker = setInterval(() => {
      setLightColor(prev => prev === '#ef4444' ? '#7f1d1d' : '#ef4444');
    }, 500);
    return () => clearInterval(blinker);
  }, []);

  const { x, y, direction, entryFrom, progress, design, level } = car;
  const tileLeft = x * TILE_SIZE;
  const tileTop = y * TILE_SIZE;
  const pose = getTrackPose(trackType, entryFrom, direction, progress);
  const left = tileLeft + pose.x;
  const top = tileTop + pose.y;
  const rotation = pose.rotation;

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
