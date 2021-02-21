npm install --save-dev @babel/core @babel/cli @babel/preset-env @babel/preset-react @babel/plugin-proposal-object-rest-spread @babel/plugin-transform-arrow-functions babel-plugin-eslint-disable @babel/plugin-transform-spread
npm install --save @babel/polyfill

echo '{"ignore":["jinfres6/*"],"presets":["@babel/preset-react"],"plugins":["@babel/plugin-proposal-object-rest-spread","@babel/plugin-transform-arrow-functions","@babel/plugin-transform-spread","eslint-disable"]}' > babel.config.json
