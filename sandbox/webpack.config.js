var path = require('path');

module.exports = {
    entry: path.join(__dirname, 'public', 'src', 'app', 'main.ts'),
    output: {
        path: path.join(__dirname, 'public', 'dist'),
        filename: 'vendor.js'
    },
    resolve: {
        extensions: [ '', '.ts', '.js', '.css', '.scss' ],
		modules: [path.join(__dirname, "node_modules")],
        root: path.join(__dirname, 'public', 'src' ),
        alias: {
            'main': 'style/main.scss'
        },
        entry: {
            'style': ['main']
        }
    },
    module: {
        loaders: [
			{ test: /\.ts$/, loaders: ['babel-loader', 'ts-loader'] },
            {
                test: /\.js$/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015']
                }
            },
            { test: /\.css$/, loaders: ['style-loader', 'css-loader'] },
            //{ test: /\.scss$/, loaders: ['raw-loader', 'style-loader', 'css-loader', 'sass-loader'] },
			{ test: /\.scss$/, exclude: /node_modules/, loaders: ['raw-loader', 'sass-loader'] },			
            { test: /\.html$/, exclude: /lib/, loader: 'html-loader'},
            { test: /\.(png|ttf|otf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['file-loader'] },
            { test: /\.((png|woff(2))?(\?v=[0-9]\.[0-9]\.[0-9]))?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' }
        ]
    },
	devtool:'#inline-source-map',
	devServer: {
		port: 3000,
		stats: {
		  colors: true
		}/*,
		outputPath: '/dist/',
		contentBase: '/dist/'/,
		proxy: {
			'/facts/ws/*':  {
				target: 'http://localhost:7001',
				secure: false
			}
		}*/
	}
}