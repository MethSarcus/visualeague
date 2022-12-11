// __tests__/index.test.jsx

import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Page from '../app/page'

describe('Home', () => {
  it('Renders Form', () => {
    render(<Page />)
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    const form = screen.getByTestId('username_form')
    let input = screen.getByTestId('username_input')
    expect(input).toBeInTheDocument()
    expect(form).toBeInTheDocument()

  })

  it('Saves Username', () => {
    render(<Page />)
    jest.spyOn(window.localStorage.__proto__, 'setItem');
    let input = screen.getByTestId('username_input')
    fireEvent.change(input, {target: {value: 'MethSarcus'}})
    fireEvent.click(screen.getByTestId('username_submit'))
    
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(localStorage.getItem("usernames")).toContain("MethSarcus")
  })
})