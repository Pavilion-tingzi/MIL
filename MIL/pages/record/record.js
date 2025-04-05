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
    },
    onChange_radio(event) {
        this.setData({
          radio: event.detail,
        });
    },
})