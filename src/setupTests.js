import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom no implementa matchMedia; ThemeToggle el fa servir per saber la
// preferència de l'SO quan no hi ha res desat a localStorage.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
