describe('Health Check', () => {
  it('should pass basic health check', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })

  it('should be able to import React', async () => {
    const React = await import('react')
    expect(React).toBeDefined()
    expect(typeof React.createElement).toBe('function')
  })
})
