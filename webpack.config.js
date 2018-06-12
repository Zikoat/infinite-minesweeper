/**
 * Created by sisc0606 on 19.08.2017.
 */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
console.log(HtmlWebpackPlugin);

module.exports = {
	entry: "./src/client/index.js",
	output: {
		filename: "bundle-[hash].js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [new HtmlWebpackPlugin({
			title: "Minefield Resurrected",
			filename: "index.html",
			path: "./dist",
			template: "./src/client/index.html",
			favicon: 'src/assets/favicon.ico'
		})],
	devtool: "inline-source-map",
	devServer: {
		contentBase: "./dist"
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(png|svg|jpg|gif|ico)$/,
				use:[
					{
						loader: "file-loader",
						options: {
							name: "texture-[name]-[hash].[ext]"
						}
					}
				]
			},
			{
				 test: /\.css$/,
				 use: [ 'style-loader', 'css-loader' ]
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: 'file-loader?name=[name].[ext]'
			}
		]
	}
};