const path = require("path");

var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env, options) => {
  var prod = options.mode === "production";

  var devtool = prod ? false : "eval-sourcemap";

  return {
    entry: "./src/js/main.js",
    devtool,
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "main.min.js",
      publicPath: "dist/"
    },
    devServer: {
      hot: true,
      overlay: true,
      contentBase: path.join(__dirname, ''),
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
          use: prod
            ? (
              ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  // Translates CSS into CommonJS
                  'css-loader?url=false',
                  // Autoprefixer
                  {
                    loader: 'postcss-loader',
                    options: {
                      plugins: [
                        require("postcss-custom-properties"),
                        require("autoprefixer")({
                          overrideBrowserslist: ['ie >= 8', 'last 4 version']
                        }),
                        // require("group-css-media-queries")
                        require("postcss-csso"),
                      ],
                      // sourceMap: true
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
                        publicPath: "./",
                        // outputStyle: "compressed",
                        data: '@import "main";',
                        includePaths: [
                          path.resolve(__dirname, "./src/sass/main.sass")
                        ],
                      },
                    },
                  }
                ],
                publicPath: '/dist'
              })
            )
            : (
              [
                // Creates `style` nodes from JS strings
                'style-loader',
                // Translates CSS into CommonJS
                'css-loader?url=false',
                // Autoprefixer
                {
                  loader: 'postcss-loader',
                  options: {
                    plugins: [
                      require("postcss-custom-properties"),
                      require("autoprefixer")({
                        overrideBrowserslist: ['ie >= 8', 'last 4 version']
                      }),
                      // require("group-css-media-queries")
                        // require("postcss-csso"),
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
                      // outputStyle: "compressed",
                      publicPath: "./"
                    },
                  },
                }
              ]
            )
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
    },
    plugins: [
      new ExtractTextPlugin("css/style.css")
    ]
  };
};