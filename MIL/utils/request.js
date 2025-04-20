const request = (options) => {
    const token = wx.getStorageSync('access_token')
    
    const header = {
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    }

    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        header: { ...header, ...options.header }, // 合并头部
        success: resolve,
        fail: reject
      })
    })
}
const refreshToken = async () => {
    const refresh = wx.getStorageSync('refresh_token')
    const res = await wx.request({
      url: api.refresh_token,
      method: 'POST',
      data: { refresh }
    })
    wx.setStorageSync('access_token', res.data.access)
    wx.setStorageSync('refresh_token',res.data.refresh)
    return res.data.access
}
const authRequest = async (options) => {
    try {
      return await request(options)
    } catch (err) {
      if (err.statusCode === 401) { // Token过期
        const newToken = await refreshToken()
        options.header = options.header || {}
        options.header.Authorization = `Bearer ${newToken}`
        return request(options) // 重试请求
      }
      throw err
    }
}
module.exports = {
    request,
    refreshToken,
    authRequest
  }