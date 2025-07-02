const rootUrl = 'http://124.220.169.122:443/mil'

module.exports={
    users:rootUrl+"/users",
    login:rootUrl+"/login/",
    refresh_token:rootUrl+"/api/token/refresh/",
    register:rootUrl+"/register/",
    upload_avatar:rootUrl+"/uploadAvatar/",
    cashflow:rootUrl+"/cashFlow/",
    category:rootUrl+"/category/",
    big_category:rootUrl+"/big_category/",
    group_members:rootUrl+"/group_members/",
    create_group:rootUrl+"/createGroup/",
    delete_members:rootUrl+"/userGroupDelete/",
    send_message:rootUrl+"/messageCreate/",
    get_message:rootUrl+"/messageList/",
    join_group:rootUrl+"/userGroupUpdate/",
    messageUpdate:rootUrl+"/messageUpdate/",
    deleteGroup:rootUrl+"/deleteGroup/",
    settings:rootUrl+"/settings/",
    cashflowSummary:rootUrl+"/cashFlowSummary/",
    profitSummary:rootUrl+"/profitStat/",
    profitDetail:rootUrl+"/profitDetail/",
    calculateProfit:rootUrl+"/profitStat/calculate_profit/",
    sendEmailCode:rootUrl+"/api/send_email_code/",
    notice:rootUrl+"/notice/"
}