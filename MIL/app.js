// app.js
App({
    onLaunch: function() {
        // 请求拦截
        wx.addInterceptor('request', {
          config: (config) => {
            const token = wx.getStorageSync('token')
            if (token) {
              config.header = config.header || {}
              config.header['Authorization'] = `Bearer ${token}`
            }
            return config
          },
          fail: (err) => {
            console.error('请求失败:', err)
          }
        })
      }
})
