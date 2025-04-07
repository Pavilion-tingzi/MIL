// pages/search/search.js
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
                        selected: false,
                    },
                    {
                        sid: "12",
                        sClassName:"晚餐",
                        sClassSrc:"/images/icon/sc_dinner.png",
                        selected: false,
                    },
                    {
                        sid: "13",
                        sClassName:"早餐",
                        sClassSrc:"/images/icon/sc_lunch.png",
                        selected: false,
                    },
                    {
                        sid: "14",
                        sClassName:"食材",
                        sClassSrc:"/images/icon/sc_lunch.png",
                        selected: false,
                    },
                    {
                        sid: "15",
                        sClassName:"零食",
                        sClassSrc:"/images/icon/sc_lunch.png",
                        selected: false,
                    },
                ]
            },
            {
                id: "2",
                bigClass: "交通",
                hidden:false,
                smallClass: [
                    {
                        sid: "21",
                        sClassName:"公交地铁",
                        sClassSrc:"/images/icon/sc_metro.png",
                        selected: false,
                    },
                    {
                        sid: "22",
                        sClassName:"打车",
                        sClassSrc:"/images/icon/sc_taxi.png",
                        selected: false,
                    },
                    {
                        sid: "23",
                        sClassName:"加油",
                        sClassSrc:"/images/icon/sc_gas.png",
                        selected: false,
                    }
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
                        selected: false,
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
                        selected: false,
                    },
                ]
            },
        ],
        selectedSids: [],
        selectedsClassNames: [],
        notesSearch:[],
    },
    onChange(e) {
        this.setData({
            notesSearch: [e.detail]
        });
        console.log(this.data.notesSearch)
    },
    onClick() {
        const pages = getCurrentPages(); // 获取页面栈
        const prevPage = pages[pages.length - 2]; // 获取上一页实例
        // 调用上一页的方法并传递数据
        prevPage.setSelectedData(this.data.selectedSids,this.data.selectedsClassNames,this.data.notesSearch);
        console.log(this.data.selectedSids,this.data.selectedsClassNames,this.data.notesSearch)
  
        // 返回上一页
        wx.navigateBack();
    },
    onSelect(e) {
        const sid = e.currentTarget.dataset.sid; // 获取点击的 sid
        const sClassName = e.currentTarget.dataset.sclassname;
        const { selectedSids, selectedsClassNames } = this.data;
        const bigIndex = e.currentTarget.dataset.bigIndex;
        const smallIndex = e.currentTarget.dataset.smallIndex;
        const selectedItem = this.data.class[bigIndex].smallClass[smallIndex];
        
        this.setData({
            [`class[${bigIndex}].smallClass[${smallIndex}].selected`]: !selectedItem.selected
        });
        // 如果 sid 已存在，则移除；否则添加
        const newSelectedSids = selectedSids.includes(sid)
        ? selectedSids.filter(id => id !== sid) // 取消选中
        : [...selectedSids, sid]; // 新增选中
        // 如果 sClassName 已存在，则移除；否则添加
        const newSelectedsClassName = selectedsClassNames.includes(sClassName)
        ? selectedsClassNames.filter(sname => sname !== sClassName) // 取消选中
        : [...selectedsClassNames, sClassName]; // 新增选中

        this.setData({
            selectedSids: newSelectedSids,
            selectedsClassNames: newSelectedsClassName,
        });

        console.log("当前选中的 sid 列表:", newSelectedSids);
        console.log("当前选中的 sname 列表:", newSelectedsClassName)
    },
    hidSmallClass(e){
        const bigIndex = e.currentTarget.dataset.bindex;
        const selectedItem = this.data.class[bigIndex];
        this.setData({
            [`class[${bigIndex}].hidden`]: !selectedItem.hidden
        });
    },
    confirmSearch(){
        const pages = getCurrentPages(); // 获取页面栈
        const prevPage = pages[pages.length - 2]; // 获取上一页实例
        // 调用上一页的方法并传递数据
        prevPage.setSelectedData(this.data.selectedSids,this.data.selectedsClassNames);
  
        // 返回上一页
        wx.navigateBack();
    }
})