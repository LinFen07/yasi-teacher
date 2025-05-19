const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

// 自定义 Webpack 配置来禁用 source-map
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
        // 第三方依赖打包进 vendors.js
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        // 业务代码公共部分打包进 common.js
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          reuseExistingChunk: true,
        },
        // 可选：将 echarts 单独拆包
        echarts: {
          test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
          name: 'echarts',
          chunks: 'all',
          enforce: true,
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

  // 自定义 devServer 配置
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