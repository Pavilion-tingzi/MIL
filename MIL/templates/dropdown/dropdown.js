
const dropdownTemplate = {
    data:{
        showCalendar: false,      // 控制日历显示
        dateRangeText: '选择日期', // 下拉菜单标题
        minDate: new Date(2024, 10, 1).getTime(),  // 最小可选日期
        maxDate: new Date().getTime(), // 最大可选日期
        selectedDates: [],         // 存储选中日期
        option1: [
        { text: '我的账本', value: 0 },
        { text: '联合账本', value: 1 },
        ],
        value1: 1,
    },
    methods: {
        // 监听下拉菜单打开
        onDropdownOpen(e) {
            // 不显示echart图
            this.setData({
                showChart:false,
            });

            // 直接操作DOM元素
            const query = wx.createSelectorQuery().in(this);
            query.select('#date-picker').fields({
            node: true,
            size: true
            }, res => {
            if (res && res.node) {
                res.node.setData({
                showWrapper: true,
                showPopup: true
                });
            }
            }).exec();
            
            // 同时更新状态
            this.setData({
                'dropdown1.showCalendar': true,
            });
          },
      // 日历关闭时
      onCalendarClose() {
        this.setData({
            'dropdown1.showCalendar': false,
            showChart:true,
        });
        const dropdownItem = this.selectComponent('#date-picker');
        if (dropdownItem) {
            dropdownItem.toggle();
        }
    },
    
      // 日历确认选择
      onCalendarConfirm(e) {
        const [start, end] = e.detail;
        const startStr = this.formatDate(start);
        const endStr = this.formatDate(end);
        
        this.setData({
            'dropdown1.selectedDates': [startStr, endStr],
            'dropdown1.dateRangeText': `${startStr} 至 ${endStr}`,
            'dropdown1.showCalendar': true,
            showChart:true,
            page: 1,
            hasMore: true,
        });

        const dropdownItem = this.selectComponent('#date-picker');
        if (dropdownItem) {
            dropdownItem.toggle(false);
        }
        if (this.data.isIndexPage) {
            this.fetchCashFlowInfo(true);
        }
        this.fetchSummary();
    },
    
      // 格式化日期为 YYYY-MM-DD
      formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },
    // 选中“我的账本”或“联合账本”触发
    async handleFilterChange(e){
        // 重新查询明细数据
        // 获取当前选中的 value（0=我的账本，1=联合账本）
        const selectedValue = e.detail; 
        await this.setData({ "dropdown1.value1": selectedValue }); 
        console.log(this.data.isIndexPage)
        if (this.data.isIndexPage) {
            await this.setData({ isLoading: false, hasMore: true});
            await this.fetchCashFlowInfo(true);
        }
        this.fetchSummary();
    },

    //下拉时隐藏柱状图
    hidCharts(){
        this.setData({
            showChart:false,
        });
    },
    //选择选项后显示柱状图
    showCharts(){
        this.setData({
            showChart:true,
        });
    },
    export(){
        wx.showToast({
            title: '功能开发中，敬请期待', 
            icon: 'none'
        })
    }
    }
}
export default dropdownTemplate;