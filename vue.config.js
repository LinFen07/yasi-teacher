module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://120.24.144.113:8668', // 核对地址和端口
        changeOrigin: true, // 开启跨域（关键）
        // pathRewrite: { '^/api': '' }, // 按需配置
        secure: false,
        timeout: 5000, // 增加超时时间，避免网络慢导致的连接失败
      }
    }
  }
};