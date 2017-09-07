/**
 * Created by sisc0606 on 19.08.2017.
 */
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
console.log(HtmlWebpackPlugin);

module.exports = {
	entry: "./src/index.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	plugins: [new HtmlWebpackPlugin({
			title: "change this meme"
		})],
	devtool: "inline-source-map",
	devServer: {
		contentBase: "./dist"
	},
	module: {
	     rules: [
		     {
		     	test: /\.(png|svg|jpg|gif)$/,
			     use:[
			     	"file-loader"
			     ]
		     },
		     {
			     test: /\.css$/,
			     use: [ 'style-loader', 'css-loader' ]
		     }
	     ]
	}
};