// Simple test to ensure Jest is working
describe('Simple Tests', () => {
  test('basic arithmetic', () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
  })

  test('string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO')
    expect('world'.length).toBe(5)
  })

  test('array operations', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  test('object operations', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.value).toBe(42)
  })
})
