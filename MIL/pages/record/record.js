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
            notes:""
        },
        formData2: {
            income:"",
            date:"",
            class:"",
            notes:""
        },
        formData3: {
            value:"", //物品估值
            date:"",
            name:"",
            num_months:"" //折旧月数
        },
        formShow1: true,
        formShow2: false,
        formShow3: false
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
        }
        
        // 可以添加统一的提交后处理逻辑
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
      }
})