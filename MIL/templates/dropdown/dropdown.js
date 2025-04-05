
const dropdownTemplate = {
    data:{
        showCalendar: true,      // 控制日历显示
        dateRangeText: '选择日期', // 下拉菜单标题
        minDate: new Date(2023, 0, 1).getTime(),  // 最小可选日期
        maxDate: new Date(2029, 11, 31).getTime(), // 最大可选日期
        selectedDates: [],         // 存储选中日期
        option1: [
        { text: '我的账本', value: 0 },
        { text: '联合账本', value: 1 },
        ],
        value1: 0,
    },
    methods: {
        // 监听下拉菜单打开
        onDropdownOpen(e) {
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
                'dropdown1.showCalendar': true
            });
          },
    
      // 日历关闭时
      onCalendarClose() {
        this.setData({
            'dropdown1.showCalendar': false
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
            'dropdown1.selectedDates': [start, end],
            'dropdown1.dateRangeText': `${startStr} 至 ${endStr}`,
            'dropdown1.showCalendar': true
        });

        const dropdownItem = this.selectComponent('#date-picker');
        if (dropdownItem) {
            dropdownItem.toggle(false);
        }
    },
    
      // 格式化日期为 YYYY-MM-DD
      formatDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    },
    }
}
export default dropdownTemplate;