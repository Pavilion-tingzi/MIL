// pages/login/login.js
import api from '../../config/settings'

Page({
    data: {
        show: false,
        show_rg: false,
        username: "",
        password: "",
        checked: false,
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
                
                if (res.statusCode === 200) {
                // 存储token和用户信息
                wx.setStorageSync('access_token', res.data.access)
                wx.setStorageSync('userInfo', res.data.user)
                wx.setStorageSync('refresh_token', res.data.refresh)
                
                // 跳转到首页
                wx.switchTab({
                    url: '/pages/index/index'
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
        // 处理注册数据逻辑
        // 关闭弹出页，需要增加判断是否注册成功逻辑
        this.setData({ show_rg: false, checked: false});
    }
})