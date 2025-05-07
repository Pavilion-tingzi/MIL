import api from '../../config/settings'
const { authRequest } = require('../../utils/request')

Page({
    data: {
        radio: "1",
        radio_icon: {
        normal:"/images/icon/st_button_spend.png",
        active:"/images/icon/st_button_spend-o.png",
        normal_2:"/images/icon/st_button_income.png",
        active_2:"/images/icon/st_button_income-o.png",
        normal_3:"/images/icon/st_button_itemincome.png",
        active_3:"/images/icon/st_button_itemincome-o.png",
      },
        formData1: {
            expense:"",
            date:"",
            class:[],
            notes:"",
            amStartDate:"",
            amDates:"",
        },
        formData2: {
            income:"",
            date:"",
            class:[],
            notes:"",
            amStartDate:"",
            amDates:"",
        },
        formData3: {
            value:"", //物品估值
            date:"",
            class:[],
            name:"",
            num_month:"" //折旧月数
        },
        formShow1: true,
        formShow2: false,
        formShow3: false,
        calendarShow: false,
        minDate:new Date(2024, 0, 1).getTime(),
        maxDate:new Date(2027, 0, 1).getTime(),
        classShow: false,
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
        classOptions2: [
            {
              text: '工资',
              value: '1',
            },
            {
              text: '奖金',
              value: '2',
            },
          ],
        fieldValue: '',
        cascaderValue: '',
        amortizeShow1: false,
        amortizeShow2: false,
    },
    onLoad(){
        this.fetchClassInfo()
    },
    onChange_radio(event) {
        const selectedValue = event.detail;
        this.setData({
          radio: selectedValue,
          formShow1: selectedValue === "1",
          formShow2: selectedValue === "2",
          formShow3: selectedValue === "3"
        });
    },
    onInputChange: function(e) {
        const { field, form } = e.currentTarget.dataset; // 获取字段名和表单标识
        const value = e.detail; // 获取输入值
        console.log("获取的数据为：",`formData${form}.${field}`);
        this.setData({
          [`formData${form}.${field}`]: value // 动态更新对应表单的字段
        });
        console.log("表单1:",this.data.formData1);
        console.log("表单2:",this.data.formData2);
        console.log("表单3:",this.data.formData3);
    },
    onSubmit: async function() {
        if (this.data.formShow1) {
          // 表单1的提交逻辑
          try {
            const res = await authRequest({
              url: api.cashflow,
              method: 'POST',
              data: {
                  subcategory_id:this.data.formData1.class[1],
                  amount:this.data.formData1.expense,
                  transaction_date:this.data.formData1.date,
                  notes:this.data.formData1.notes,
                  transaction_type:1,
                  is_amortized: this.data.formData1.amStartDate !== "", // 简写布尔值转换
                  amortization_start_date: this.data.formData1.amStartDate || null, // 空字符串转为null
                  amortization_months: this.data.formData1.amDates || null
              }
            });
            // 请求成功或失败的处理
            if(res.statusCode >=200 && res.statusCode<300){
                wx.showToast({ title: '新增成功', icon: 'success' });
                this.cleardata();
            } else if(res.statusCode === 400) {
                const firstKey = Object.keys(res.data)[0];
                    wx.showModal({
                        title: '',
                        content: firstKey+":"+res.data[firstKey][0],
                        showCancel: false, // 是否显示取消按钮
                        confirmText: '确定', // 确定按钮的文本
                    })
            } else {
                wx.showToast({ title: '请重新登录', icon: 'none' })
            };
            } catch (err) {
                console.error('新增流水失败', err)
                wx.showToast({ title: '新增现金流水失败', icon: 'none' })
            }
        } else if (this.data.formShow2) {
          // 表单2的提交逻辑
          try {
            const res = await authRequest({
              url: api.cashflow,
              method: 'POST',
              data: {
                  subcategory_id:this.data.formData2.class[1],
                  amount:this.data.formData2.income,
                  transaction_date:this.data.formData2.date,
                  notes:this.data.formData2.notes,
                  transaction_type:2,
                  is_amortized: this.data.formData2.amStartDate !== "", // 简写布尔值转换
                  amortization_start_date: this.data.formData2.amStartDate || null, // 空字符串转为null
                  amortization_months: this.data.formData2.amDates || null
              }
            });
            // 请求成功或失败的处理
            if(res.statusCode >=200 && res.statusCode<300){
                wx.showToast({ title: '新增成功', icon: 'success' });
                this.cleardata();
            } else if(res.statusCode === 400) {
                const firstKey = Object.keys(res.data)[0];
                    wx.showModal({
                        title: '',
                        content: firstKey+":"+res.data[firstKey][0],
                        showCancel: false, // 是否显示取消按钮
                        confirmText: '确定', // 确定按钮的文本
                    })
            } else {
                wx.showToast({ title: '请重新登录', icon: 'none' })
            };
            } catch (err) {
                console.error('新增流水失败', err)
                wx.showToast({ title: '新增现金流水失败', icon: 'none' })
            }
        } else if (this.data.formShow3) {
          // 表单3的提交逻辑
          try {
            const res = await authRequest({
              url: api.cashflow,
              method: 'POST',
              data: {
                  subcategory_id:this.data.formData3.class[1],
                  amount:this.data.formData3.value,
                  transaction_date:this.data.formData3.date,
                  transaction_type:3,
                  item_name:this.data.formData3.name,
                  is_amortized: true,
                  amortization_start_date: this.data.formData3.date,
                  amortization_months: this.data.formData3.num_month || 1
              }
            });
            // 请求成功或失败的处理
            if(res.statusCode >=200 && res.statusCode<300){
                wx.showToast({ title: '新增成功', icon: 'success' });
                this.cleardata();
            } else if(res.statusCode === 400) {
                const firstKey = Object.keys(res.data)[0];
                    wx.showModal({
                        title: '',
                        content: firstKey+":"+res.data[firstKey][0],
                        showCancel: false, // 是否显示取消按钮
                        confirmText: '确定', // 确定按钮的文本
                    })
            } else {
                wx.showToast({ title: '请重新登录', icon: 'none' })
            };
            } catch (err) {
                console.error('新增流水失败', err)
                wx.showToast({ title: '新增现金流水失败', icon: 'none' })
            }
        };
    },
    //以下为日历相关
    onDisplay() {
        this.setData({ calendarShow: true });
    },
    onClose() {
        this.setData({ calendarShow: false, classShow: false, amortizeShow: false });
    },
    formatDate(date) {
        date = new Date(date);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    onConfirm(event) {
        if (this.data.formShow1) {
            this.setData({
                calendarShow: false,  
                "formData1.date": this.formatDate(event.detail),
              });
          } else if (this.data.formShow2) {
            this.setData({
                calendarShow: false,  
                "formData2.date": this.formatDate(event.detail),
              });
          } else if (this.data.formShow3) {
            this.setData({
                calendarShow: false,  
                "formData3.date": this.formatDate(event.detail),
              });
          }
    },
    //以下为选择类别相关
    onChooseClass(){
        this.setData({
            classShow: true,
          });
    },
    onFinish(e) {
        const { selectedOptions, value } = e.detail;
        const fieldValue = selectedOptions
            .map((option) => option.text || option.name)
            .join('/');
        if (this.data.formShow1) {
            this.setData({
                "formData1.class": [fieldValue,selectedOptions[1].value],
                cascaderValue: value,
                classShow: false,
            })
        } else if (this.data.formShow2) {
            this.setData({
                "formData2.class": [fieldValue,selectedOptions[0].value],
                cascaderValue: value,
                classShow: false,
            })
        } else {
            this.setData({
                "formData3.class": [fieldValue,selectedOptions[0].value],
                cascaderValue: value,
                classShow: false,
            })
        }
    },
    //以下为折旧摊销设置
    setAmortization(){
        this.setData({
            amortizeShow: true,
        });
    },
    onAmDatesChange(event){
        const amdates = event.detail;
        if (this.data.formShow1) {
            this.setData({
                "formData1.amDates": amdates,  
              });
          } else if (this.data.formShow2) {
            this.setData({
                "formData2.amDates": amdates,
              });
          } 
    },
    onAmConfirm(event){
        if (this.data.formShow1) {
            this.setData({
                calendarShow: false,  
                "formData1.amStartDate": this.formatDate(event.detail),
              });
          } else if (this.data.formShow2) {
            this.setData({
                calendarShow: false,  
                "formData2.amStartDate": this.formatDate(event.detail),
              });
          }
    },
    amRewrite(){
        if (this.data.formShow1) {
            this.setData({
                "formData1.amDates": "", 
                "formData1.amStartDate":"",
              });
          } else if (this.data.formShow2) {
            this.setData({
                "formData2.amDates": "",
                "formData2.amStartDate":"",
              });
        } 
    },
    //获取类别数据，在onLoad函数中调用
  async fetchClassInfo() {
    try {
      const res = await authRequest({
        url: api.category,
        method: 'GET'
      })
      const apiData = this.transformApiData(res.data)
      this.setData({
        classOptions: apiData[0],
        classOptions2: apiData[1],
        classOptions3: apiData[2]
      })
    } catch (err) {
      console.error('获取类别信息失败', err)
      wx.showToast({ title: '获取信息失败', icon: 'none' })
    }
  },
  //接口返回的现金流水明细数据格式调整
  transformApiData(apiData) {
    // 1. 按大分类分组
  const bigCategoryMap = new Map();
  const bigCategoryMap2 = [];
  const bigCategoryMap3 = [];
  
  apiData.forEach(subCategory => {
    const bigCat = subCategory.BigCategory;
    const subCatId = String(subCategory.id);
    
    // 2. 处理大分类-支出
    if (subCategory.BigCategory.type_display === "支出"){
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
    } else if (subCategory.BigCategory.type_display === "收入") {
        // 处理大分类-收入
        bigCategoryMap2.push({
            text: subCategory.name,
            value: subCatId,
        })
    } else {
        // 处理大分类-物品收入
        bigCategoryMap3.push({
            text: subCategory.name,
            value: subCatId,
        })
    }
  });
  
  // 4. 返回数组格式
  return [Array.from(bigCategoryMap.values()),Array.from(bigCategoryMap2.values()),Array.from(bigCategoryMap3.values())];
  },
  //清空页面数据
  cleardata(){
    // 清空页面数据
    this.setData({
        "formData1.expense":"",
        "formData1.date":"",
        "formData1.class":[],
        "formData1.notes":"",
        "formData2.expense":"",
        "formData2.date":"",
        "formData2.class":[],
        "formData2.notes":"",
        "formData3.value":"",
        "formData3.date":"",
        "formData3.class":[],
        "formData3.name":"",
        "formData3.num_month":"",
    })
  }
})