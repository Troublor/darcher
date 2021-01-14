// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
    mode: "production",
    devtool: "source-map",
    entry: "./src/trace-instrument.ts",
    output: {
        filename: "trace-instrument.web.js",
        path: path.resolve(__dirname, "..", "bundle"),
        libraryTarget: "commonjs2",
        sourceMapFilename: "trace-instrument.web.js.map",
    },
    resolve: {
        modules: [
            "node_modules",
            path.join(__dirname, "..", "..", "..", "node_modules"),
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
};
