const path = require("path")
const uglify = require("uglifyjs-webpack-plugin"); //自带插件压缩js
const htmlPlugin = require("html-webpack-plugin"); //html路径到src
const copyWebpackPlugin = require('copy-webpack-plugin')
const glob = require('glob');

const webpack = require('webpack');
const PurifuCSSPlugin = require('purifycss-webpack')
const extracTextPlugin = require('extract-text-webpack-plugin');
const website = {}
console.log(encodeURIComponent(process.env.type))
if (process.env.type == "build") {
    website.publicPath = "dist/";
} else {
    website.publicPath = "/";
}
module.exports = {

    devtool: 'eval-source-map',
    //入口文件配置
    entry: {
        entry: "./src/entry.js",
        jquery: "jquery"
    },
    // 出口文件配置
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        // chunkFilename:"[name].js",
        publicPath: website.publicPath
    },
    // 解析模块
    module: {
        rules: [{
                test: /\.css$/,
                // css分离
                use: extracTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    }, 'postcss-loader']
                })
            },
            {
                test: /\.(gif|png|jpg)$/i,
                use: [{
                    loader: "url-loader",
                    options: {
                        limit: 8192,
                        outputPath: "img/",
                        name: '[hash:6].[name].[ext]'
                    }
                }]
            },
            //解决多余css
            {
                test: /\.html$/,
                loader: "html-loader"
            },
            {
                test: /\.less$/i,
                use: extracTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'less-loader']
                })

            },
            {
                test: /\.scss$/i,
                use: extracTextPlugin.extract({
                    fallback: "style-loader",
                    use: ['css-loader', 'sass-loader']
                })

            },
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }

        ],
    },
    // 插件
    plugins: [
        //压缩js
        new uglify(),

        //提取模板HTML到src目录
        new htmlPlugin({
            mimify: {
                //去掉html文件的属性双引号
                removeAtrributeQuotes: true
            },
            hash: true,
            template: "./src/index.html"
        }),
        //提取css
        new extracTextPlugin("./index.css"),
        //去除页面没用上的css
        new PurifuCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'src/*.html'))
        }),
        new webpack.ProvidePlugin({
            $: 'jquery'
        }),
        //作者声明
        new webpack.BannerPlugin('----wendzer---'),

        // 直接把src的某个路径文件复制到dist的某个文中
        // new copyWebpackPlugin([{
        //     from: __dirname + '/src/img',
        //     to: "image"
        // }]),
    ],

    //提取jq
    optimization: {
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "all"
                }
            }
        }
    },
    // 热开发服务器
    devServer: {
        //设置基本目录结构
        contentBase: path.resolve(__dirname, '/dist/'),
        //服务器的IP地址，可以使用IP也可以使用localhost
        host: '127.0.0.1',
        // 服务端压缩是否开启
        // compress: true,
        //配置服务端口号
        port: 9992,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

}