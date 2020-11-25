const webpack = require("webpack");
const merge = require('webpack-merge');
const dev = require('./webpack.dev.js');

module.exports = env => {
    return merge(dev, {
        plugins: [
            // exclude locale files in moment
            new webpack.DefinePlugin({
                ANALYZER_WS_ADDR: JSON.stringify(`ws://localhost:1235`),
                // DB_ADDRESS: JSON.stringify(`${env.dbAddress}`),
                // DB_NAME: JSON.stringify(`${env.dbName}`),
            }),
        ]
    });
}

