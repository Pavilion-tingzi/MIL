// pages/login/login.js
import api from '../../config/settings'
const { authRequest } = require('../../utils/request')

Page({
    data: {
        show: false,
        show_rg: false,
        username: "",
        password: "",
        isAgreed: false,
        username_reg:"",
        nickname_reg:"",
        password_reg:"",
        password_reg2:"",
        email:"",
        code:"",
    },
    showPopup(){
        this.setData({ show: true });
    },
    showPopup_rg(){
        this.setData({ show_rg: true });
    },
    onClose() {
        this.setData({ show: false,show_rg: false });
    },
    onChange(e){
        const {field} = e.currentTarget.dataset;
        const value = e.detail;
        console.log(field,value);
        this.setData({
            [`${field}`]:value,
        });
    },
    onCheck(){
        this.setData({
            checked:!this.data.checked
        })
    },
    onLogin(){
        const username = this.data.username;
        const password = this.data.password;
    
        if (!username || !password) {
        wx.showToast({
            title: '请输入用户名和密码',
            icon: 'none'
        })
        return
        }
    
        wx.showLoading({
        title: '登录中...',
        })
    
        wx.request({
            url: api.login,
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            success: (res) => {
                wx.hideLoading()
                wx.clearStorage()
                if (res.statusCode === 200) {
                // 存储token和用户信息
                wx.setStorageSync('access_token', res.data.access)
                wx.setStorageSync('userInfo', res.data.user)
                wx.setStorageSync('refresh_token', res.data.refresh)
                
                wx.reLaunch({
                    url: '/pages/empty/empty', // 创建一个空白中转页
                    success: () => {
                      wx.switchTab({
                        url: '/pages/index/index' // 再跳转回首页
                      })
                    }
                  })
                } else {
                wx.showToast({
                    title: res.data.detail || '登录失败',
                    icon: 'none'
                })
                }
            },
            fail: (err) => {
                wx.hideLoading()
                wx.showToast({
                title: '网络错误',
                icon: 'none'
                })
            }
        })
    },
    onRegister(){
        if (!this.data.isAgreed) {
            wx.showToast({
              title: '请先同意用户协议',
              icon: 'none'
            });
            return;
        }
        wx.showLoading({
            title: '注册中...',
        })
        // 处理注册数据逻辑
        const username = this.data.username_reg
        const nickname = this.data.nickname_reg
        const password = this.data.password_reg
        const password2 = this.data.password_reg2
        const email = this.data.email
        const code = this.data.code

        wx.request({
            url: api.register,
            method: 'POST',
            data: {
                username: username,
                password: password,
                nickname: nickname,
                password2:password2,
                email:email,
                code:code
            },
            success: (res) => {
                wx.hideLoading()
                console.log(res)
                if (res.statusCode === 201) {
                //弹窗提示登录成功
                wx.showModal({
                    title: '', // 对话框标题
                    content: '注册成功，请进行登录', // 对话框内容
                    showCancel: false, // 是否显示取消按钮
                    confirmText: '确定', // 确定按钮的文本
                })
                this.setData({ 
                    show_rg: false, checked: false, show: true
                });
                } else {
                    const firstKey = Object.keys(res.data)[0];
                    wx.showModal({
                        title: '',
                        content: firstKey+":"+res.data[firstKey][0],
                        showCancel: false, // 是否显示取消按钮
                        confirmText: '确定', // 确定按钮的文本
                    })
                }
            },
            fail: (err) => {
                wx.hideLoading()
                wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                })
            }
        })
    },
    sendCode(){
        if(this.data.email !== ""){
            wx.request({
                url: api.sendEmailCode,
                method: 'POST',
                data: {
                    email:this.data.email,
                },
                success: (res) => {
                    console.log(res)
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        wx.showToast({
                            title: '已发至您邮箱',
                        })
                    } else {
                        const firstKey = Object.keys(res.data)[0];
                        wx.showModal({
                            title: '',
                            content: res.data[firstKey][0],
                            showCancel: false, // 是否显示取消按钮
                            confirmText: '确定', // 确定按钮的文本
                        })
                    }
                },
                fail: (err) => {
                    wx.showToast({
                        title: err,
                        icon: 'none'
                    })
                }
            })
        } else {
            wx.showToast({
                title: '请输入邮箱',
                icon: "none"
            })
        }  
    },
    toggleAgreement(){
        this.setData({
            isAgreed: !this.data.isAgreed
        });
    }
})