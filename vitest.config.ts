import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Only run tests in the shipped app. src_old/ is a legacy snapshot and
    // .claude/worktrees/ holds other agents' checkouts — scanning them OOMs the runner.
    exclude: [
      'node_modules/**',
      'dist/**',
      'src_old/**',
      '**/src_old/**',
      '.claude/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}'
      ]
    }
  }
});