import { render, screen } from '@testing-library/react'
import StatusBadge from '@components/common/StatusBadge'

describe('StatusBadge', () => {
  it('renders Pending badge', () => {
    render(<StatusBadge status="pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders Approved badge', () => {
    render(<StatusBadge status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders Rejected badge', () => {
    render(<StatusBadge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders Corrected badge', () => {
    render(<StatusBadge status="corrected" />)
    expect(screen.getByText('Corrected')).toBeInTheDocument()
  })

  it('falls back to Pending for unknown status', () => {
    render(<StatusBadge status="unknown_status" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })
})
