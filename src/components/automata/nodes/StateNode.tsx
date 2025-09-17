'use client'

import React, { memo, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { State } from '@/types/automata'
import { cn } from '@/lib/utils'

interface StateNodeData {
  state: State
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
  onUpdate: (state: State) => void
  onContextMenu?: (event: React.MouseEvent) => void
  connectionMode?: boolean
  isSelectedForConnection?: boolean
}

export const StateNode = memo(({ data, selected }: NodeProps<StateNodeData>) => {
  const { state, isSelected, onSelect, onDoubleClick, onUpdate, onContextMenu, connectionMode, isSelectedForConnection } = data
  const [isHovered, setIsHovered] = useState(false)

  const getStateStyles = () => {
    if (state.isInitial && state.isFinal) {
      return 'bg-gradient-to-br from-orange-500 to-green-500 border-orange-600 text-white shadow-lg'
    }
    if (state.isInitial) {
      return 'bg-orange-500 border-orange-600 text-white shadow-lg'
    }
    if (state.isFinal) {
      return 'bg-green-500 border-green-600 text-white shadow-lg'
    }
    return 'bg-blue-500 border-blue-600 text-white shadow-md'
  }

  const getRingStyles = () => {
    if (isSelectedForConnection) {
      return 'ring-4 ring-orange-500 ring-offset-2 animate-pulse'
    }
    if (selected || isSelected) {
      return 'ring-2 ring-orange-400 ring-offset-2'
    }
    if (isHovered) {
      return 'ring-2 ring-blue-300 ring-offset-1'
    }
    if (connectionMode) {
      return 'ring-1 ring-gray-400 ring-offset-1'
    }
    return ''
  }

  return (
    <div className="relative">
      {/* Initial state arrow */}
      {state.isInitial && (
        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
          <div className="w-0 h-0 border-l-0 border-r-8 border-r-orange-500 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
        </div>
      )}

      {/* Main state circle */}
      <div
        className={cn(
          'w-16 h-16 rounded-full border-3 flex items-center justify-center text-sm font-bold cursor-pointer select-none transition-all duration-200',
          getStateStyles(),
          getRingStyles(),
          isHovered && 'scale-105',
          (selected || isSelected) && 'scale-110'
        )}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          onDoubleClick()
        }}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onContextMenu?.(e)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {state.name}

        {/* Final state inner circle */}
        {state.isFinal && (
          <div className="absolute inset-2 rounded-full border-2 border-white opacity-60" />
        )}
      </div>

      {/* Connection handles - More visible and user-friendly */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          "w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-blue-200 hover:border-blue-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          "w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-blue-200 hover:border-blue-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="target"
        position={Position.Right}
        className={cn(
          "w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-blue-200 hover:border-blue-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className={cn(
          "w-3 h-3 border-2 border-blue-500 bg-blue-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-blue-200 hover:border-blue-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />

      <Handle
        type="source"
        position={Position.Top}
        className={cn(
          "w-3 h-3 border-2 border-orange-500 bg-orange-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-orange-200 hover:border-orange-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={cn(
          "w-3 h-3 border-2 border-orange-500 bg-orange-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-orange-200 hover:border-orange-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          "w-3 h-3 border-2 border-orange-500 bg-orange-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-orange-200 hover:border-orange-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          "w-3 h-3 border-2 border-orange-500 bg-orange-100 rounded-full transition-all duration-200",
          "hover:w-4 hover:h-4 hover:bg-orange-200 hover:border-orange-600",
          isHovered || selected || isSelected ? "opacity-100" : "opacity-60"
        )}
      />

      {/* State type indicators */}
      {(state.isInitial || state.isFinal) && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {state.isInitial && (
              <span className="px-1 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">
                Start
              </span>
            )}
            {state.isFinal && (
              <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                Accept
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
})
