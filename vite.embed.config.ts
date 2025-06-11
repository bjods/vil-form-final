import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/embed.tsx'),
        name: 'VLForm',
        fileName: 'embed',
        formats: ['umd']
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {},
          // Ensure we have a single bundle
          manualChunks: undefined,
        }
      },
      // Target modern browsers for smaller bundle
      target: 'es2015',
      // Optimize for size
      minify: true,
      // Don't clean dist to preserve main app build
      emptyOutDir: false,
      outDir: 'dist/embed'
    },
    define: {
      // Inject environment variables into the build
      'window.VL_ENV': JSON.stringify({
        VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
        VITE_GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY,
      }),
      // Replace import.meta.env calls
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
      'import.meta.env.MODE': JSON.stringify(mode),
      'import.meta.env.DEV': JSON.stringify(mode === 'development'),
      'import.meta.env.PROD': JSON.stringify(mode === 'production'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    css: {
      postcss: './postcss.config.js',
    }
  };
});