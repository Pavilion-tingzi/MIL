import api from '../../config/settings';
const { authRequest } = require('../../utils/request');

Page({
    data: {
        cell_values:[],
        isLoading:false,
        hasMore:true,
        page: 1,         // 当前页码
        pageSize: 10,    // 每页条数
    },
    async onLoad(){
        await this.getPrePageData()
        this.fetchCashFlowInfo()
    },
    // 上拉加载更多
    async onReachBottom() {
        if (this.data.hasMore) {
            await this.fetchCashFlowInfo();
        }
    },
    // 获取上个页面筛选本人账本或联合账本
    getPrePageData(){
        const pages = getCurrentPages(); // 获取页面栈
        const prevPage = pages[pages.length - 2]; // 上一个页面实例
        const prevData = prevPage.data.dropdown1.value1;
        this.setData({
            selectDropdown:prevData
        })
    },
    //获取利润明细表数据，在onload和onPullDownRefresh中调用
    async fetchCashFlowInfo() {
        try {
          const res = await authRequest({
            url: api.profitDetail,
            method: 'GET',
            data: {
                page: Number(this.data.page),
                size: Number(this.data.pageSize),
                group: this.data.selectDropdown === 1 ? 1 : "",
              }
          });
          if (res.statusCode === 200){
            const apiData = res.data.results;
            const transformApiData = this.transformApiData(apiData);
            this.setData({
                cell_values: [...this.data.cell_values,...transformApiData.cell_values],
                page: Number(this.data.page) + 1,
                hasMore: res.data.next === null? false:true
            })
          }  
        } catch (err) {
          console.error('获取现金流水信息失败', err)
          wx.showToast({ title: '获取信息失败', icon: 'none' })
        }
    },
    //接口返回的现金流水明细数据格式调整
    transformApiData(apiData) {
        // 按日期分组
        const dateGroups = {};
        
        apiData.forEach((item, index) => {
            // 格式化日期为 "MM-DD 星期X"
            const dateObj = new Date(item.amortization_date);
            const options = { month: '2-digit', day: '2-digit', weekday: 'long' };
            const formattedDate = dateObj.toLocaleDateString('zh-CN', options)
                .replace(/\//g, '-')
                .replace('星期', ' 星期');
            
            // 构建条目
            const entry = {
                cell_sid : item.id,
                cell_icon: item.subcategory.icon,
                cell_price: `￥${item.amortized_amount}`,
                cell_class: item.subcategory.name + (item.transaction_type === 2 ? '(收入)' : ''),
                cell_tag: item.is_amortized ? '已摊销('+item.current_period+"/"+item.amortization_period+")" : '',
                cell_belong: `@${item.user.nickname}`,
                cell_type: item.transaction_type_display,
                cell_bigtype: item.subcategory.BigCategory
            };
            
            if (!dateGroups[formattedDate]) {
                dateGroups[formattedDate] = [];
            }
            dateGroups[formattedDate].push(entry);
        });
        
        // 转换为需要的格式
        const result = [];
        let i = 1;
        for (const [date, entries] of Object.entries(dateGroups)) {
            result.push({
                cell_id: String(i++),
                cell_date: date,
                cell_date_values: entries
            });
        }
        
        return { cell_values: result };
    },
})