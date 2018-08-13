var path = require('path');

module.exports = {
	mode: "development",
    entry: path.join(__dirname, 'public', 'src', 'app', 'main.ts'),
    output: {
        path: path.join(__dirname, 'public', 'dist'),
        filename: 'vendor.js'
    },
    resolve: {
        extensions: [ '.ts', '.js', '.css', '.scss' ],
		modules: [path.join(__dirname, "node_modules")]
    },
	module: {
		rules: [
			{
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.scss$/,
				use: [
						"style-loader", // creates style nodes from JS strings
						"css-loader", // translates CSS into CommonJS
						"sass-loader" // compiles Sass to CSS, using Node Sass by default
					]		
            },
			{
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            }		
		],
	},   
	devtool:'#inline-source-map',
	devServer: {
		port: 3000,
		stats: {
		  colors: true
		}
	}
}