/* eslint-disable */

// @ts-ignore
const shelljs = require("shelljs");

shelljs.cd("../..");
shelljs.exec('npm install --save-dev @babel/core @babel/cli @babel/preset-env');
shelljs.exec('npm install --save @babel/polyfill');
shelljs.exec('npm install --save-dev @babel/preset-react');
shelljs.exec('npm install --save-dev @babel/plugin-proposal-object-rest-spread');
shelljs.exec('npm install --save-dev @babel/plugin-transform-arrow-functions');
shelljs.exec('npm i babel-plugin-eslint-disable');
shelljs.exec('npm install --save-dev @babel/plugin-transform-spread');

const babelConfig = {
    "ignore": ["jinfres6/*"],
    "presets": [
        "@babel/preset-react",
    ],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-transform-arrow-functions",
        "@babel/plugin-transform-spread",
        "eslint-disable",
    ],
};

shelljs.echo(JSON.stringify(babelConfig)).to("babel.config.json");