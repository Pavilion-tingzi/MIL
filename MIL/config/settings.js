const rootUrl = 'http://127.0.0.1:8000/mil'

module.exports={
    users:rootUrl+"/users",
    login:rootUrl+"/login/",
    refresh_token:rootUrl+"/api/token/refresh/",
    register:rootUrl+"/register/",
    upload_avatar:rootUrl+"/uploadAvatar/",
    cashflow:rootUrl+"/cashFlow/",
    category:rootUrl+"/category/"
}