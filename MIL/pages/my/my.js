
Page({
  data: {
    //判断是否有新消息
    has_news: true,
    news_icon: "/images/icon/news.png",
    //我的
    profile_icon:"/images/icon/profile.png",
    my_name:"小花",
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
    ]
  },
  redirectToPage(){
    wx.redirectTo({
        url: '/pages/login/login'
      });
  }
})
