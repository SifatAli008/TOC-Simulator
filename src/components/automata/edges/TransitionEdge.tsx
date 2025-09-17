'use client'

import React, { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from 'reactflow'
import { Transition } from '@/types/automata'
import { Button } from '@/components/ui/button'
import { X, Edit } from 'lucide-react'

interface TransitionEdgeData {
  transition: Transition
  onUpdate: (transition: Transition) => void
  onDelete: () => void
  pathOffset?: number
  selfLoopOffset?: number
  edgeIndex?: number
  totalEdges?: number
}

export const TransitionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  source,
  target,
}: EdgeProps<TransitionEdgeData>) => {
  const { transition, onUpdate, onDelete, pathOffset = 0, selfLoopOffset = 0, edgeIndex = 0, totalEdges = 1 } = data
  const { setCenter } = useReactFlow()

  // Check if this is a self-loop
  const isSelfLoop = source === target

  let edgePath: string
  let labelX: number
  let labelY: number

  if (isSelfLoop) {
    // Create a circular path for self-loops with offset for multiple loops
    const baseRadius = 30
    const radius = baseRadius + selfLoopOffset
    const angle = (edgeIndex * 60) - 30 // Vary angle for multiple self-loops (-30°, 30°, 90°, etc.)
    const angleRad = (angle * Math.PI) / 180
    
    const offsetX = Math.cos(angleRad) * 20
    const offsetY = Math.sin(angleRad) * 20
    
    const centerX = sourceX + offsetX
    const centerY = sourceY - radius + offsetY
    
    edgePath = `M ${sourceX} ${sourceY - 8} 
                C ${centerX + radius} ${sourceY - 8}, 
                  ${centerX + radius} ${centerY}, 
                  ${centerX} ${centerY}
                C ${centerX - radius} ${centerY}, 
                  ${centerX - radius} ${sourceY - 8}, 
                  ${sourceX - 8} ${sourceY - 8}`
    
    labelX = centerX
    labelY = centerY - 10
  } else {
    // Use bezier path with offset for multiple edges between same nodes
    const result = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
    
    // Apply path offset for multiple edges
    if (pathOffset !== 0) {
      const midX = (sourceX + targetX) / 2
      const midY = (sourceY + targetY) / 2
      
      // Calculate perpendicular offset
      const dx = targetX - sourceX
      const dy = targetY - sourceY
      const length = Math.sqrt(dx * dx + dy * dy)
      
      if (length > 0) {
        const perpX = -dy / length
        const perpY = dx / length
        
        const offsetMidX = midX + perpX * pathOffset
        const offsetMidY = midY + perpY * pathOffset
        
        // Create custom bezier with offset
        edgePath = `M ${sourceX} ${sourceY} Q ${offsetMidX} ${offsetMidY} ${targetX} ${targetY}`
        labelX = offsetMidX
        labelY = offsetMidY - 15
      } else {
        edgePath = result[0]
        labelX = result[1]
        labelY = result[2]
      }
    } else {
      edgePath = result[0]
      labelX = result[1]
      labelY = result[2]
    }
  }

  const handleLabelClick = () => {
    // Focus on the edge
    setCenter((sourceX + targetX) / 2, (sourceY + targetY) / 2, { zoom: 1.2 })
  }

  const handleEdit = () => {
    // TODO: Open transition editor
    const newSymbol = prompt('Edit transition symbol:', transition.symbol)
    if (newSymbol !== null) {
      onUpdate({
        ...transition,
        symbol: newSymbol,
        label: newSymbol,
      })
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={`transition-all duration-200 ${
          selected 
            ? 'stroke-orange-500 stroke-2' 
            : 'stroke-gray-600 hover:stroke-blue-500 stroke-1'
        }`}
        markerEnd={isSelfLoop ? "url(#arrowhead-self)" : "url(#arrowhead)"}
        style={{
          strokeDasharray: totalEdges > 1 && edgeIndex % 2 === 1 ? '8,4' : undefined,
          strokeWidth: selected ? 3 : totalEdges > 1 ? 2 : 1.5,
        }}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`group relative border rounded-md px-2 py-1 text-sm font-medium shadow-lg transition-all duration-200 cursor-pointer ${
              selected 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200' 
                : totalEdges > 1
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 hover:border-blue-600'
                  : 'border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            } ${
              totalEdges > 1 ? 'shadow-md ring-1 ring-blue-200 dark:ring-blue-800' : ''
            }`}
            onClick={handleLabelClick}
          >
            <span className="text-gray-900 dark:text-gray-100">
              {transition.symbol}
            </span>
            
            {/* Action buttons (shown on hover or selection) */}
            {(selected) && (
              <div className="absolute -top-2 -right-2 flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 p-0 bg-white hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit()
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-6 h-6 p-0 bg-white hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>

      {/* Arrow marker definitions */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={selected ? '#f97316' : '#6b7280'}
            className="transition-colors duration-200"
          />
        </marker>
        <marker
          id="arrowhead-self"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={selected ? '#f97316' : '#6b7280'}
            className="transition-colors duration-200"
          />
        </marker>
      </defs>
    </>
  )
})
