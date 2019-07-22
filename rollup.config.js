import typescript from 'rollup-plugin-typescript2';
import livereload from "rollup-plugin-livereload";
import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
    input: ['src/core/index.ts'],
    output: {
        file: "dist/weekly.js",
        name: "weekly",
        format: 'es'
    },
    plugins: [
        typescript(),
        babel({ runtimeHelpers: true })
    ],
    watch: {
        chokidar: false,
    },
}
