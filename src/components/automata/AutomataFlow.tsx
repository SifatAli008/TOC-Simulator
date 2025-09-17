'use client'

import React, { useCallback, useMemo, useState } from 'react'
import 'reactflow/dist/style.css'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'

import { Automata, State, Transition } from '@/types/automata'
import { StateNode } from './nodes/StateNode'
import { TransitionEdge } from './edges/TransitionEdge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Maximize2, RotateCw, Link, MousePointer } from 'lucide-react'
import { ReactFlowContextMenu } from './ReactFlowContextMenu'

interface AutomataFlowProps {
  automata: Automata
  onAutomataChange: (automata: Automata) => void
  selectedState?: string
  onStateSelect?: (stateId: string) => void
  onStateDoubleClick?: (stateId: string) => void
  className?: string
}

// Define custom node and edge types
const nodeTypes: NodeTypes = {
  stateNode: StateNode,
}

const edgeTypes: EdgeTypes = {
  transitionEdge: TransitionEdge,
}

// Auto-layout function using Dagre
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 80 })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 80, height: 80 })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 40, // Center the node
        y: nodeWithPosition.y - 40,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export function AutomataFlow({
  automata,
  onAutomataChange,
  selectedState,
  onStateSelect,
  onStateDoubleClick,
  className = '',
}: AutomataFlowProps) {
  // State declarations first
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB')
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    type: 'node' | 'edge' | 'canvas'
    nodeId?: string
    edgeId?: string
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    type: 'canvas'
  })
  const [lastClickTime, setLastClickTime] = useState(0)
  const [connectionMode, setConnectionMode] = useState(false)
  const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<string | null>(null)

  // Convert states to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return automata.states.map((state) => ({
      id: state.id,
      type: 'stateNode',
      position: { x: state.x || 100, y: state.y || 100 },
      data: {
        state,
        isSelected: selectedState === state.id || selectedNodeForConnection === state.id,
        onSelect: () => {
          if (connectionMode) {
            if (selectedNodeForConnection === null) {
              // First node selected for connection
              setSelectedNodeForConnection(state.id)
              onStateSelect?.(state.id)
            } else {
              // Second node selected (could be same node for self-loop)
              const symbol = prompt(`Enter transition symbol${selectedNodeForConnection === state.id ? ' for self-loop' : ''}:`, 'a')
              if (symbol !== null) {
                const newTransition: Transition = {
                  id: `${selectedNodeForConnection}-${state.id}-${Date.now()}`,
                  from: selectedNodeForConnection,
                  to: state.id,
                  symbol: symbol || 'a',
                  label: symbol || 'a',
                }
                onAutomataChange({
                  ...automata,
                  transitions: [...automata.transitions, newTransition],
                })
              }
              setSelectedNodeForConnection(null)
              onStateSelect?.(null)
            }
          } else {
            onStateSelect?.(state.id)
          }
        },
        onDoubleClick: () => onStateDoubleClick?.(state.id),
        onUpdate: (updatedState: State) => {
          const updatedStates = automata.states.map((s) =>
            s.id === state.id ? updatedState : s
          )
          onAutomataChange({
            ...automata,
            states: updatedStates,
          })
        },
        onContextMenu: (event: React.MouseEvent) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setContextMenu({
            isOpen: true,
            position: { x: event.clientX, y: event.clientY },
            type: 'node',
            nodeId: state.id,
          })
        },
        connectionMode,
        isSelectedForConnection: selectedNodeForConnection === state.id,
      },
      draggable: true,
    }))
  }, [automata.states, selectedState, onStateSelect, onStateDoubleClick, automata, onAutomataChange, connectionMode, selectedNodeForConnection])

  // Convert transitions to React Flow edges with overlap prevention
  const initialEdges: Edge[] = useMemo(() => {
    // Group transitions by source-target pair to handle multiple edges
    const transitionGroups = new Map<string, Transition[]>()
    
    automata.transitions.forEach((transition) => {
      const key = `${transition.from}-${transition.to}`
      if (!transitionGroups.has(key)) {
        transitionGroups.set(key, [])
      }
      transitionGroups.get(key)!.push(transition)
    })

    const edges: Edge[] = []
    
    transitionGroups.forEach((transitions, key) => {
      transitions.forEach((transition, index) => {
        const isSelfLoop = transition.from === transition.to
        const isMultiple = transitions.length > 1
        
        // Calculate offset for multiple edges between same nodes
        let pathOffset = 0
        if (isMultiple && !isSelfLoop) {
          const totalEdges = transitions.length
          const edgeIndex = index
          // Spread edges around the center
          pathOffset = (edgeIndex - (totalEdges - 1) / 2) * 20
        }
        
        // For self-loops, vary the radius and position
        let selfLoopOffset = 0
        if (isSelfLoop && isMultiple) {
          selfLoopOffset = index * 15 // Offset each self-loop
        }

        edges.push({
          id: transition.id,
          source: transition.from,
          target: transition.to,
          type: 'transitionEdge',
          data: {
            transition,
            pathOffset,
            selfLoopOffset,
            edgeIndex: index,
            totalEdges: transitions.length,
            onUpdate: (updatedTransition: Transition) => {
              const updatedTransitions = automata.transitions.map((t) =>
                t.id === transition.id ? updatedTransition : t
              )
              onAutomataChange({
                ...automata,
                transitions: updatedTransitions,
              })
            },
            onDelete: () => {
              const updatedTransitions = automata.transitions.filter((t) => t.id !== transition.id)
              onAutomataChange({
                ...automata,
                transitions: updatedTransitions,
              })
            },
          },
          label: transition.symbol,
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
          labelStyle: { fontSize: 12, fontWeight: 600 },
          // Add curvature for multiple edges
          style: isMultiple && !isSelfLoop ? { 
            strokeDasharray: index % 2 === 1 ? '5,5' : undefined // Alternate dash patterns
          } : {},
        })
      })
    })

    return edges
  }, [automata.transitions, automata, onAutomataChange])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when automata changes
  React.useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

  // Handle node position changes (dragging)
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const updatedStates = automata.states.map((state) =>
        state.id === node.id
          ? { ...state, x: node.position.x, y: node.position.y }
          : state
      )
      onAutomataChange({
        ...automata,
        states: updatedStates,
      })
    },
    [automata, onAutomataChange]
  )

  // Handle new connections (transitions)
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Check if transition already exists
        const existingTransition = automata.transitions.find(
          t => t.from === connection.source && t.to === connection.target
        )
        
        if (existingTransition) {
          // Could show a toast notification here
          console.log('Transition already exists between these states')
          return
        }

        // Check if it's a self-loop
        const isSelfLoop = connection.source === connection.target
        
        // Prompt for transition symbol
        const symbol = prompt(`Enter transition symbol${isSelfLoop ? ' for self-loop' : ''}:`, isSelfLoop ? 'b' : 'a')
        if (symbol === null) return // User cancelled
        
        const newTransition: Transition = {
          id: `${connection.source}-${connection.target}-${Date.now()}`,
          from: connection.source,
          to: connection.target,
          symbol: symbol || (isSelfLoop ? 'b' : 'a'),
          label: symbol || (isSelfLoop ? 'b' : 'a'),
        }

        onAutomataChange({
          ...automata,
          transitions: [...automata.transitions, newTransition],
        })
      }
    },
    [automata, onAutomataChange]
  )

  // Auto-layout function
  const handleAutoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      layoutDirection
    )
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)

    // Update automata with new positions
    const updatedStates = automata.states.map((state) => {
      const layoutedNode = layoutedNodes.find((n) => n.id === state.id)
      return layoutedNode
        ? { ...state, x: layoutedNode.position.x, y: layoutedNode.position.y }
        : state
    })
    onAutomataChange({
      ...automata,
      states: updatedStates,
    })
  }, [nodes, edges, layoutDirection, setNodes, setEdges, automata, onAutomataChange])

  // Toggle layout direction
  const toggleLayoutDirection = useCallback(() => {
    setLayoutDirection((prev) => (prev === 'TB' ? 'LR' : 'TB'))
  }, [])

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string) => {
    if (contextMenu.type === 'node' && contextMenu.nodeId) {
      const state = automata.states.find(s => s.id === contextMenu.nodeId)
      if (!state) return

      switch (action) {
        case 'add-self-loop':
          const symbol = prompt('Enter symbol for self-loop:', 'b')
          if (symbol !== null) {
            const newSelfLoop: Transition = {
              id: `${contextMenu.nodeId}-${contextMenu.nodeId}-${Date.now()}`,
              from: contextMenu.nodeId,
              to: contextMenu.nodeId,
              symbol: symbol || 'b',
              label: symbol || 'b',
            }
            onAutomataChange({
              ...automata,
              transitions: [...automata.transitions, newSelfLoop],
            })
          }
          break
        case 'edit':
          onStateDoubleClick?.(contextMenu.nodeId)
          break
        case 'toggle-initial':
          const updatedStates = automata.states.map(s => 
            s.id === contextMenu.nodeId 
              ? { ...s, isInitial: !s.isInitial }
              : { ...s, isInitial: false } // Only one initial state allowed
          )
          onAutomataChange({ ...automata, states: updatedStates })
          break
        case 'toggle-final':
          const updatedFinalStates = automata.states.map(s => 
            s.id === contextMenu.nodeId 
              ? { ...s, isFinal: !s.isFinal }
              : s
          )
          onAutomataChange({ ...automata, states: updatedFinalStates })
          break
        case 'delete':
          const filteredStates = automata.states.filter(s => s.id !== contextMenu.nodeId)
          const filteredTransitions = automata.transitions.filter(
            t => t.from !== contextMenu.nodeId && t.to !== contextMenu.nodeId
          )
          onAutomataChange({ 
            ...automata, 
            states: filteredStates,
            transitions: filteredTransitions
          })
          break
        case 'connect-from':
          setSelectedNodeForConnection(contextMenu.nodeId)
          onStateSelect?.(contextMenu.nodeId)
          break
        case 'connect-to':
          if (selectedNodeForConnection) {
            const isSelfLoop = selectedNodeForConnection === contextMenu.nodeId
            const symbol = prompt(`Enter transition symbol${isSelfLoop ? ' for self-loop' : ''}:`, 'a')
            if (symbol !== null) {
              const newTransition: Transition = {
                id: `${selectedNodeForConnection}-${contextMenu.nodeId}-${Date.now()}`,
                from: selectedNodeForConnection,
                to: contextMenu.nodeId,
                symbol: symbol || 'a',
                label: symbol || 'a',
              }
              onAutomataChange({
                ...automata,
                transitions: [...automata.transitions, newTransition],
              })
            }
            setSelectedNodeForConnection(null)
            onStateSelect?.(null)
          }
          break
      }
    } else if (contextMenu.type === 'canvas') {
      switch (action) {
        case 'add-state':
          const newState: State = {
            id: `state-${Date.now()}`,
            name: `q${automata.states.length}`,
            x: contextMenu.position.x,
            y: contextMenu.position.y,
            isInitial: automata.states.length === 0,
            isFinal: false,
          }
          onAutomataChange({
            ...automata,
            states: [...automata.states, newState]
          })
          break
      }
    }
  }, [contextMenu, automata, onAutomataChange, onStateDoubleClick])

  // Handle canvas right-click
  const handleCanvasContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      type: 'canvas'
    })
  }, [])

  // Handle canvas double-click to create state
  const handleCanvasDoubleClick = useCallback((event: any) => {
    // For React Flow, we need to get the position from the flow viewport
    const flowInstance = event.target?.closest('.react-flow')
    if (!flowInstance) return
    
    const rect = flowInstance.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    const newState: State = {
      id: `state-${Date.now()}`,
      name: `q${automata.states.length}`,
      x: x,
      y: y,
      isInitial: automata.states.length === 0,
      isFinal: false,
    }
    
    onAutomataChange({
      ...automata,
      states: [...automata.states, newState]
    })
  }, [automata, onAutomataChange])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Connection Mode Overlay */}
      {connectionMode && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <Link className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {selectedNodeForConnection 
                ? `Click a target state to connect from "${automata.states.find(s => s.id === selectedNodeForConnection)?.name}"` 
                : 'Click a state to start connecting'}
            </span>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        attributionPosition="bottom-left"
        onPaneContextMenu={handleCanvasContextMenu}
        onPaneClick={(event) => {
          // Handle double-click detection manually
          const now = Date.now()
          const timeSinceLastClick = now - lastClickTime
          
          if (timeSinceLastClick < 300) {
            // Double-click detected
            handleCanvasDoubleClick(event)
          }
          
          setLastClickTime(now)
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls 
          position="top-left"
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />
        
        {/* Custom control panel */}
        <Panel position="top-right" className="space-x-2">
          <Button
            variant={connectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => setConnectionMode(!connectionMode)}
            className={connectionMode ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white/90 hover:bg-white"}
          >
            <Link className="h-4 w-4 mr-2" />
            Connect Mode
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoLayout}
            className="bg-white/90 hover:bg-white"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Auto Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLayoutDirection}
            className="bg-white/90 hover:bg-white"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {layoutDirection === 'TB' ? 'Horizontal' : 'Vertical'}
          </Button>
        </Panel>

        {/* Info panel */}
        <Panel position="bottom-right" className="bg-white/90 rounded-lg p-2 text-xs">
          <div className="space-y-1">
            <div>States: {automata.states.length}</div>
            <div>Transitions: {automata.transitions.length}</div>
            {connectionMode && (
              <div className="text-orange-600 font-medium">
                🔗 Connection Mode Active
              </div>
            )}
            <div className="text-gray-500">
              <div>• Double-click canvas to add state</div>
              <div>• Right-click for context menu</div>
              <div>• Right-click node → "Add Self-Loop"</div>
              {connectionMode ? (
                <div className="text-orange-600">• Click nodes to connect them</div>
              ) : (
                <div>• Drag from node handles to connect</div>
              )}
              <div className="text-blue-600">• Multiple edges auto-spaced</div>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* Context Menu */}
      <ReactFlowContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        type={contextMenu.type}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onAction={handleContextMenuAction}
        connectionMode={connectionMode}
        selectedNodeForConnection={selectedNodeForConnection}
      />
    </div>
  )
}
