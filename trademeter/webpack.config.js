const path = require("path");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = (env, options) => {
  const prod = options.mode === "production";

  const entry = "./src/index.js";
  const devtool = prod ? false : "eval-sourcemap";

  const old = {
    entry,
    devtool: false,
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "index.js",
      publicPath: "build/"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: "/node_modules/",
          use: "babel-loader",
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ? (
              ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                  // Translates CSS into CommonJS
                  "css-loader?url=false",
                  // Autoprefixer
                  {
                    loader: "postcss-loader",
                    options: {
                      plugins: [
                        require("postcss-custom-properties"),
                        require("autoprefixer")({
                          overrideBrowserslist: ["ie >= 8", "last 4 version"]
                        }),
                        // require("group-css-media-queries")
                        require("postcss-csso"),
                      ],
                      // sourceMap: true
                    }
                  },
                  {
                    loader: "resolve-url-loader",
                  },
                  // Compiles Sass to CSS
                  {
                    loader: "sass-loader",
                    options: {
                      webpackImporter: false,
                      sassOptions: {
                        publicPath: "./",
                        // outputStyle: "compressed",
                      },
                    },
                  }
                ],
                publicPath: "/build"
              })
            )
            : (
              [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader?url=false",
                // Autoprefixer
                {
                  loader: "postcss-loader",
                  options: {
                    plugins: [
                      require("postcss-custom-properties"),
                      require("autoprefixer")({
                        overrideBrowserslist: ["ie >= 8", "last 4 version"]
                      }),
                      // require("group-css-media-queries")
                      // require("postcss-csso"),
                    ],
                    sourceMap: true
                  }
                },
                {
                  loader: "resolve-url-loader",
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
          loader: "file-loader",
          query: {
            name: "[path][name].[ext]"
          }
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: "file-loader",
          query: {
            name: "[path][name].[ext]"
          }
        },
      ]
    },
    plugins: [
      new ExtractTextPlugin("css/style.css")
    ]
  };

  const modern = {
    entry,
    devtool,
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "bundle.es6.js",
      // publicPath: "build/"
    },
    devServer: {
      hot: true,
      overlay: true,
      contentBase: path.join(__dirname, ""),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [],
        },
        {
          test: /\.s[ac]ss$/i,
          use: prod
            ? (
              ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [
                  // Translates CSS into CommonJS
                  "css-loader?url=false",
                  // Autoprefixer
                  {
                    loader: "postcss-loader",
                    options: {
                      plugins: [
                        require("postcss-custom-properties"),
                        require("autoprefixer")({
                          overrideBrowserslist: ["ie >= 8", "last 4 version"]
                        }),
                        // require("group-css-media-queries")
                        require("postcss-csso"),
                      ],
                      // sourceMap: true
                    }
                  },
                  {
                    loader: "resolve-url-loader",
                  },
                  // Compiles Sass to CSS
                  {
                    loader: "sass-loader",
                    options: {
                      webpackImporter: false,
                      sassOptions: {
                        publicPath: "./",
                        // outputStyle: "compressed",
                      },
                    },
                  }
                ],
                publicPath: "/build"
              })
            )
            : (
              [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader?url=false",
                // Autoprefixer
                {
                  loader: "postcss-loader",
                  options: {
                    plugins: [
                      require("postcss-custom-properties"),
                      require("autoprefixer")({
                        overrideBrowserslist: ["ie >= 8", "last 4 version"]
                      }),
                      // require("group-css-media-queries")
                      // require("postcss-csso"),
                    ],
                    sourceMap: true
                  }
                },
                {
                  loader: "resolve-url-loader",
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
          loader: "file-loader",
          query: {
            name: "[path][name].[ext]"
          }
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          loader: "file-loader",
          query: {
            name: "[path][name].[ext]"
          }
        },
      ]
    },
    plugins: [
      new ExtractTextPlugin("css/style.css")
    ]
  };

  return [modern]
};