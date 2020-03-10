let path = require("path");
let ExtractTextPlugin = require("extract-text-webpack-plugin");

let conf = {
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.min.js",
    publicPath: "dist/"
  },
  devServer: {
    overlay: true 
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/"
      }
    ]
  }
};

module.exports = (env, options) => {
  let prod = options.mode === "production";

  conf.devtool = prod ? false :  "eval-sourcemap";

  return conf;
};