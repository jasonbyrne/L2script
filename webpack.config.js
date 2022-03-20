const path = require("path");

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve("app", "src", "main.ts"),
  devtool: "source-map",
  plugins: [
    new CopyWebpackPlugin([
      path.join("app", "index.html"),
      {
        from: path.join("app", "assets", "**", "*"),
        to: "assets",
        flatten: true,
      },
      {
        from: path.join("app", "help", "**", "*"),
        to: "help",
        flatten: true,
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 5000,
  },
};
