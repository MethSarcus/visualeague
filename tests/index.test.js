// __tests__/index.test.jsx

import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Page from '../app/page'

describe('Username Form', () => {
  it('renders a heading', () => {
    render(<Page />)

    const form = screen.getByTestId('username_form')

    expect(form).toBeInTheDocument()
  })
})