import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tool, GridCell, Car, TurntableState, Direction, TrackType, SceneryType } from './types';
import { GRID_WIDTH, GRID_HEIGHT, CAR_SPEED, CAR_DESIGNS, TRACK_CONNECTIONS } from './constants';
import Grid from './components/Grid';
import Toolbar from './components/Toolbar';

const createInitialGrid = (): GridCell[][] => {
    const grid = Array(GRID_HEIGHT).fill(null).map(() =>
        Array(GRID_WIDTH).fill(null).map(() => ({ ground: null, air: null, scenery: null }))
    );
    // A simple clockwise loop - visually forms a rectangle
    // ╔ ═══════════ ╗
    // ║             ║
    // ╚ ═══════════ ╝

    // Row 5 (top): ╔ ═ ═ ╗
    grid[5][5].ground = TrackType.CURVE_NE;   // ╔ top-left corner
    grid[5][6].ground = TrackType.STRAIGHT_H; // ═ horizontal
    grid[5][7].ground = TrackType.STRAIGHT_H; // ═ horizontal
    grid[5][8].ground = TrackType.CURVE_NW;   // ╗ top-right corner

    // Column 8 (right): ║
    grid[6][8].ground = TrackType.STRAIGHT_V; // ║ vertical
    grid[7][8].ground = TrackType.STRAIGHT_V; // ║ vertical

    // Row 8 (bottom): ╚ ═ ═ ╝
    grid[8][8].ground = TrackType.CURVE_SW;   // ╝ bottom-right corner
    grid[8][7].ground = TrackType.STRAIGHT_H; // ═ horizontal
    grid[8][6].ground = TrackType.STRAIGHT_H; // ═ horizontal
    grid[8][5].ground = TrackType.CURVE_SE;   // ╚ bottom-left corner

    // Column 5 (left): ║
    grid[6][5].ground = TrackType.STRAIGHT_V; // ║ vertical
    grid[7][5].ground = TrackType.STRAIGHT_V; // ║ vertical

    return grid;
};

const initialCars: Car[] = [{
    id: 0,
    x: 6, y: 5,  // On the top horizontal straight
    level: 0,
    direction: Direction.EAST, // Traveling east along the top
    entryFrom: Direction.WEST,
    progress: 0,
    design: CAR_DESIGNS[0]
}];


const TOOL_TO_SCENERY: Partial<Record<Tool, SceneryType>> = {
    [Tool.TREE]: SceneryType.TREE,
    [Tool.ROCKS]: SceneryType.ROCKS,
    [Tool.HOUSE]: SceneryType.HOUSE,
    [Tool.MOUNTAIN]: SceneryType.MOUNTAIN,
    [Tool.SPACE_NEEDLE]: SceneryType.SPACE_NEEDLE,
    [Tool.SCHOOL]: SceneryType.SCHOOL,
};

