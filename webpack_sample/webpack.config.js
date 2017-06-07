const path = require('path');

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

    // 自动刷新浏览器
    // 依赖 webpack-dev-server
    devServer: {
        contentBase: '/public', // 本地服务器加载页面所在的目录
        colors: true,   // 终端输出结果为彩色
        historyApiFallback: true,   // 在spa中，所有页面跳转都指向index.html
        inline: true    // 当源文件改变是自动刷新页面
    }
};