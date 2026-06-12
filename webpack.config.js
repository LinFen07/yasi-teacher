const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 导出 Webpack 配置函数，接收环境变量参数
module.exports = (env) => {
  // 判断当前环境（生产环境/开发环境）
  const isProduction = env.production;

  return {
    // 模式：生产环境会自动启用代码压缩等优化
    mode: isProduction ? 'production' : 'development',

    // 入口文件：TypeScript JSX 入口
    entry: path.resolve(__dirname, 'src/index.tsx'),

    // 输出配置
    output: {
      // 输出目录（生产环境构建目录）
      path: path.resolve(__dirname, 'build'),
      // 文件名：生产环境添加哈希值用于缓存控制
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/bundle.js',
      //  chunk 文件名（代码拆分后的文件）
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      // 清理输出目录（生产环境）
      clean: isProduction,
      // 公共路径（确保资源引用正确）
      publicPath: '/',
    },

    // 开发工具：生产环境禁用 sourcemap，开发环境启用
    devtool: isProduction ? false : 'eval-cheap-module-source-map',

    // 解析配置
    resolve: {
      // 路径别名（@ 指向 src 目录）
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // 优先解析的文件扩展名
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.scss', '.css'],
    },

    // 模块规则（处理不同类型的文件）
    module: {
      rules: [
        // 1. 处理 TypeScript 和 JSX
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/, // 排除 node_modules
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                // 处理 ES6+ 语法
                ['@babel/preset-env', { targets: 'defaults' }],
                // 处理 React
                ['@babel/preset-react', { runtime: 'automatic' }],
                // 处理 TypeScript
                '@babel/preset-typescript',
              ],
              // 缓存编译结果，加快二次构建
              cacheDirectory: true,
            },
          },
        },

        // 2. 处理 CSS
        {
          test: /\.css$/,
          use: [
            // 生产环境提取 CSS 到单独文件，开发环境用 style-loader 注入
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader', // 解析 CSS
            {
              loader: 'postcss-loader', // 自动添加浏览器前缀
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer'],
                },
              },
            },
          ],
        },

        // 3. 处理 SCSS/SASS
        {
          test: /\.(scss|sass)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: ['autoprefixer'],
                },
              },
            },
            'sass-loader', // 解析 SCSS
          ],
        },

        // 4. 处理图片
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset', // 自动选择是导出为文件还是 base64
          parser: {
            dataUrlCondition: {
              maxSize: 10 * 1024, // 10KB 以下的图片转为 base64
            },
          },
          generator: {
            // 图片输出路径
            filename: 'static/media/[name].[hash:8][ext]',
          },
        },

        // 5. 处理字体
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // 插件配置
    plugins: [
      // 1. 生成 HTML 文件并自动引入打包后的资源
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'), // 模板文件
        favicon: path.resolve(__dirname, 'public/favicon.ico'), // 图标
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),

      // 2. 定义环境变量（在代码中可通过 process.env 访问）
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.REACT_APP_API_URL': JSON.stringify('/api'),
      }),

      // 3. 生产环境：提取 CSS 到单独文件
      isProduction && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),

      // 4. 生产环境：Gzip 压缩
      isProduction && new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240, // 10KB 以上才压缩
        minRatio: 0.8, // 压缩率小于 0.8 才保留
      }),
    ].filter(Boolean), // 过滤掉 false 的插件（开发环境不启用生产插件）

    // 优化配置
    optimization: {
      // 生产环境启用代码拆分
      ...(isProduction && {
        splitChunks: {
          chunks: 'all', // 对所有类型的代码块进行拆分
          cacheGroups: {
            // React 相关库单独打包
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
              name: 'vendors-react',
              priority: 30,
              enforce: true,
            },
            // ECharts 相关库单独打包
            echarts: {
              test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
              name: 'vendors-echarts',
              priority: 20,
              enforce: true,
            },
            // 其他第三方库
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors-other',
              priority: 10,
              reuseExistingChunk: true,
            },
            // 业务代码公共部分
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
        // 提取 runtime 代码（避免 hash 变化）
        runtimeChunk: {
          name: (entrypoint) => `runtime-${entrypoint.name}`,
        },
      }),
    },

    // 开发服务器配置（仅开发环境生效）
    devServer: {
      open: true, // 自动打开浏览器
      host: 'localhost', // 主机地址
      port: 3001, // 端口号
      hot: true, // 启用热模块替换
      historyApiFallback: true, // 支持 SPA 路由（刷新不 404）
      allowedHosts: ['localhost', '127.0.0.1'], // 允许的主机

      // 服务器配置（替代旧版的 https 配置）
      server: {
        type: 'http', // 使用 http 协议
      },

      // 代理配置（解决跨域）
      proxy: [
        {
          context: '/api', // 匹配所有以 /api 开头的请求
          target: 'http://111.230.5.159:8668', // 后端 API 地址
          changeOrigin: true, // 跨域时修改 Origin 头
          pathRewrite: { '^/api': '' }, // 移除请求路径中的 /api 前缀
          secure: false, // 不验证 SSL 证书
          changeOrigin: true,
          timeout: 5000, // 超时时间 5 秒
        },
      ],

      // 客户端配置
      client: {
        overlay: {
          errors: true, // 错误时显示全屏覆盖层
          warnings: false, // 警告不显示覆盖层
        },
        progress: true, // 在浏览器中显示编译进度
      },
    },

    // 性能提示配置（避免生产环境大文件警告）
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000, // 入口文件最大 512KB
      maxAssetSize: 512000, // 单个资源最大 512KB
    },
  };
};
