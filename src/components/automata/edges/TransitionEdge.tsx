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
  sourceHandle?: string | null
  targetHandle?: string | null
  isBidirectional?: boolean
  curveDirection?: number
  sameDirectionCount?: number
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
  const { 
    transition, 
    onUpdate, 
    onDelete, 
    pathOffset = 0, 
    selfLoopOffset = 0, 
    edgeIndex = 0, 
    totalEdges = 1,
    sourceHandle,
    targetHandle,
    isBidirectional = false,
    curveDirection = 0,
    sameDirectionCount = 1
  } = data || {}
  const { setCenter } = useReactFlow()

  // Guard clause - if no data or transition, render nothing
  if (!data || !transition) {
    return null
  }

  // Check if this is a self-loop
  const isSelfLoop = source === target

  let edgePath: string
  let labelX: number
  let labelY: number

  if (isSelfLoop) {
    // Create smaller, well-spaced self-loops
    const baseRadius = 25 // Smaller base radius for compact loops
    const radiusIncrement = 20 // Moderate spacing between loops
    const radius = baseRadius + (selfLoopOffset * 2) + (edgeIndex * radiusIncrement)
    
    // Optimal angle distribution for multiple self-loops
    const angleStep = 72 // 72° between loops (5 loops max around circle)
    const angle = (edgeIndex * angleStep) // Distribute evenly around node
    const angleRad = (angle * Math.PI) / 180
    
    // Moderate offset for compact but separated loops
    const offsetX = Math.cos(angleRad) * 25
    const offsetY = Math.sin(angleRad) * 25
    
    const centerX = sourceX + offsetX
    const centerY = sourceY - radius + offsetY
    
    edgePath = `M ${sourceX} ${sourceY - 8} 
                C ${centerX + radius} ${sourceY - 8}, 
                  ${centerX + radius} ${centerY}, 
                  ${centerX} ${centerY}
                C ${centerX - radius} ${centerY}, 
                  ${centerX - radius} ${sourceY - 8}, 
                  ${sourceX - 8} ${sourceY - 8}`
    
    // Compact self-loop label positioning - close but separated
    const labelRadius = radius + 12 // Close to smaller loop
    const labelAngle = angleRad + (edgeIndex * Math.PI/5) // 36° separation for tighter spacing
    
    labelX = centerX + (Math.cos(labelAngle) * labelRadius)
    labelY = centerY + (Math.sin(labelAngle) * labelRadius)
  } else {
    // Enhanced bezier path calculation with bidirectional edge support
    let curvature = 0.2
    
    // Special handling for bidirectional edges
    if (isBidirectional) {
      // Use pathOffset directly for bidirectional curves (already calculated with proper direction)
      curvature = Math.abs(pathOffset) / 100 // Convert pathOffset to curvature
      curvature = Math.max(0.3, Math.min(1.2, curvature)) // Clamp between 0.3 and 1.2
      
      // Apply curve direction
      if (pathOffset !== 0) {
        const midX = (sourceX + targetX) / 2
        const midY = (sourceY + targetY) / 2
        
        // Calculate perpendicular offset for bidirectional separation
        const dx = targetX - sourceX
        const dy = targetY - sourceY
        const length = Math.sqrt(dx * dx + dy * dy)
        
        if (length > 0) {
          const perpX = -dy / length
          const perpY = dx / length
          
          const offsetMidX = midX + perpX * pathOffset
          const offsetMidY = midY + perpY * pathOffset
          
          // Create smooth quadratic curve for bidirectional edges
          edgePath = `M ${sourceX} ${sourceY} Q ${offsetMidX} ${offsetMidY} ${targetX} ${targetY}`
          
          // Bidirectional edge label positioning - alternating sides with separation
          const edgeAngle = Math.atan2(targetY - sourceY, targetX - sourceX)
          const labelDistance = 30 + (edgeIndex * 20) // Progressive distance
          
          // Alternate sides and add vertical separation
          const curveDirection = pathOffset > 0 ? 1 : -1
          const sideMultiplier = edgeIndex % 2 === 0 ? 1 : -1 // Alternate sides
          const labelAngle = edgeAngle + (Math.PI/2 * curveDirection * sideMultiplier)
          
          const labelOffsetX = Math.cos(labelAngle) * labelDistance
          const labelOffsetY = Math.sin(labelAngle) * labelDistance - (edgeIndex * 20) // Vertical separation
          
          labelX = offsetMidX + labelOffsetX
          labelY = offsetMidY + labelOffsetY
        } else {
          const result = getBezierPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            curvature,
          })
          edgePath = result[0]
          labelX = result[1]
          labelY = result[2]
        }
      } else {
        // Fallback to standard bezier
        const result = getBezierPath({
          sourceX,
          sourceY,
          sourcePosition,
          targetX,
          targetY,
          targetPosition,
          curvature,
        })
        edgePath = result[0]
        labelX = result[1]
        labelY = result[2]
      }
    } else {
      // Standard edge handling (non-bidirectional)
      if (sameDirectionCount > 1) {
        curvature = 0.25 + Math.abs(pathOffset) * 0.01
      }
      
      // Reduce curvature when using specific connection points
      if (sourceHandle && targetHandle) {
        curvature = Math.max(0.1, curvature * 0.7)
      }
      
      const result = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature,
      })
      
      // Apply path offset for multiple edges when not using specific connection points
      if (pathOffset !== 0 && (!sourceHandle || !targetHandle)) {
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
          // Curved edge label positioning - aligned with curve peak
          const edgeAngle = Math.atan2(targetY - sourceY, targetX - sourceX)
          const labelDistance = 20 + (edgeIndex * 12) // Progressive but close distance
          
          // Position labels at the curve peak, perpendicular to edge
          const labelAngle = edgeAngle + Math.PI/2
          const labelOffsetX = Math.cos(labelAngle) * labelDistance
          const labelOffsetY = Math.sin(labelAngle) * labelDistance
          
          labelX = offsetMidX + labelOffsetX
          labelY = offsetMidY + labelOffsetY
        } else {
          edgePath = result[0]
          labelX = result[1]
          labelY = result[2] - 20 // Positioned above edge but aligned
        }
      } else {
        edgePath = result[0]
        labelX = result[1]
        labelY = result[2] - 20 // Positioned above edge but aligned
        
        // Aggressive label separation to eliminate all overlaps
        if (sameDirectionCount > 1 && edgeIndex > 0) {
          const dx = targetX - sourceX
          const dy = targetY - sourceY
          const length = Math.sqrt(dx * dx + dy * dy)
          
          if (length > 0) {
            // Calculate perpendicular direction
            const perpX = -dy / length
            const perpY = dx / length
            
            // Create maximum separation pattern to eliminate all overlaps
            const separationDistance = 60 * edgeIndex // Maximum separation
            const verticalSeparation = 40 * edgeIndex // Maximum vertical separation
            
            // Alternate sides and create diagonal pattern
            const side = edgeIndex % 2 === 0 ? 1 : -1
            const diagonalOffset = edgeIndex * 30
            
            // Position labels with extreme separation
            labelX += perpX * separationDistance * side + diagonalOffset * side
            labelY -= verticalSeparation // Always move up significantly
            
            // Additional corner positioning for very crowded areas
            if (edgeIndex > 2) {
              const cornerX = (edgeIndex % 4) * 50 - 100
              const cornerY = -Math.floor(edgeIndex / 4) * 60
              labelX += cornerX
              labelY += cornerY
            }
          }
        }
      }
    }
  }

  const handleLabelClick = () => {
    // Focus on the edge
    setCenter((sourceX + targetX) / 2, (sourceY + targetY) / 2, { zoom: 1.2 })
  }

  const handleEdit = () => {
    // TODO: Open transition editor
    const newSymbol = prompt('Edit transition symbol:', transition.symbol)
    if (newSymbol !== null && onUpdate) {
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
        markerEnd="url(#arrowhead)" // Consistent arrow for all edges including self-loops
        style={{
          strokeWidth: selected ? 3 : 2, // Consistent width
          stroke: selected ? '#ff6b35' : '#374151', // Consistent color - only selection changes
          opacity: 0.9, // Consistent opacity
        }}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 1000, // Ensure labels are above edges
          }}
          className="nodrag nopan"
        >
          <div
            className={`group relative border-2 rounded-lg px-3 py-2 text-sm font-bold shadow-lg backdrop-blur-sm transition-all duration-200 cursor-pointer ${
              selected 
                ? 'border-orange-500 bg-orange-100/95 dark:bg-orange-900/70 text-orange-900 dark:text-orange-100' 
                : 'border-gray-500 bg-white/95 dark:bg-gray-800/95 dark:border-gray-400 hover:border-blue-500 hover:bg-blue-50/95 dark:hover:bg-blue-900/50 text-gray-900 dark:text-gray-100'
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
                    if (onDelete) {
                      onDelete()
                    }
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
          markerWidth="12"
          markerHeight="8"
          refX="10"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4, 0 8"
            fill={selected ? '#f97316' : '#374151'}
            stroke={selected ? '#f97316' : '#374151'}
            strokeWidth="0.5"
            className="transition-colors duration-200"
          />
        </marker>
        <marker
          id="arrowhead-self"
          markerWidth="12"
          markerHeight="8"
          refX="10"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 12 4, 0 8"
            fill={selected ? '#f97316' : '#374151'}
            stroke={selected ? '#f97316' : '#374151'}
            strokeWidth="0.5"
            className="transition-colors duration-200"
          />
        </marker>
      </defs>
    </>
  )
})
