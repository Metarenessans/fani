const path = require("path");
const autoprefixer = require("autoprefixer");

let conf = {
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.min.js",
    publicPath: "dist/"
  },
  devServer: {
    hot: true,
    overlay: true,
    contentBase: path.join(__dirname, ''),
    // watchContentBase: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: "/node_modules/",
        loader: "babel-loader",
        query: {
          compact: false
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader?url=false',
          // Autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  overrideBrowserslist: ['ie >= 8', 'last 4 version']
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: 'resolve-url-loader',
          },
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              webpackImporter: false,
              sassOptions: {
                outputStyle: "compressed",
                publicPath: "./"
              },
            },
          }
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: 'file-loader',
        query: {
          name: '[path][name].[ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        loader: 'file-loader',
        query: {
          name: '[path][name].[ext]'
        }
      },
    ]
  }
};

module.exports = (env, options) => {
  let prod = options.mode === "production";

  conf.devtool = prod ? false :  "eval-sourcemap";

  return conf;
};