const headerTemplate = {
    data: {
    },
    methods: {
        onClickSearch(){
            wx.navigateTo({
              url: '/pages/search/search',
            })
        }
    }
}
export default headerTemplate;