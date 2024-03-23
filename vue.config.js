const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  transpileDependencies: true,
  devServer: {
    port: 3000,
    allowedHosts: [
      '8307r25r88.goho.co', // 允许访问的域名地址，即花生壳内网穿透的地址
      'xiaomol444.xyz',
    ],
    client: {
      overlay: false
    }
  },
  configureWebpack: {
    devtool: 'source-map'
  }
})
