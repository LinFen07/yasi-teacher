const { override, addWebpackAlias } = require('customize-cra');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const path = require('path');

// 禁用 source-map
function disableSourceMap(config) {
  if (config && config.devtool) {
    config.devtool = false;
  }
  return config;
}

// 拆分 chunks
function splitChunks(config) {
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      cacheGroups: {
        // React 相关库单独打包
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 30,
          enforce: true,
        },
        // lodash 单独打包
        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: 'lodash',
          chunks: 'all',
          priority: 25,
          enforce: true,
        },
        // echarts 及其依赖单独打包
        echarts: {
          test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
          name: 'echarts',
          chunks: 'all',
          priority: 20,
          enforce: true,
        },
        // 业务代码公共部分打包进 common.js
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          reuseExistingChunk: true,
          priority: 10,
        },
        // 其它第三方依赖打包进 vendors.js
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 0,
        },
      },
    },
  };
  return config;
}

module.exports = override(
  // 禁用 source map
  disableSourceMap,

  // 添加 webpack 别名
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  }),

  // 拆分 chunks
  splitChunks,

  (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.plugins.push(
        new CompressionWebpackPlugin({
          test: /\.js$|\.css$/, // 压缩 js 和 css
          filename: '[path][base].gz', // 输出 .gz 文件
          algorithm: 'gzip',
          threshold: 10240,
          minRatio: 0.8, // 当压缩后的文件大小小于原始文件大小的 80% 时，才会保留该压缩文件。
          deleteOriginalAssets: false, // 删除原文件
        })
      );
    }
    return config;
  },

  // devServer 配置
  function (config, env) {
    config.devServer = {
      ...config.devServer,
      open: true,
      host: 'localhost',
      port: 3000,
      https: false,
      hotOnly: false,
      proxy: {
        '/api': {
          target: 'http://111.230.5.159:8668',
          changeOrigin: true,
          pathRewrite: { '^/api': '' },
          secure: false,
          withCredentials: true,
        },
      },
    };
    return config;
  }
);