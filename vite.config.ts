import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://furekgiahpuetskjtkaj.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1cmVrZ2lhaHB1ZXRza2p0a2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODIzNjUsImV4cCI6MjA2NTA1ODM2NX0.TxL7iNQILqO70yKV-3XNEMGJQFxKPtvgy_WCJoaLG9o')
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure consistent file naming for embed.js to reference
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
