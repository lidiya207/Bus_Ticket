import React, { createContext, useContext } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const theme = {
    colors: {
      black: '#000000',
      white: '#FFFFFF',
      brown: '#8B4513',
      brownLight: '#A0522D',
      brownDark: '#654321',
      grayLight: '#F5F5F5',
      gray: '#CCCCCC',
      grayDark: '#666666',
    },
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

