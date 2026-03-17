import { render, screen, fireEvent } from '@testing-library/react'
import ExpandableCell from '@components/common/ExpandableCell'

const SHORT = 'Short text'
const LONG  = 'A'.repeat(100)

describe('ExpandableCell', () => {
  it('renders short text without expand link', () => {
    render(<ExpandableCell text={SHORT} />)
    expect(screen.getByText(SHORT)).toBeInTheDocument()
    expect(screen.queryByText(/more/i)).not.toBeInTheDocument()
  })

  it('renders expand link for long text', () => {
    render(<ExpandableCell text={LONG} />)
    expect(screen.getByText(/more/i)).toBeInTheDocument()
  })

  it('toggles between more and less', () => {
    render(<ExpandableCell text={LONG} />)
    const toggle = screen.getByText(/more/i)
    fireEvent.click(toggle)
    expect(screen.getByText(/less/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/less/i))
    expect(screen.getByText(/more/i)).toBeInTheDocument()
  })
})
