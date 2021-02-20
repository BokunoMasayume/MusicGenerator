import path from 'path';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const extensions = ['.ts', '.js', '.json'];
const tsconfig = path.resolve(__dirname, 'tsconfig.json');
const plugins = [
    json(),
    resolve({
        mainFields: ['jsnext:main', 'main', 'browser', 'module'],
        // jsnext: true,
        // main: true,
        // browser: true,
        // module: true
    }),
    commonjs(),
    typescript({
        tsconfig,
        clean: true,
        tsconfigOverride : {
            compilerOptions: {
                target: 'es5',
            }
        },
        rollupCommonJSResolveHack: false,
    }),
    babel({
        extensions,
        exclude: 'node_modules/**',
        "presets": ['@babel/env'],
    })
];
export default {
    input : './src/index.ts',
    output: {
        file: './dist/bundle.js',
        format: 'umd',
        name: 'MusicGenerator',
    },
    plugins,
}