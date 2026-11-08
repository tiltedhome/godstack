import { expect, it } from 'vitest'
import { formatIQ, formatLogIQ, genLabel } from '../src/format.ts'

it('formats IQ across twenty-five orders of magnitude', () => {
  expect([1e-9, 1e-2, 0.3, 6, 60, 100, 14000, 9.1e6, 1e12, 3e12, 1e16].map(formatIQ)).toEqual([
    '10⁻⁹', '10⁻²', '0.3', '6', '60', '100', '14,000', '9.1 × 10⁶', '10¹²', '3 × 10¹²', '10¹⁶',
  ])
})

it('keeps formatting past the range of a double', () => {
  expect(formatLogIQ(100)).toBe('10¹⁰⁰')
  expect(formatLogIQ(400.477)).toBe('3 × 10⁴⁰⁰')
})

it('labels generations with a real minus sign', () => {
  expect([-3, 0, 2].map(genLabel)).toEqual(['−3', '0', '+2'])
})
