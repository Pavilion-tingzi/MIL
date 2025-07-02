import Toast from '@vant/weapp/toast/toast';
import api from '../../config/settings';
const { authRequest } = require('../../utils/request');

Page({
    data: {
        class:[
            {
                id: "1",
                bigClass: "餐饮",
                hidden:false,
                smallClass: [
                    {
                        sid: "11",
                        sClassName:"午餐",
                        sClassSrc:"/images/icon/sc_lunch.png",
                    },
                    {
                        sid: "12",
                        sClassName:"晚餐",
                        sClassSrc:"/images/icon/sc_dinner.png",
                    },
                    {
                        sid: "13",
                        sClassName:"早餐",
                        sClassSrc:"/images/icon/sc_lunch.png",
                    },
                    {
                        sid: "14",
                        sClassName:"食材",
                        sClassSrc:"/images/icon/sc_lunch.png",
                    },
                    {
                        sid: "15",
                        sClassName:"零食",
                        sClassSrc:"/images/icon/sc_lunch.png",
                    },
                ]
            },
            {
                id: "3",
                bigClass: "旅游",
                hidden:false,
                smallClass: [
                    {
                        sid: "31",
                        sClassName:"旅游",
                        sClassSrc:"/images/icon/bc_travel.png",
                    },
                ]
            },
            {
                id: "4",
                bigClass: "日常",
                hidden:false,
                smallClass: [
                    {
                        sid: "41",
                        sClassName:"日常",
                        sClassSrc:"/images/icon/sc_daily.png",
                    },
                ]
            },
        ],
        showABClass:false,
        showASClass:false,
        addBigClass: {
            id: "",
            bigClass: "",
            hidden:false,
            smallClass: []
        },
        addSmallClass:{
            sid: "",
            sClassName:"",
            sClassSrc:"",
        },
        bigid:"",
    },
    onLoad(){
        this.fetchClassInfo()
    },
    hidSmallClass(e){
        const bigIndex = e.currentTarget.dataset.bindex;
        const selectedItem = this.data.class[bigIndex];
        this.setData({
            [`class[${bigIndex}].hidden`]: !selectedItem.hidden
        });
    },
    onClose(){
        this.setData({
            showABClass:false,
            showASClass:false,
        })
    },
    onChange(e){
        const {field} = e.currentTarget.dataset;
        const value = e.detail;
        console.log(field,value);
        this.setData({
            [`${field}`]:value,
        });
    },
    addBigClass(){
        this.setData({
            showABClass:true,
        })
    },
    async onABClassConfirm(){
        if (this.data.addBigClass.bigClass != "") {
            try {
                const res = await authRequest({
                  url: api.big_category,
                  method: 'POST',
                  data:{
                    name:this.data.addBigClass.bigClass,
                  }
                });
                if (res.statusCode >=200 && res.statusCode<300) {
                    // 显示操作成功提示
                    this.setData({
                        "addBigClass.id":res.data.id,
                    })
                    wx.showToast({
                        title: '增加大类成功',
                        icon: 'success',
                        duration: 1500
                    });
                } else {
                    wx.showToast({
                        title: '添加大类失败',
                        icon: 'none'
                    });
                }
            } catch(err){
                console.log(err)
            }
            try {
                const res = await authRequest({
                  url: api.category,
                  method: 'POST',
                  data:{
                    name:this.data.addBigClass.bigClass,
                    BigCategory:this.data.addBigClass.id,
                  }
                });
                if (res.statusCode >=200 && res.statusCode<300) {
                    // 显示操作成功提示
                    wx.showToast({
                        title: '增加小类成功',
                        icon: 'success',
                        duration: 1500
                    });
                    this.fetchClassInfo()
                } else {
                    wx.showToast({
                        title: '添加小类失败',
                        icon: 'none'
                    });
                }
            } catch(err){
                console.log(err)
            }
            this.setData({
                showABClass: false,
                "addBigClass.bigClass": "", // 清空输入框
            });
        } else {
            Toast("请输入大类名称");
        }
    },
    addSamllClass(e){
        const bigid = e.currentTarget.dataset.bigid;
        this.setData({
            showASClass:true,
            bigid: bigid,
        });
    },
    async onASClassConfirm(e){
        console.log(this.data.bigid)
        if (this.data.addSmallClass.sClassName != "") {
            try {
                const res = await authRequest({
                  url: api.category,
                  method: 'POST',
                  data:{
                    name:this.data.addSmallClass.sClassName,
                    BigCategory:this.data.bigid,
                  }
                });
                if (res.statusCode >=200 && res.statusCode<300) {
                    // 显示操作成功提示
                    wx.showToast({
                        title: '增加小类成功',
                        icon: 'success',
                        duration: 1500
                    });
                    this.fetchClassInfo()
                } else {
                    wx.showToast({
                        title: '添加小类失败',
                        icon: 'none'
                    });
                }
            } catch(err){
                console.log(err)
            }
            this.setData({
                bigid:"",
                addSmallClass:{},
                showASClass:false,
            })
        } else {
            Toast("请输入小类名称");
        }
    },
    async onDeletBClass(e){
        const index = e.currentTarget.dataset.bigIndex;
        const bigClassName = this.data.class[index].bigClass;
        const id = e.currentTarget.dataset.bigid;
        // 显示确认弹窗
        wx.showModal({
            title: '确认删除',
            content: `确定要删除类别「${bigClassName}」吗？`,
            success: async (res) => {
            if (res.confirm) {
                // 用户点击了确定，还需要补充后端数据库操作
                try {
                    const res = await authRequest({
                      url: api.big_category+`${id}/`,
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
                            class: this.data.class.filter((item,i) => i !== index)
                        });
                    } else {
                        wx.showToast({
                            title: res.data.detail || '删除失败',
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
    async onDeletSClass(e){
        const {bigIndex,smallIndex} = e.currentTarget.dataset;
        const smallClassName = this.data.class[bigIndex].smallClass[smallIndex].sClassName;
        const id = e.currentTarget.dataset.sid;
        // 显示确认弹窗
        wx.showModal({
            title: '确认删除',
            content: `确定要删除类别「${smallClassName}」吗？`,
            success: async (res) => {
            if (res.confirm) {
                // 用户点击了确定，还需要补充后端数据库操作
                try {
                    const res = await authRequest({
                      url: api.category+`${id}/`,
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
                            [`class[${bigIndex}].smallClass`]: this.data.class[bigIndex].smallClass.filter((item,i) => i !== smallIndex)
                        });
                    } else {
                        wx.showToast({
                            title: res.data.detail || '删除失败',
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
    //获取类别数据
  async fetchClassInfo() {
    try {
      const res = await authRequest({
        url: api.category,
        method: 'GET'
      })
      const apiData = this.transformTypeApiData(res.data)
      this.setData({
        class: apiData,
      })
    } catch (err) {
      console.error('获取类别信息失败', err)
      wx.showToast({ title: '获取信息失败', icon: 'none' })
    }
  },
  //接口返回的类别明细数据格式调整
  transformTypeApiData(apiData) {
    // 按大分类分组
  const bigCategoryMap = new Map();
  
  
  apiData.forEach(subCategory => {
    const bigCat = subCategory.BigCategory_detail;
    const subCatId = String(subCategory.id);
    if (subCategory.BigCategory_detail.type_display === "支出"){
        if (!bigCategoryMap.has(bigCat.id)) {
            bigCategoryMap.set(bigCat.id, {
              // 大分类字段
              id:bigCat.id,
              bigClass: bigCat.name,
              hidden:false,
              // 子分类数组
              smallClass: []
            });
          }
          // 3. 添加子分类
          bigCategoryMap.get(bigCat.id).smallClass.push({
            // 子分类字段
            sid: subCatId,
            sClassName:subCategory.name,
            sClassSrc:subCategory.icon,
          });
    } 
  });
  
  // 返回数组格式
  return Array.from(bigCategoryMap.values());
  },
  
})