let path = require("path");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
let autoprefixer = require("autoprefixer");

let conf = {
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.min.js",
    publicPath: "dist/"
  },
  devServer: {
    overlay: true,
    contentBase: path.join(__dirname, ''),
    watchContentBase: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules/"
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['ie >= 8', 'last 4 version']
                })
              ],
              sourceMap: true
            }
          },
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              webpackImporter: false,
              sassOptions: {
                outputStyle: "compressed",
              },
            },
          }
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader',
        ],
      },
    ]
  }
};

module.exports = (env, options) => {
  let prod = options.mode === "production";

  conf.devtool = prod ? false :  "eval-sourcemap";

  return conf;
};