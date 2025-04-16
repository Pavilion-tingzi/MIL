import Toast from '@vant/weapp/toast/toast';
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
                id: "2",
                bigClass: "交通",
                hidden:false,
                smallClass: [
                    {
                        sid: "21",
                        sClassName:"公交地铁",
                        sClassSrc:"/images/icon/sc_metro.png",
                    },
                    {
                        sid: "22",
                        sClassName:"打车",
                        sClassSrc:"/images/icon/sc_taxi.png",
                    },
                    {
                        sid: "23",
                        sClassName:"加油",
                        sClassSrc:"/images/icon/sc_gas.png",
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
        bigIndex:"",
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
    onABClassConfirm(){
        if (this.data.addBigClass.bigClass != "") {
            // 创建新的独立对象，而不是直接引用
            const newBigClassItem = {
                id: Date.now().toString(), // 生成唯一ID（可以用更严谨的方式）
                bigClass: this.data.addBigClass.bigClass,
                hidden: false,
                smallClass: []
            };
            
            const newClassList = [...this.data.class, newBigClassItem];
            
            this.setData({
                showABClass: false,
                class: newClassList,
                "addBigClass.bigClass": "", // 清空输入框
            });
        } else {
            Toast("请输入大类名称");
        }
    },
    addSamllClass(e){
        const bigIndex = e.currentTarget.dataset.bigIndex;
        this.setData({
            showASClass:true,
            bigIndex: bigIndex,
        });
    },
    onASClassConfirm(e){
        const bigIndex = this.data.bigIndex;
        const newSmallClassItem = {
            sid: Date.now().toString(), // 生成唯一ID（可以用更严谨的方式）
            sClassName: this.data.addSmallClass.sClassName,
            sClassSrc: "/images/icon/bc_travel.png",
        };
        const newClassList = [...this.data.class[bigIndex].smallClass, newSmallClassItem];
        this.setData({
            [`class[${bigIndex}].smallClass`]:newClassList,
            showASClass:false,
        })
    },
    onDeletBClass(e){
        const index = e.currentTarget.dataset.bigIndex;
        const bigClassName = this.data.class[index].bigClass;
        // 显示确认弹窗
        wx.showModal({
            title: '确认删除',
            content: `确定要删除类别「${bigClassName}」吗？`,
            success: (res) => {
            if (res.confirm) {
                // 用户点击了确定，还需要补充后端数据库操作
                this.setData({
                    class: this.data.class.filter((item,i) => i !== index)
                });
                // 显示操作成功提示
                wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 1500
                });
            } else if (res.cancel) {
                // 用户点击了取消，什么都不做
            }
            }
        });
    },
    onDeletSClass(e){
        const {bigIndex,smallIndex} = e.currentTarget.dataset;
        const smallClassName = this.data.class[bigIndex].smallClass[smallIndex].sClassName;
        // 显示确认弹窗
        wx.showModal({
            title: '确认删除',
            content: `确定要删除类别「${smallClassName}」吗？`,
            success: (res) => {
            if (res.confirm) {
                // 用户点击了确定，还需要补充后端数据库操作
                this.setData({
                    [`class[${bigIndex}].smallClass`]: this.data.class[bigIndex].smallClass.filter((item,i) => i !== smallIndex)
                });
                // 显示操作成功提示
                wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 1500
                });
            } else if (res.cancel) {
                // 用户点击了取消，什么都不做
            }
            }
        });
    }
})