type SavedTrackData = {
    grid: GridCell[][];
    turntables: TurntableState[];
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridCell[][]>(createInitialGrid);
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [turntables, setTurntables] = useState<TurntableState[]>([]);
  const [turntableRotations, setTurntableRotations] = useState<Map<string, number>>(new Map());
  const [selectedTool, setSelectedTool] = useState<Tool | null>(Tool.STRAIGHT_H);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [savedTracks, setSavedTracks] = useState<Record<string, SavedTrackData>>({});
  
  const nextCarId = useRef(initialCars.length);
  const animationFrameId = useRef<number>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
        const tracksRaw = localStorage.getItem('react-auto-track-saves');
        if (tracksRaw) {
            setSavedTracks(JSON.parse(tracksRaw));
        }
    } catch (e) {
        console.error("Failed to load tracks from local storage", e);
    }
  }, []);

  const resetToStarterLoop = useCallback(() => {
    setGrid(createInitialGrid());
    setTurntables([]);
    setTurntableRotations(new Map());
    setCars(initialCars.map(car => ({ ...car })));
    nextCarId.current = initialCars.length;
    setIsLoadModalOpen(false);
  }, []);

  const playSound = useCallback((type: 'place' | 'erase' | 'car' | 'turntable') => {
    if (!audioCtxRef.current) return;
    const audioCtx = audioCtxRef.current;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

    switch (type) {
      case 'place':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
        break;
      case 'erase':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
        break;
      case 'car':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        break;
      case 'turntable':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
        break;
    }
  }, []);

  const getOppositeDirection = (dir: Direction): Direction => {
    return (dir + 2) % 4;
  };
  
  const getNextTile = (x: number, y: number, dir: Direction): {x: number, y: number} => {
    if (dir === Direction.NORTH) return { x, y: y - 1 };
    if (dir === Direction.EAST) return { x: x + 1, y };
    if (dir === Direction.SOUTH) return { x, y: y + 1 };
    if (dir === Direction.WEST) return { x: x - 1, y };
    return { x, y };
  };

  const getTrackAt = (x: number, y: number, level: 0 | 1): TrackType | null => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return null;
    const cell = grid[y][x];
    return level === 0 ? cell.ground : cell.air;
  };

  const getExitDirection = (track: TrackType, entryDir: Direction): Direction | null => {
    const options = TRACK_CONNECTIONS[track];
    if (!options) return null;
    const match = options.find(conn => conn.entry === entryDir);
    return match ? match.exit : null;
  };

  const gameLoop = useCallback(() => {
    setCars(prevCars => prevCars.map(car => {
        let { x, y, level, direction, progress, id, design, entryFrom } = car;
        progress += CAR_SPEED;
        if (progress >= 1) {
            progress = 0;
            const currentDirection = direction;
            const nextPos = getNextTile(x, y, currentDirection);

            let nextTrack = getTrackAt(nextPos.x, nextPos.y, level);
            let nextLevel: 0 | 1 = level;

            if (nextTrack === null && level === 1) {
                nextTrack = getTrackAt(nextPos.x, nextPos.y, 0); // try landing from bridge
                if (nextTrack !== null) {
                    nextLevel = 0;
                }
            } else if (getTrackAt(nextPos.x, nextPos.y, 1) !== null) {
                nextTrack = getTrackAt(nextPos.x, nextPos.y, 1); // prefer going onto bridge
                nextLevel = 1;
            }

            if (nextTrack !== null) {
                x = nextPos.x;
                y = nextPos.y;
                level = nextLevel;
                const entrySide = getOppositeDirection(currentDirection);
                entryFrom = entrySide;
                
                if (nextTrack === TrackType.TURNTABLE) {
                    const turntable = turntables.find(t => t.x === x && t.y === y);
                    if (turntable) {
                        const connections = [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST].filter(dir => {
                            if(dir === entrySide) return false;
                            const checkPos = getNextTile(x, y, dir);
                            const neighborTrack = getTrackAt(checkPos.x, checkPos.y, level);
                            if (neighborTrack === null) return false;
                            const neighborExit = getExitDirection(neighborTrack, getOppositeDirection(dir));
                            return neighborExit !== null;
                        });
                        if (connections.length > 0) {
                            const currentIndex = connections.indexOf(turntable.activeExit as Direction);
                            const nextExit = connections[(currentIndex + 1) % connections.length];
                            direction = nextExit;
                            turntable.activeExit = nextExit;
                            
                            playSound('turntable');
                            setTurntableRotations(prev => {
                                const newMap = new Map(prev);
                                const rotations = { [Direction.NORTH]: 0, [Direction.EAST]: 90, [Direction.SOUTH]: 180, [Direction.WEST]: 270 };
                                newMap.set(`${x},${y}`, rotations[nextExit]);
                                return newMap;
                            });
                        }
                    }
                } else {
                    const newDirection = getExitDirection(nextTrack, entrySide);
                    if (newDirection !== null) {
                        direction = newDirection;
                    }
                }
            }
        }
        return { id, x, y, level, direction, entryFrom, progress, design };
    }));
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [grid, turntables, playSound]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  const getInitialDirectionForTrack = (track: TrackType): Direction => {
    switch (track) {
      case TrackType.STRAIGHT_V:
      case TrackType.BRIDGE_V:
      case TrackType.TUNNEL_V:
      case TrackType.CURVE_SW:
      case TrackType.CURVE_SE:
        return Direction.SOUTH;
      case TrackType.CURVE_NW:
        return Direction.WEST;
      case TrackType.CURVE_NE:
      case TrackType.STRAIGHT_H:
      case TrackType.BRIDGE_H:
      case TrackType.TUNNEL_H:
      default:
        return Direction.EAST;
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (!audioCtxRef.current) {
       try {
         audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
       } catch (e) { console.error("Web Audio API is not supported in this browser"); }
    }

    if (selectedTool === null) return;
    
    if (selectedTool === Tool.ERASER) {
      playSound('erase');
      setGrid(prev => {
        const newGrid = prev.map(r => r.slice());
        newGrid[y][x] = { ground: null, air: null, scenery: null };
        return newGrid;
      });
      setTurntables(prev => prev.filter(t => t.x !== x || t.y !== y));
      setTurntableRotations(prev => {
        const newMap = new Map(prev);
        newMap.delete(`${x},${y}`);
        return newMap;
      });
      return;
    }

    if (selectedTool >= Tool.CAR_1 && selectedTool <= Tool.CAR_5) {
      if (cars.length >= 5) return;
      const track = grid[y][x].ground || grid[y][x].air;
      if (track) {
          playSound('car');
          const carDesign = CAR_DESIGNS[selectedTool - Tool.CAR_1];
          const initialDirection = getInitialDirectionForTrack(track);
          setCars(prev => [...prev, {
            id: nextCarId.current++,
            x, y,
            level: grid[y][x].air ? 1 : 0,
            direction: initialDirection,
            entryFrom: getOppositeDirection(initialDirection),
            progress: 0,
            design: carDesign
          }]);
      }
      return;
    }

    const sceneryType = TOOL_TO_SCENERY[selectedTool];
    if (sceneryType !== undefined) {
      const cell = grid[y][x];
      if (cell.ground === null && cell.air === null) {
        playSound('place');
        setGrid(prev => {
          const newGrid = prev.map(r => r.map(c => ({...c})));
          newGrid[y][x].scenery = sceneryType;
          return newGrid;
        });
      }
      return;
    }
    
    playSound('place');
    const newTrack = selectedTool as unknown as TrackType;
    const isBridge = [Tool.BRIDGE_H, Tool.BRIDGE_V].includes(selectedTool);
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({...c})));
      newGrid[y][x].scenery = null; // Clear scenery when placing track
      if (isBridge) {
        newGrid[y][x].air = newTrack;
      } else {
        newGrid[y][x].ground = newTrack;
      }
      return newGrid;
    });

    if (selectedTool === Tool.TURNTABLE) {
      setTurntables(prev => [...prev.filter(t => t.x !== x || t.y !== y), { x, y, activeExit: Direction.EAST }]);
      setTurntableRotations(prev => new Map(prev).set(`${x},${y}`, 90));
    }
  };

  const handleSaveTrack = () => {
    const trackName = prompt("Enter a name for your track:");
    if (trackName) {
        const dataToSave: SavedTrackData = {
            grid,
            turntables,
        };
        const newSavedTracks = { ...savedTracks, [trackName]: dataToSave };
        setSavedTracks(newSavedTracks);
        localStorage.setItem('react-auto-track-saves', JSON.stringify(newSavedTracks));
        alert(`Track "${trackName}" saved!`);
    }
  };

  const handleLoadTrack = (trackName: string) => {
    const trackData = savedTracks[trackName];
    if (trackData) {
        setGrid(trackData.grid);
        setTurntables(trackData.turntables);
        const newRotations = new Map<string, number>();
        trackData.turntables.forEach(t => {
            const rotations = { [Direction.NORTH]: 0, [Direction.EAST]: 90, [Direction.SOUTH]: 180, [Direction.WEST]: 270 };
            newRotations.set(`${t.x},${t.y}`, rotations[t.activeExit ?? Direction.EAST]);
        });
        setTurntableRotations(newRotations);
        setCars([]); // Clear cars when loading a new track
        setIsLoadModalOpen(false);
    }
  };
  
  const handleDeleteTrack = (trackName: string) => {
    if (window.confirm(`Are you sure you want to delete "${trackName}"?`)) {
        const newSavedTracks = { ...savedTracks };
        delete newSavedTracks[trackName];
        setSavedTracks(newSavedTracks);
        localStorage.setItem('react-auto-track-saves', JSON.stringify(newSavedTracks));
    }
  };

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center font-sans p-4 bg-gray-900">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-200 tracking-wider">React Auto Track</h1>
            <div className="flex gap-2">
                <button onClick={handleSaveTrack} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-colors">Save</button>
                <button onClick={() => setIsLoadModalOpen(true)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors">Load</button>
            </div>
        </div>
        <div className="border-4 border-gray-700 rounded-lg shadow-2xl bg-gray-800">
          <Grid grid={grid} cars={cars} turntableRotations={turntableRotations} handleCellClick={handleCellClick} />
        </div>
      </div>
      <Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} carCount={cars.length} />
      {isLoadModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center" onClick={() => setIsLoadModalOpen(false)}>
              <div className="bg-gray-800 text-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <h2 className="text-2xl font-bold mb-4">Load a Track</h2>
                  <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                      <div className="flex justify-between gap-3 items-center bg-gray-700 p-3 rounded-lg border border-gray-600">
                          <div>
                              <p className="font-semibold">Starter Loop</p>
                              <p className="text-sm text-gray-300">Restore the original rectangular loop with a demo car.</p>
                          </div>
                          <button onClick={resetToStarterLoop} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-sm font-semibold">Load</button>
                      </div>
                      {Object.keys(savedTracks).length > 0 ? Object.keys(savedTracks).map(name => (
                          <div key={name} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                              <span className="font-medium">{name}</span>
                              <div className="flex gap-2">
                                  <button onClick={() => handleLoadTrack(name)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-semibold">Load</button>
                                  <button onClick={() => handleDeleteTrack(name)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold">Delete</button>
                              </div>
                          </div>
                      )) : (
                          <p className="text-gray-400">No saved tracks yet. Click "Save" to create one!</p>
                      )}
                  </div>
                   <button onClick={() => setIsLoadModalOpen(false)} className="mt-6 w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">Close</button>
              </div>
          </div>
      )}
    </main>
  );
};

export default App;
