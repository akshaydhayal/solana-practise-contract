import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util'
    }
  },
  optimizeDeps: {
    include: ['process', 'stream-browserify', 'util']
  }
})







// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     include: ['assert'], // 👈 force Vite to bundle the real assert
//     esbuildOptions: {
//       define: {
//         global: 'globalThis',
//         'process.env': '{}',
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           process: true,
//           buffer: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   resolve: {
//     alias: {
//       process: 'process/browser',
//       util: 'util',
//       buffer: 'buffer',
//       assert: require.resolve('assert/'), // 👈 force resolution to npm package
//     },
//   },
//   build: {
//     rollupOptions: {
//       plugins: [rollupNodePolyFill()],
//     },
//   },
// })











// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     esbuildOptions: {
//       define: {
//         global: 'globalThis',
//         'process.env': '{}',
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           process: true,
//           buffer: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   resolve: {
//     alias: {
//       process: 'process/browser',
//       util: 'util',
//       assert: 'assert/',
//       buffer: 'buffer',
//     },
//   },
//   build: {
//     rollupOptions: {
//       plugins: [rollupNodePolyFill()],
//     },
//   },
// })









// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     esbuildOptions: {
//       define: {
//         global: 'globalThis',
//         'process.env': '{}',
//       },
//       plugins: [
//         NodeGlobalsPolyfillPlugin({
//           buffer: true,
//           process: true,
//         }),
//         NodeModulesPolyfillPlugin(),
//       ],
//     },
//   },
//   resolve: {
//     alias: {
//       process: 'process/browser',
//       util: 'util',
//       assert: 'assert',
//       buffer: 'buffer',
//     },
//   },
// });










// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
