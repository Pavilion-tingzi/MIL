const api = require('../config/settings'); 

const myrequest = (options) => {
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
    return new Promise((resolve,reject)=>{
        wx.request({
            url: api.refresh_token,
            method: 'POST',
            data: { "refresh": refresh },
            success:(res)=>{
                wx.setStorageSync('access_token', res.data.access)
                wx.setStorageSync('refresh_token',res.data.refresh)
                resolve(res.data.access)
            },
            fail:(err) => {
                reject(err);
            }
          })
    }) 
}
const authRequest = async (options) => {
    try {
      return await myrequest(options)
    } catch (err) {
      if (err.statusCode === 401) { // Token过期
        await refreshToken()
        return myrequest(options) // 重试请求
      }
      throw err
    }
}
const uploadFile = (options) => {
    const token = wx.getStorageSync('access_token');
    const defaultHeader = {
      'Authorization': `Bearer ${token}`
    };
  
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        ...options,
        header: { ...defaultHeader, ...options.header },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              res.data = JSON.parse(res.data); // 尝试解析返回数据
            } catch (e) {
              console.warn('响应数据不是有效JSON', res.data);
            }
            resolve(res);
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
}
/*** 带Token自动刷新的文件上传*/
const authUploadFile = async (options) => {
    try {
      return await uploadFile(options);
    } catch (err) {
      // 401且不是刷新token请求才尝试刷新
      if (err.statusCode === 401 && !options.url.includes('refresh_token')) {
        try{
            await refreshToken();
            return uploadFile(options);
        }catch(e){
            console.log(e)
        }
      }
      throw err; // 其他错误直接抛出
    }
};

/*** 微信showModal封装成promise对象*/
const showModalAsync = async (options) => {
    return new Promise((resolve) => {
      wx.showModal({
        ...options,
        success: resolve
      });
    });
};

module.exports = {
    myrequest,
    refreshToken,
    authRequest,
    authUploadFile,
    showModalAsync
  }