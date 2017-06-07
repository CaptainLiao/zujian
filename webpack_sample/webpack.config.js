const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // 配置生成 Source Maps
    devtool: 'eval-source-map',

    entry: __dirname + '/app/main.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    },

    // 配置loader
    module: {
        loaders: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            },{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },{
                test: /\.css$/,
                loader: 'style-loader!css-loader?modules!postcss-loader'
            }
        ]
    },
    //
    plugins: [
        new webpack.BannerPlugin("Copyright Flying Unicorns inc."),//在这个数组中new一个就可以了
        new HtmlWebpackPlugin({
           template: __dirname + '/app/index.tmpl.html'
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false
            }
        }),

        //热加载插件
        new webpack.HotModuleReplacementPlugin()
    ],

    // 自动刷新浏览器
    // 依赖 webpack-dev-server
    devServer: {
        contentBase: path.join(__dirname, 'public'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新,
        publicPath: '/',
        port: 3001
    }

};