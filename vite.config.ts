import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      input: {
        main: "./index.html",
        browser: "./preview.html",
      },
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          // Core React
          react: ['react', 'react-dom'],
          
          // Router (separate from React core)
          'react-router': ['react-router'],
          
          // UI libraries - split into smaller chunks
          'radix-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-switch',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-slider',
            '@radix-ui/react-radio-group',
          ],
          
          'radix-complex': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-select',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-aspect-ratio',
          ],
          
          // WebContainer (always needed)
          webcontainer: ['@webcontainer/api'],
          
          // Terminal - lazy loaded
          'xterm-core': [
            '@xterm/xterm',
            '@xterm/addon-fit',
            '@xterm/addon-web-links',
            '@xterm/addon-search',
            '@xterm/addon-unicode11',
            '@xterm/addon-serialize',
          ],
          
          // Monaco Editor - lazy loaded
          'monaco-editor': ['monaco-editor'],
          
          // Keep Monaco workers separate (they're already optimized)
          jsonWorker: ["monaco-editor/esm/vs/language/json/json.worker"],
          cssWorker: ["monaco-editor/esm/vs/language/css/css.worker"],
          htmlWorker: ["monaco-editor/esm/vs/language/html/html.worker"],
          tsWorker: ["monaco-editor/esm/vs/language/typescript/ts.worker"],
          editorWorker: ["monaco-editor/esm/vs/editor/editor.worker"],
          
          // Utility libraries
          'utils-core': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'uuid',
            'minimatch',
          ],
          
          // Date and validation
          'date-validation': [
            'date-fns',
            'zod',
          ],
          
          // Forms and state management
          'forms-state': [
            'react-hook-form',
            '@hookform/resolvers',
            'zustand',
            'usehooks-ts'
          ],
          
          // Animation and UI components
          'ui-animation': [
            'framer-motion',
            'embla-carousel-react',
            'vaul',
          ],
          
          // Icons and theming
          'icons-theme': [
            'lucide-react',
            'react-icons',
            'next-themes',
          ],
          
          // Form components
          'form-components': [
            'react-day-picker',
            'input-otp',
            'cmdk',
            'react-resizable-panels',
            'react-textarea-autosize',
          ],
          
          // Syntax highlighting - lazy loaded
          'syntax-highlighting': [
            'react-syntax-highlighter',
          ],
          
          // Charts - lazy loaded
          charts: ['recharts'],
          
          // Notifications
          notifications: ['sonner'],
          
          // Tauri APIs
          tauri: [
            '@tauri-apps/api',
            '@tauri-apps/plugin-opener',
            '@tauri-apps/plugin-clipboard-manager',
            '@tauri-apps/plugin-dialog',
            '@tauri-apps/plugin-fs',
            '@tauri-apps/plugin-http',
            '@tauri-apps/plugin-upload'
          ],
        },
        
        // Optimize chunk names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '') 
            : 'chunk';
          
          // Group small chunks to reduce HTTP requests
          if (chunkInfo.isEntry) {
            return `assets/[name]-[hash].js`;
          }
          
          // Use consistent naming for better caching
          return `assets/[name]-[hash].js`;
        },
        
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.');
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext ?? '')) {
            return `assets/img/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext ?? '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext ?? '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        // Additional output optimizations
        experimentalMinChunkSize: 1000,
        compact: true,
      },
      
      // Tree shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      },
    },
    
    // Optimize CSS
    cssMinify: 'lightningcss',
    
    // Optimize for production
    reportCompressedSize: false,
    chunkSizeWarningLimit: 800,
    
    // Increase chunk size limit for better compression
    assetsInlineLimit: 4096,
    
    // Optimize source maps
    sourcemap: false,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@webcontainer/api',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'zustand',
      'sonner',
    ],
    exclude: [
      // Exclude heavy dependencies that should be lazy loaded
      '@ai-sdk/google',
      '@ai-sdk/groq', 
      '@ai-sdk/openai',
      '@ai-sdk/openai-compatible',
      'monaco-editor',
      'react-syntax-highlighter',
      'recharts',
      '@xterm/xterm',
      '@xterm/addon-fit',
      '@xterm/addon-web-links',
      '@xterm/addon-search',
      '@xterm/addon-unicode11',
      '@xterm/addon-serialize',
      'framer-motion',
      'embla-carousel-react',
    ],
    
    // Optimize dependency pre-bundling
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis',
      },
      supported: {
        bigint: true,
      },
    },
  },
  
  // Performance optimizations
  esbuild: {
    target: 'esnext',
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    treeShaking: true,
  },
  
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1425,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  },
}));
