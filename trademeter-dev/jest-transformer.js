const config = {
  babelrc: false,
  presets: [
    [
      "@babel/env",
      {
        modules: false
      }
    ],
    "@babel/react"
  ],
  plugins: [
    "@babel/plugin-transform-modules-commonjs"
  ]
};
module.exports = require("babel-jest").createTransformer(config);