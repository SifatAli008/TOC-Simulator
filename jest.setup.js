import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('./src/lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock React Flow
jest.mock('reactflow', () => ({
  ReactFlow: ({ children, ...props }) => <div data-testid="react-flow" {...props}>{children}</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  addEdge: jest.fn(),
  useReactFlow: () => ({
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn(),
    setEdges: jest.fn(),
    addNodes: jest.fn(),
    addEdges: jest.fn(),
    deleteElements: jest.fn(),
    fitView: jest.fn(),
    project: jest.fn(),
    screenToFlowPosition: jest.fn(),
  }),
  Controls: () => <div data-testid="react-flow-controls" />,
  MiniMap: () => <div data-testid="react-flow-minimap" />,
  Background: () => <div data-testid="react-flow-background" />,
  Handle: ({ type, position, ...props }) => (
    <div data-testid={`handle-${type}-${position}`} {...props} />
  ),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
}))

// Setup global test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
