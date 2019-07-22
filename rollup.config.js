import typescript from "rollup-plugin-typescript2"
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import uglify from "rollup-plugin-uglify-es";

const production = process.env.NODE_ENV === 'production';

export default {
    input: ['src/core/index.ts'],
    output: {
        file: production ? "dist/weekly.min.js" : "dist/weekly.js",
        name: "weekly",
        format: 'es'
    },
    plugins: [
        typescript({}),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        commonjs(),
        production && uglify()
    ]
}
