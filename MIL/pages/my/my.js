import Toast from '@vant/weapp/toast/toast';

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
  }
})
