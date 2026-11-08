/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// One self-contained index.html: the same file serves GitHub Pages and the Claude artifact.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: mode === 'artifact' ? 'dist-artifact' : 'dist',
    target: 'es2022',
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
}))
