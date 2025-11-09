
import React from 'react';
import { Tool } from '../types';
import { TOOL_MAP } from '../constants';

interface ToolbarProps {
  selectedTool: Tool | null;
  setSelectedTool: (tool: Tool | null) => void;
  carCount: number;
}

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, setSelectedTool, carCount }) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm p-2 rounded-xl shadow-lg flex items-center justify-center gap-1 z-20">
      {TOOL_MAP.map(({ tool, icon }) => {
        const isSelected = selectedTool === tool;
        const isCarTool = tool >= Tool.CAR_1 && tool <= Tool.CAR_5;
        const isDisabled = isCarTool && carCount >= 5;

        return (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool)}
            disabled={isDisabled}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 
              ${isSelected ? 'bg-indigo-600 scale-110 ring-2 ring-indigo-300' : 'bg-gray-700 hover:bg-gray-600'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={Tool[tool]}
          >
            <div className="w-8 h-8 text-gray-300">{icon}</div>
          </button>
        );
      })}
    </div>
  );
};

export default Toolbar;
