import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import webpack from "webpack";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: webpack.Configuration = {
  plugins: [
    new webpack.ProvidePlugin({
      $: "zepto-webpack",
    }),
    new HtmlWebpackPlugin({
      template: "./src/playground.html",
      filename: "index.html",
      chunks: ["playground"],
    }),
  ],
  devtool: process.env.NODE_ENV === "production" ? "hidden-source-map" : "eval-source-map",
  entry: {
    playground: "./src/playground.ts",
  },
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                declaration: false,
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
    fallback: {
      fs: false,
      path: false,
    },
  },
};

export default config;
