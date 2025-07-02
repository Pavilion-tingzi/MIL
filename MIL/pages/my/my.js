import Toast from '@vant/weapp/toast/toast';
import api from '../../config/settings'
const { authRequest,authUploadFile,showModalAsync } = require('../../utils/request')

Page({
  data: {
    //通知消息
    notice:"",
    //邀请消息
    has_news: true,
    news_icon: "/images/icon/news.png",
    inviteShow: false, //显示邀请消息列表
    inviteNews: [
        {
            id:"1",
            inviter_id:"2",
            inviter:"小明",
            ignore:false,
        },
        {
            id:"2",
            inviter_id:"3",
            inviter:"小张",
            ignore:false,
        },
        {
            id:"2",
            inviter_id:"3",
            inviter:"小张",
            ignore:true,
        },
        {
            id:"2",
            inviter_id:"3",
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
    my_id:"",
    my_name:"小花",
    my_username:"",
    my_uniqueNum:"123321",
    showUniqueNum:false,
    showUserName:false,
    newPsd:"",
    newPsdRpd:"",
    //团队
    group_info:"", //团队id和团队名称
    add_gpmb_icon:"/images/icon/add_gpmb.png",
    group_members:[
        {
            mb_icon:"/images/icon/mb_pf1.png",
            mb_delete_icon:"/images/icon/delete.png",
            mb_name:"张三",
            mb_id:"1"
        },
        {
            mb_icon:"/images/icon/mb_pf2.png",
            mb_delete_icon:"/images/icon/delete.png",
            mb_name:"李四",
            mb_id:"2"
        },
    ],
    showCreateGroup:false,
    newGroup:{
        name:"",
        description:""
    },
    //设置
    configs:[
        {
            cf_name:"",
            cf_account:"",
            cf_date:"",
            cf_class:"",
            cf_smallcategory:"",
            cf_id:""
        }
    ],
    showAddConfig:false,
    showMdyConfig:false,
    newConfig: {
        cf_name: '',
        cf_account: '',
        cf_date: '',
        cf_class: '',
        cf_smallcategory:''
    },
    mdyConfig:{
        cf_name: '',
        cf_account: '',
        cf_date: '',
        cf_class: '',
        cf_smallcategory:'',
        cf_id: ''
    },
    mdyConfigIndex:"",
    radio:"1",
    classShow:false,
    cascaderValue: '',
    classOptions: [
        {
          text: '餐饮',
          value: '1',
          children: [
              { text: '早餐', value: '11' },
              { text: '中餐', value: '12' },
              { text: '晚餐', value: '13' },
              { text: '食材', value: '14' },
              { text: '奶茶', value: '15' },
              { text: '零食', value: '16' },
              { text: '调味品', value: '16' }
            ],
        },
        {
          text: '住宿',
          value: '2',
          children: [
              { text: '房租', value: '21' },
              { text: '房贷', value: '22' },
              { text: '物业/水电煤', value: '23' },
              { text: '维修', value: '24' },
            ],
        },
      ],
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
  async onLoad(){
    await this.fetchUserInfo()
    await this.fetchGroupMembers()
    await this.fetchMessages()
    await this.fetchSettings()
    await this.getNews()
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
            wx.clearStorage() // 清除所有本地缓存
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
        showCreateGroup:false,
        classShow:false,
        showUserName:false
    })
  },
  async ignoreInvite(e){
    const {message} = e.currentTarget.dataset; 
    await this.setMessageStatus(3,message)
    this.fetchMessages()
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
  copyTextUsername() {
    wx.setClipboardData({
      data: this.data.my_username,
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
  // 隐藏唯一码/用户名提示框
  hideModal() {
    this.setData({
        showUniqueNum:false,
        showUserName:false,
    });
  },
  //查看用户名
  showUserName(){
    this.setData({
        showUserName:true,
    })
  },
  //公用函数，前端输入框输入内容是，自动更新data中的数据
  onChange(e){
      const {field} = e.currentTarget.dataset;
      const value = e.detail;
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
    if (this.data.group_info !== null) {
        this.setData({
            showIssueInvite:true,
        })
    } else {
        wx.showToast({
          title: '请先创建团队', icon: 'none'
        })
    }
    
  },
  //发邀请弹窗中点击确认的逻辑
  onSentInvite(){
      if(this.data.inviteName==="" || this.data.inviteUniqueNum===""){
        Toast("用户名或唯一码不能为空");
      } else {
          //还需要增加后端判断，用户名和唯一码是否匹配
          //以下是匹配的情况，还需要把邀请数据入库，在接受邀请人邀请消息中增加一条
          this.issueNewInvite()
      }
  },
  //删除团队成员
  async onDeletMember(e){
    // 获取成员索引  
    const {index,mb_id} = e.currentTarget.dataset;
    // 获取成员姓名用于提示
    const memberName = this.data.group_members[index].mb_name;
    // 显示确认弹窗
    const res = await showModalAsync({
        title: '确认删除',
        content: `确定要删除成员「${memberName}」吗？`}
    );
    if (res.confirm) {
        await this.deleteGroupMember(mb_id)
        wx.showToast({ title: '删除成功', icon: 'success' });
        await this.fetchGroupMembers();
    }
  },
  //解散团队
  async deleteGroup(){  
    // 显示确认弹窗
    const res = await showModalAsync({
        title: '解散团队',
        content: `确定要解散团队吗？`}
    );
    if (res.confirm) {
        await this.deleteGroupRequest(this.data.group_info.id)
        this.fetchUserInfo();
        this.fetchGroupMembers()
    }
  },
  onShowAddConfig(){
    this.setData({
        showAddConfig:true
    });
  },
  //设置相关
  async onNewConfig(){
    const { cf_name, cf_account, cf_date, cf_smallcategory} = this.data.newConfig;
    
    // 简单验证
    if (!cf_name || !cf_account || !cf_date || !cf_smallcategory) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    // 添加到配置列表
    try {
        const res = await authRequest({
          url: api.settings,
          method: 'POST',
          data:{
              name: this.data.newConfig.cf_name,
              day_of_month: parseInt(this.data.newConfig.cf_date),
              amount:parseInt(this.data.newConfig.cf_account),
              small_category_id:parseInt(this.data.newConfig.cf_smallcategory[1])
          }
        });
        if (res.statusCode >=200 && res.statusCode<300) {
            this.onClose();
            wx.showToast({
                title: '修改成功',
                icon: 'success'
            });
            this.fetchSettings();
        } else {
            const firstKey = Object.keys(res.data)[0];
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey][0],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
        }
    } catch(err){
        console.log(err)
    }
  },
  // 删除设置
  onDeleteConfig(e){
    const id = e.currentTarget.dataset.id;
    wx.showModal({
        title: '确认删除',
        content: `确定要删除这条配置吗？`,
        success: async (res) => {
          if (res.confirm) {
            // 用户点击了确定，还需要补充后端数据库操作
            try {
                const res = await authRequest({
                  url: api.settings+`${id}/`,
                  method: 'DELETE'
                });
                if (res.statusCode >=200 && res.statusCode<300) {
                    // 显示操作成功提示
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 1500
                    });
                    
                    this.setData({
                        configs: this.data.configs.filter(item => item.cf_id !== id)
                      });
                } else {
                    wx.showToast({
                        title: '删除失败',
                        icon: 'none'
                    });
                }
            } catch(err){
                console.log(err)
            }
          } else if (res.cancel) {
            // 用户点击了取消，什么都不做
          }
        }
    });
  },
  //以下为选择类别相关
  onChooseClass(){
    this.setData({
        classShow: true,
      });
    this.fetchClassInfo()
  },
  onFinish(e) {
        const { selectedOptions, value } = e.detail;
        const fieldValue = selectedOptions
            .map((option) => option.text || option.name)
            .join('/');
        this.setData({
            "newConfig.cf_smallcategory": [fieldValue,selectedOptions[1].value],
            cascaderValue: value,
            classShow: false,
        })
  },
  onFinishMdy(e) {
    const { selectedOptions, value } = e.detail;
    const fieldValue = selectedOptions
        .map((option) => option.text || option.name)
        .join('/');
    this.setData({
        "mdyConfig.cf_smallcategory": [fieldValue,selectedOptions[1].value],
        cascaderValue: value,
        classShow: false,
    })
},
  //弹出修改设置的对话框
  async onModifyConfig(e){
    const index = e.currentTarget.dataset.index;
    const copiedConfig = JSON.parse(JSON.stringify(this.data.configs[index]));
    await this.setData({
        showMdyConfig:true,
        mdyConfig:copiedConfig,
        mdyConfigIndex:index,
    });
  },
  //确认修改
  async onMdyConfig(){
    const id = this.data.mdyConfig.cf_id;
    try {
        const res = await authRequest({
          url: api.settings+`${id}/`,
          method: 'PATCH',
          data:{
              name: this.data.mdyConfig.cf_name,
              day_of_month: parseInt(this.data.mdyConfig.cf_date),
              amount:parseInt(this.data.mdyConfig.cf_account),
              small_category_id:parseInt(this.data.mdyConfig.cf_smallcategory[1])
          }
        });
        console.log(res)
        if (res.statusCode >=200 && res.statusCode<300) {
            this.onClose();
            wx.showToast({
                title: '修改成功',
                icon: 'success'
            });
            this.fetchSettings();
        } else {
            const firstKey = Object.keys(res.data)[0];
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey][0],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
        }
    } catch(err){
        console.log(err)
    }
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
  createGroup(){
    this.setData({
        showCreateGroup:true,
    })
  },
  // 下拉刷新数据
  async onPullDownRefresh() {
    try {
          await this.fetchUserInfo()
          await this.fetchGroupMembers()
          await this.fetchMessages()
          await this.getNews()
      } catch (err) {
        console.error('刷新失败:', err);
      }
  },
  // 创建团队
  async onCreateGroup(){
    await this.createNewGroup();
    this.fetchUserInfo()
  },
  // 确认加入某个团队
  async confirmInvite(e){
    const {inviter,message} = e.currentTarget.dataset; 
    await this.joinGroup(inviter,2,message)
    this.fetchGroupMembers()
    this.onClose()
    this.fetchMessages()
    this.fetchUserInfo()
  },
  //获取页面数据，在onLoad函数中调用
  async fetchUserInfo() {
    try {
      const res = await authRequest({
        url: api.users,
        method: 'GET'
      })
      if (res.statusCode >= 200 && res.statusCode < 300){
        this.setData({
            profile_icon:res.data.avatar,
            my_id:res.data.id,
            my_name:res.data.nickname,
            my_username:res.data.username,
            my_uniqueNum:res.data.unicode,
            new_avatar:res.data.avatar,
            group_info:res.data.group_info
          })
      } else if (res.statusCode === 401) {
        // 401 认证失效，提示用户并跳转登录页
          wx.showToast({
              title: '登录已过期，请重新登录',
              icon: 'none',
              duration: 2000 // 2秒后自动关闭
          });

          // 3秒后跳转到登录页
          setTimeout(() => {
              wx.reLaunch({
                  url: '/pages/login/login' // 替换成你的登录页路径
              });
          }, 3000);
        }
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
          mb_id: res.data[i].id || "",
        });
      }
      this.setData({
        group_members:group_members,
      });
    } catch (err) {
      console.error('获取团队信息失败', err)
      wx.showToast({ title: '获取团队信息失败', icon: 'none' })
    }
  },
  //创建团队
  async createNewGroup() {
    try {
      const res = await authRequest({
        url: api.create_group,
        method: 'POST',
        data:{
            name: this.data.newGroup.name,
            description: this.data.newGroup.description
        }
      })
      if (res.statusCode >=200 && res.statusCode<300) {
        wx.showToast({ title: '创建团队成功', icon: 'success' });
      } else if (res.statusCode >=400 && res.statusCode<500) {
        const firstKey = Object.keys(res.data)[0];  
        wx.showModal({
            title: '',
            content: firstKey+":"+res.data[firstKey],
            showCancel: false, // 是否显示取消按钮
            confirmText: '确定', // 确定按钮的文本
        })
      } else {
        wx.showToast({ title: '创建团队失败', icon: 'none' });
      }
    } catch (err) {
      console.error('创建团队失败', err)
      wx.showToast({ title: '创建团队失败', icon: 'none' })
    }
    this.setData({
        showCreateGroup:false,
    })
  },
  // 发出邀请（创建一条邀请消息）
  async issueNewInvite(){
    try {
        const res = await authRequest({
          url: api.send_message,
          method: 'POST',
          data:{
            username:this.data.inviteName,
            unicode:this.data.inviteUniqueNum,
          }
        })
        if (res.statusCode >=200 && res.statusCode<300) {
          wx.showToast({ title: '发送邀请成功', icon: 'success' });
        } else if (res.statusCode >=400 && res.statusCode<500) {
          const firstKey = Object.keys(res.data)[0];  
          wx.showModal({
              title: '',
              content: firstKey+":"+res.data[firstKey],
              showCancel: false, // 是否显示取消按钮
              confirmText: '确定', // 确定按钮的文本
          })
        } else {
          wx.showToast({ title: '发送邀请失败', icon: 'none' });
        }
      } catch (err) {
        console.error('发送邀请失败', err)
        wx.showToast({ title: '发送邀请失败', icon: 'none' })
      }
      this.setData({
        showIssueInvite:false,
      })
  },
  // 获取所有邀请消息
  async fetchMessages(){
    try {
        const res = await authRequest({
          url: api.get_message,
          method: 'GET'
        })
        let inviteNews = []
        for (let i=0;i<res.data.length;i++) {
            if (res.data[i].status==="接受" || res.data[i].status==="拒绝") continue
            let news = {
                id:res.data[i].id,
                inviter_id:res.data[i].sender.id,
                inviter:res.data[i].sender.nickname,
                ignore:false,
            }
            inviteNews.push(news)
        }
        this.setData({
            inviteNews: inviteNews
        })
      } catch (err) {
        console.error('获取邀请消息失败', err)
        wx.showToast({ title: '获取邀请消息失败', icon: 'none' })
      }
  },
  // 接受邀请，加入团队,改变消息状态
  async joinGroup(inviter_id,status_num, message_id){
    try {
        const res = await authRequest({
          url: api.join_group+inviter_id+"/",
          method: 'PATCH',
        })
        if (res.statusCode >=200 && res.statusCode<300) {
            wx.showToast({ title: '加入团队成功', icon: 'success' });
            this.setMessageStatus(status_num, message_id)
          } else if (res.statusCode >=400 && res.statusCode<500) {
            const firstKey = Object.keys(res.data)[0];  
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
          } else {
            wx.showToast({ title: '加入团队失败', icon: 'none' });
          }
      } catch (err) {
        console.error('接受邀请失败', err)
        wx.showToast({ title: '接受邀请失败', icon: 'none' })
      }
  },
  // 修改邀请消息的状态
  async setMessageStatus(status_num, message_id){
    try {
        const res = await authRequest({
          url: api.messageUpdate+message_id+"/",
          method: 'PATCH',
          data:{
              status: status_num
          }
        })
        if (res.statusCode >=400 && res.statusCode<500) {
            const firstKey = Object.keys(res.data)[0];  
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
        }
      } catch (err) {
        console.error('操作失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
  },
  async deleteGroupMember(mb_id){
    try {
        const res = await authRequest({
          url: api.delete_members+mb_id+"/",
          method: 'PATCH',
        })
        if (res.statusCode >=400 && res.statusCode<500) {
            const firstKey = Object.keys(res.data)[0];  
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
        }
      } catch (err) {
        console.error('操作失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
  },
  async deleteGroupRequest(group_id){
    try {
        const res = await authRequest({
          url: api.deleteGroup+group_id+"/",
          method: 'DELETE',
        }) 
        if (res.statusCode >=200 && res.statusCode<300) {
            wx.showToast({ title: '团队解散成功', icon: 'success' });
        }
        else if (res.statusCode >=400 && res.statusCode<500) {
            const firstKey = Object.keys(res.data)[0];  
            wx.showModal({
                title: '',
                content: firstKey+":"+res.data[firstKey],
                showCancel: false, // 是否显示取消按钮
                confirmText: '确定', // 确定按钮的文本
            })
        }
      } catch (err) {
        console.error('操作失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
  },
  //获取类别数据
  async fetchClassInfo() {
    try {
        const res = await authRequest({
        url: api.category,
        method: 'GET'
        })
        const apiData = this.transformTypeApiData(res.data)
        this.setData({
            classOptions: apiData,
        })
    } catch (err) {
        console.error('获取类别信息失败', err)
        wx.showToast({ title: '获取信息失败', icon: 'none' })
    }
  },
  //接口返回的类别明细数据格式调整
  transformTypeApiData(apiData) {
    // 1. 按大分类分组
  const bigCategoryMap = new Map();
  
  apiData.forEach(subCategory => {
    const bigCat = subCategory.BigCategory_detail;
    const subCatId = String(subCategory.id);
    
    // 2. 处理大分类
    if (!bigCategoryMap.has(bigCat.id)) {
        bigCategoryMap.set(bigCat.id, {
          // 大分类字段
          text: bigCat.name,
          value: String(bigCat.id),
          // 子分类数组
          children: []
        });
      }
      // 3. 添加子分类
      bigCategoryMap.get(bigCat.id).children.push({
        // 子分类字段
        text: subCategory.name,
        value: subCatId,
      });
  });
  
  // 4. 返回数组格式
  return Array.from(bigCategoryMap.values());
  },
  //获取用户设置信息
  async fetchSettings() {
    try {
        const res = await authRequest({
        url: api.settings,
        method: 'GET'
        })
        const configs = []
        for (let i = 0;i<res.data.length;i++){
            const config = {
                cf_name:res.data[i].name,
                cf_account:res.data[i].amount,
                cf_date:res.data[i].day_of_month,
                cf_class:res.data[i].type == 1 ? "支付":"发放",
                cf_smallcategory:[res.data[i].small_category.name,res.data[i].small_category.id],
                cf_id:res.data[i].id
            }
            configs.push(config)
        }
        this.setData({
            configs:configs,
        })
    } catch (err) {
        console.error('获取设置信息失败', err)
        wx.showToast({ title: '获取设置失败', icon: 'none' })
    }
  },
  //获取通知消息
  async getNews(){
    wx.request({
        url: api.notice,
        method: 'GET',
        success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
            this.setData({ 
                notice: res.data[0].content
            });
            } else {
                wx.showToast({
                  title: '获取消息通知失败',
                  icon:"none"
                })
            }
        },
        fail: (err) => {
            wx.showToast({
                title: '网络错误',
                icon: 'none'
            })
        }
    })
  }
})
