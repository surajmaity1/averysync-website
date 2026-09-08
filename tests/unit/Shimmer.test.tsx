import { Shimmer } from '@/components/common/shimmer'
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

describe('Shimmer Component Tests', () => {
  test('should render shimmer when loading', () => {
    render(<Shimmer className="animate-pulse rounded-2xl bg-gray-300" />)
    expect(screen.getByTestId('shimmer')).not.toBeNull()
  })
})
