const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env,argv) => {
	let devMode= argv.mode !== 'production';
	if(devMode)
		console.log("\x1b[35m[[DEVELOPMENT]] test building")
	else
		console.log("\x1b[36m[[PRODUCTION]] building")

return {
  mode: 'development', //'production',
  entry: './src/Main.js',
  plugins:[
  	new CleanWebpackPlugin({ 
  		dry:false,
  		cleanOnceBeforeBuildPatterns:['**/*','!styles','!styles/*','!assets','!assets/**/*'],
  		verbose: true
  	}),
  	new HtmlWebpackPlugin({template: './src/index.html'}),
  ],
  output: {
	    filename: '[name].[contenthash].js',
	    path: path.resolve(__dirname, "public"), // string
	    // the target directory for all output files
	},
	optimization: {
		runtimeChunk: 'single',
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
				lib:{
					test: path.resolve('src/lib'),
					name: 'libs',
					chunks:'all',
				}
			},
		},
	},
};
}