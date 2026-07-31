/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // jsdom 필요해지면 'jsdom'으로 변경
    globals: true,        // describe/it/expect를 import 없이 쓰게 해줌
  },
});