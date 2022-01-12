const config = {
  babelrc: false,
  presets: [
    // [
    //   "@babel/preset-env",
    //   {
    //     modules: false
    //   }
    // ],
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-transform-modules-commonjs",
    // "@babel/plugin-transform-runtime"
  ]
};
module.exports = require("babel-jest").createTransformer(config);