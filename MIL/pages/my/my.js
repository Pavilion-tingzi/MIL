import Toast from '@vant/weapp/toast/toast';
import api from '../../config/settings'
const { myrequest, refreshToken, authRequest,authUploadFile } = require('../../utils/request')

Page({
  data: {
    //邀请消息
    has_news: true,
    news_icon: "/images/icon/news.png",
    inviteShow: false, //显示邀请消息列表
    inviteNews: [
        {
            id:"1",
            inviter:"小明",
            ignore:false,
        },
        {
            id:"2",
            inviter:"小张",
            ignore:false,
        },
        {
            id:"2",
            inviter:"小张",
            ignore:true,
        },
        {
            id:"2",
            inviter:"小张",
            ignore:true,
        },
        {
            id:"2",
            inviter:"小张",
            ignore:true,
        }
    ],
    //我的
    profile_icon:"/images/icon/profile.png",
    my_name:"小花",
    my_uniqueNum:"123321",
    showUniqueNum:false,
    newPsd:"",
    newPsdRpd:"",
    //团队
    group_info:"", //团队id和团队名称
    add_gpmb_icon:"/images/icon/add_gpmb.png",
    group_members:[
        {
            mb_icon:"/images/icon/mb_pf1.png",
            mb_delete_icon:"/images/icon/delete.png",
            mb_name:"张三"
        },
        {
            mb_icon:"/images/icon/mb_pf2.png",
            mb_delete_icon:"/images/icon/delete.png",
            mb_name:"李四"
        },
    ],
    //设置
    configs:[
        {
            cf_name:"工资",
            cf_account:"9900",
            cf_date:"3",
            cf_class:"发放"
        },
        {
            cf_name:"公积金",
            cf_account:"200",
            cf_date:"5",
            cf_class:"发放"
        },
        {
            cf_name:"房贷还款",
            cf_account:"5000",
            cf_date:"15",
            cf_class:"支付"
        }
    ],
    showAddConfig:false,
    showMdyConfig:false,
    newConfig: {
        cf_name: '',
        cf_account: '',
        cf_date: '',
        cf_class: ''
    },
    mdyConfig:{
        cf_name: '',
        cf_account: '',
        cf_date: '',
        cf_class: ''
    },
    mdyConfigIndex:"",
    radio:"1",
    //修改密码
    showResetPsd:false,
    //发出邀请
    showIssueInvite:false,
    inviteName:"",
    inviteUniqueNum:"",
    //修改头像
    showChangeAvatar:false,
    new_avatar:"",
    //所属用户组
    
  },
  onLoad(){
    this.fetchUserInfo()
    this.fetchGroupMembers()
  },
  onReady(){
    this.toast = this.selectComponent('#van-toast');
  },
  redirectToPage(){
    wx.redirectTo({
        url: '/pages/login/login'
      });
  },
  onLogoff(){
    // 显示确认弹窗
    wx.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 用户点击了确定
            this.redirectToPage();
          } else if (res.cancel) {
            // 用户点击了取消，什么都不做
          }
        }
    });
  },
  openInviteList(){
    this.setData({
        inviteShow: true,
    })
  },
  onClose(){
    this.setData({
        inviteShow: false,
        showResetPsd: false,
        showIssueInvite:false,
        showAddConfig:false,
        showMdyConfig:false,
        showChangeAvatar:false,
    })
  },
  ignoreInvite(e){
    const index = e.currentTarget.dataset.index; 
    this.setData({
        [`inviteNews[${index}].ignore`]:true,
    });
  },
  // 查看唯一码
  getUniqueNum(){
    this.setData({
        showUniqueNum:true,
    })
  },
  copyText() {
    wx.setClipboardData({
      data: this.data.my_uniqueNum,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'none'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },
  // 隐藏唯一码提示框
  hideModal() {
    this.setData({
        showUniqueNum:false,
    });
  },
  //修改密码
  showResetPsd(){
    this.setData({
        showResetPsd:true,
    })
  },
  //公用函数，前端输入框输入内容是，自动更新data中的数据
  onChange(e){
      const {field} = e.currentTarget.dataset;
      const value = e.detail;
      console.log(field,value);
      this.setData({
          [`${field}`]:value,
      });
  },
  //修改密码弹窗中点击确认的逻辑
  onResetPsd(){
      if(this.data.newPsd===""){
        Toast("密码不能为空");
      } else if (this.data.newPsd===this.data.newPsdRpd) {
        Toast("密码设置成功,请重新登录");
        //更新数据库中的密码

        setTimeout(() => {
            wx.redirectTo({
                url: '/pages/login/login'
            });
          }, 3000);
      } else {
        Toast("两次输入的密码不相同");
      }
  },
  //发邀请弹窗控制
  issueInvite(){
    this.setData({
        showIssueInvite:true,
    })
  },
  //发邀请弹窗中点击确认的逻辑
  onSentInvite(){
      if(this.data.inviteName==="" || this.data.inviteUniqueNum===""){
        Toast("昵称或唯一码不能为空");
      } else {
          //还需要增加后端判断，昵称和唯一码是否匹配
          //以下是匹配的情况，还需要把邀请数据入库，在接受邀请人邀请消息中增加一条
          Toast("已发出邀请");
          this.onClose();
      }
  },
  //删除团队成员
  onDeletMember(e){
    // 获取成员索引  
    const index = e.currentTarget.dataset.index;
    // 获取成员姓名用于提示
    const memberName = this.data.group_members[index].mb_name;
    // 显示确认弹窗
    wx.showModal({
        title: '确认删除',
        content: `确定要删除成员「${memberName}」吗？`,
        success: (res) => {
          if (res.confirm) {
            // 用户点击了确定，还需要补充后端数据库操作
            this.setData({
                group_members: this.data.group_members.filter((item,i) => i !== index)
            });
            // 显示操作成功提示
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
            });
          } else if (res.cancel) {
            // 用户点击了取消，什么都不做
          }
        }
    });
  },
  onShowAddConfig(){
    this.setData({
        showAddConfig:true
    });
  },
  onNewConfig(){
    const { cf_name, cf_account, cf_date, cf_class } = this.data.newConfig;
    
    // 简单验证
    if (!cf_name || !cf_account || !cf_date || !cf_class) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    // 添加到配置列表
    const newConfigs = [...this.data.configs, this.data.newConfig];
    this.setData({
      configs: newConfigs,
      showAddConfig:false,
      newConfig: {},
    });
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
    
    // 这里可以添加保存到本地或服务器的逻辑
    console.log('当前配置项:', newConfigs);
  },
  onDeleteConfig(e){
    const index = e.currentTarget.dataset.index;
    wx.showModal({
        title: '确认删除',
        content: `确定要删除这条配置吗？`,
        success: (res) => {
          if (res.confirm) {
            // 用户点击了确定，还需要补充后端数据库操作
            this.setData({
                configs: this.data.configs.filter((item,i) => i !== index)
            });
            // 显示操作成功提示
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1500
            });
          } else if (res.cancel) {
            // 用户点击了取消，什么都不做
          }
        }
    });
  },
  //弹出修改设置的对话框
  onModifyConfig(e){
    const index = e.currentTarget.dataset.index;
    this.setData({
        showMdyConfig:true,
        mdyConfig:this.data.configs[index],
        mdyConfigIndex:index,
    });
  },
  //确认修改
  onMdyConfig(){
    const index = this.data.mdyConfigIndex;
    this.setData({
        [`configs[${index}]`]:this.data.mdyConfig
    });
    this.onClose();
  },
  toAddClass(){
      wx.navigateTo({
        url: '/pages/editclass/editclass',
      })
  },
  showChangeAvatar(){
    this.setData({
        showChangeAvatar:true,
    })
  },
  chooseAvatar(){
    const that = this;
    wx.chooseMedia({
      count: 1,  // 限制选择图片的数量
      mediaType: ['image'],  // 指定选择的媒体类型，这里只选择图片
      sourceType: ['album', 'camera'],  // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFiles[0].tempFilePath;
        that.setData({
          new_avatar: tempFilePaths
        });
      },
      fail: function (err) {
        console.error(err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  confirmAvatar() {
    const { new_avatar } = this.data;
  
    if (!new_avatar) {
      wx.showToast({ title: '请先选择图片', icon: 'none' });
      return;
    }
  
    wx.showLoading({ title: '上传中...', mask: true });
  
    authUploadFile({
      url: api.upload_avatar,
      filePath: new_avatar,
      name: 'avatar'
    })
      .then(res => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.showToast({ title: '上传成功', icon: 'success' });
          // 更新本地头像显示（假设接口返回新头像URL）
          if (res.data.avatar) {
            this.setData({ 
                profile_icon: res.data.avatar,
                showChangeAvatar:false,
                new_avatar:res.data.avatar,
            });
          }
        } else {
          wx.showToast({ title: res.data.message || '上传失败', icon: 'none' });
        }
      })
      .catch(err => {
        wx.hideLoading();
        console.error('上传失败:', err);
  
        let message = '网络错误';
        if (err.statusCode === 401) {
          message = '登录已过期，请重新登录';
        } else if (err.errMsg.includes('timeout')) {
          message = '上传超时';
        } else if (err.data && err.data.message) {
          message = err.data.message;
        }
  
        wx.showToast({ title: message, icon: 'none' });
      });
  },
  //获取页面数据，在onLoad函数中调用
  async fetchUserInfo() {
    try {
      const res = await authRequest({
        url: api.users,
        method: 'GET'
      })
      this.setData({
        profile_icon:res.data.avatar,
        my_name:res.data.nickname,
        my_uniqueNum:res.data.unicode,
        new_avatar:res.data.avatar,
        group_info:res.data.group_info
      })
    } catch (err) {
      console.error('获取用户信息失败', err)
      wx.showToast({ title: '获取信息失败', icon: 'none' })
    }
  },
  //获取团队成员数据，在onLoad函数中调用
  async fetchGroupMembers() {
    try {
      const res = await authRequest({
        url: api.group_members,
        method: 'GET'
      })
      const group_members = [];
      for(let i = 0; i < res.data.length; i++) {
        group_members.push({
          mb_icon: res.data[i].avatar || "",
          mb_delete_icon: "/images/icon/delete.png",
          mb_name: res.data[i].nickname || "",
          mb_id: res.data[i].id || ""
        });
      }
      this.setData({
        group_members:group_members,
      });
    } catch (err) {
      console.error('获取团队信息失败', err)
      wx.showToast({ title: '获取团队信息失败', icon: 'none' })
    }
  }
})
