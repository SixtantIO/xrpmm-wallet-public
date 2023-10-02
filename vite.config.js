import { defineConfig, loadEnv } from 'vite';

import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import polyfillNode from 'rollup-plugin-polyfill-node';

const viteConfig = ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, '', '') };

    return defineConfig({
        base: '/wallet/',  // base url path
        define: {
            'process.env': process.env,
        },
        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
                plugins: [
                    NodeGlobalsPolyfillPlugin({
                        process: true,
                        buffer: true,
                    }),
                ],
            },
        },
        build: {
            rollupOptions: {
                plugins: [polyfillNode()],
            },
        },
        resolve: {
            alias: {
                events: 'events',
                crypto: 'crypto-browserify',
                stream: 'stream-browserify',
                http: 'stream-http',
                https: 'https-browserify',
                ws: 'xrpl/dist/npm/client/WSWrapper',
            },
        },
        server: {
            port: 5174  // Set your desired port here
        },
    });
};

export default viteConfig;
