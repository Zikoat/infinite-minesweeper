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
			title: "Minefield Resurrected",
			filename: "index.html",
			path: "./dist",
			template: "./src/index.html",
			favicon: 'src/assets/favicon.ico'
		})],
	devtool: "inline-source-map",
	devServer: {
		contentBase: "./dist"
	},
	module: {
	     rules: [
		     {
		     	test: /\.(png|svg|jpg|gif|ico)$/,
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