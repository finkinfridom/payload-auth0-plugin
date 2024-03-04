const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");

const MiniCSSExtractPlugin = require("mini-css-extract-plugin");
module.exports = {
  entry: {
    main: [path.resolve(__dirname, "dist/components/ui/index.js")],
  },
  externals: {
    react: "react",
  },
  output: {
    path: path.resolve(__dirname, "dist/components"),
    publicPath: "/",
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        extractComments: false,
      }),
    ],
  },
  mode: "production",
  stats: "errors-only",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
          {
            test: /\.(sa|sc|c)ss$/,
            sideEffects: true,
            use: [
              MiniCSSExtractPlugin.loader,
              "css-loader",
              {
                loader: "postcss-loader",
                options: {
                  postcssOptions: {
                    plugins: ["postcss-preset-env"],
                  },
                },
              },
              "sass-loader",
            ],
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve("file-loader"),
            options: {
              emitFile: false,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    modules: ["node_modules"],
  },
  plugins: [new MiniCSSExtractPlugin({})],
};
