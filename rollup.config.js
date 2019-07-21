import typescript from "rollup-plugin-typescript";
import livereload from "rollup-plugin-livereload";
import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
    input: ['src/bootstrap.ts'],
    output: {
        file: "dist/weekly.js",
        name: "weekly",
        format: 'umd'
    },
    plugins: [
        typescript(),
        babel({ runtimeHelpers: true }),
        serve({
            open: true,
            contentBase: "",
            host: "127.0.0.1",
            port: 8000,
        }),
        livereload(),
    ],
    watch: {
        chokidar: false,
    },
}
