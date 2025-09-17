import { render, screen } from '@testing-library/react'
import { StateNode } from '@/components/automata/nodes/StateNode'

// Mock React Flow
jest.mock('reactflow', () => ({
  Handle: ({ type, position, ...props }: any) => (
    <div data-testid={`handle-${type}-${position}`} {...props} />
  ),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
}))

describe('StateNode Component', () => {
  const mockData = {
    label: 'q0',
    isInitial: false,
    isFinal: false,
  }

  it('renders state node with label', () => {
    render(<StateNode data={mockData} />)
    expect(screen.getByText('q0')).toBeInTheDocument()
  })

  it('renders initial state with arrow indicator', () => {
    const initialStateData = { ...mockData, isInitial: true }
    render(<StateNode data={initialStateData} />)
    
    // Check for initial state indicator
    expect(screen.getByText('→')).toBeInTheDocument()
  })

  it('renders final state with double circle', () => {
    const finalStateData = { ...mockData, isFinal: true }
    render(<StateNode data={finalStateData} />)
    
    // Check for final state styling
    const stateNode = screen.getByTestId('state-node-q0')
    expect(stateNode).toHaveClass('border-4') // Double border for final state
  })

  it('renders both initial and final state correctly', () => {
    const initialFinalStateData = { ...mockData, isInitial: true, isFinal: true }
    render(<StateNode data={initialFinalStateData} />)
    
    expect(screen.getByText('→')).toBeInTheDocument()
    const stateNode = screen.getByTestId('state-node-q0')
    expect(stateNode).toHaveClass('border-4')
  })

  it('renders connection handles', () => {
    render(<StateNode data={mockData} />)
    
    // Check for input and output handles
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument()
    expect(screen.getByTestId('handle-target-left')).toBeInTheDocument()
    expect(screen.getByTestId('handle-source-right')).toBeInTheDocument()
  })
})
