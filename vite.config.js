import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    // Configure URL rewriting for development
    proxy: {
      // Rewrite /auth/* to /src/auth/*
      '^/auth/(.*)$': {
        target: 'http://localhost:5173',
        rewrite: (path) => path.replace(/^\/auth/, '/src/pages/auth')
      },
      // Rewrite /dashboard.html  to /src/pages/dashboard.html
      '^/dashboard$': {
        target: 'http://localhost:5173',
        rewrite: () => '/src/pages/dashboard.html'
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'src/pages/dashboard.html',
        login: 'src/pages/auth/login.html',
        register: 'src/pages/auth/register.html'
      }
    }
  }
})
