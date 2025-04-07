// pages/record/record.js
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
            class:"",
            notes:"",
            amStartDate:"",
            amDates:"",
        },
        formData2: {
            income:"",
            date:"",
            class:"",
            notes:"",
            amStartDate:"",
            amDates:"",
        },
        formData3: {
            value:"", //物品估值
            date:"",
            name:"",
            num_months:"" //折旧月数
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
    onSubmit: function() {
        if (this.data.formShow1) {
          console.log('提交表单1数据:', this.data.formData1);
          // 这里可以添加表单1的提交逻辑
        } else if (this.data.formShow2) {
          console.log('提交表单2数据:', this.data.formData2);
          // 这里可以添加表单2的提交逻辑
        } else if (this.data.formShow3) {
          console.log('提交表单3数据:', this.data.formData3);
          // 这里可以添加表单3的提交逻辑
        };
        // 可以添加统一的提交后处理逻辑
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        // 清空页面数据
        this.setData({
            "formData1.expense":"",
            "formData1.date":"",
            "formData1.class":"",
            "formData1.notes":"",
            "formData2.expense":"",
            "formData2.date":"",
            "formData2.class":"",
            "formData2.notes":"",
            "formData3.expense":"",
            "formData3.date":"",
            "formData3.class":"",
            "formData3.notes":"",
        })
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
                "formData1.class": fieldValue,
                cascaderValue: value,
                classShow: false,
            })
        } else if (this.data.formShow2) {
            this.setData({
                "formData2.class": fieldValue,
                cascaderValue: value,
                classShow: false,
            })
        } else {
            this.setData({
                "formData3.class": fieldValue,
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
    }
})