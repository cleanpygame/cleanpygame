import type {PluginOption} from 'vite';
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import {generate} from './src/levels_compiler/main.js'
import * as path from "node:path";

function generateJson() {
    generate("levels", "src/data/levels.json");
}

function levelsGeneratorPlugin(): PluginOption {
    return {
        name: 'vite-plugin-generate-json',

        configureServer(server) {
            generateJson();

            server.watcher.on('change', (changedPath) => {
                if (changedPath.includes(path.join('web', 'levels'))) {

                    generateJson();

                    // Full browser reload
                    server.ws.send({
                        type: 'full-reload',
                    });
                }
            });
        },
    };
}


// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        levelsGeneratorPlugin(),
        //visualizer({open: true})
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/analytics'
                    ]
                }
            }
        }
    }
})