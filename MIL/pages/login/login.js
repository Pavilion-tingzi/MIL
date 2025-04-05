// pages/login/login.js
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
    onChange(event) {
        this.setData({
          checked: event.detail,
        });
    },
    onLogin(){
        wx.switchTab({
          url: '/pages/index/index',
        })
    },
    onRegister(){
        // 处理注册数据逻辑
        // 关闭弹出页，需要增加判断是否注册成功逻辑
        this.setData({ show_rg: false, checked: false});
    }
})