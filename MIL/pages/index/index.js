import dropdownTemplate from '../../templates/dropdown/dropdown';
import * as echarts from '../../components/ec-canvas/echarts';
import headerTemplate from '../../templates/header/header';
import api from '../../config/settings';
const { authRequest } = require('../../utils/request');

function initChart(canvas, width, height,prd) {
    console.log("开始进行initChart");  
    // ...你的图表代码...
    const chart = echarts.init(canvas, null, {
      width: width || 300,
      height: height || 300,
      devicePixelRatio: prd
    });
    canvas.setChart(chart);
    
    var option = {
      backgroundColor: "#ffffff",
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
        type: 'pie',
        center: ['50%', '50%'],
        radius: ['20%', '40%'],
        data: [{
          value: 55,
          name: '北京'
        }, {
          value: 20,
          name: '武汉'
        }, {
          value: 10,
          name: '杭州'
        }, {
          value: 20,
          name: '广州'
        }, {
          value: 38,
          name: '上海'
        }]
      }]
    };
  
    chart.setOption(option);
    return chart;
  }

Page({  
    data:{
        active: 0, // 当前激活标签
        dropdown1: {
            ...dropdownTemplate.data,
          },
        //以下是明细表列表中元素的取值
        cell_values: [
      ],
        //以下是统计表列表中元素的取值
        cell_values_s: [
          {
            cell_id: '1',
            cell_class: "交通",
            cell_icon:"/images/icon/bc_transport.png",
            cell_price: "￥9999.99",
            cell_percent_text: "50%",
            cell_percent: "50"
          },
          {
            cell_id: '2',
            cell_class: "餐饮",
            cell_icon:"/images/icon/bc_meal.png",
            cell_price: "￥999999.99",
            cell_percent_text: "30%",
            cell_percent: "30"
          },
          {
            cell_id: '3',
            cell_class: "旅游",
            cell_icon:"/images/icon/bc_travel.png",
            cell_price: "￥899.84",
            cell_percent_text: "20%",
            cell_percent: "20"
          },
      ], 
        //统计表中选择收入or支出的标签
      radio: "1",
      radio_icon: {
        normal:"/images/icon/st_button_spend.png",
        active:"/images/icon/st_button_spend-o.png",
        normal_1:"/images/icon/st_button_income.png",
        active_1:"/images/icon/st_button_income-o.png",
      },
        //统计表中的饼图
      showChart: true,
      ec: {
        onInit: initChart
      },
      //统计表中的系数，恩格尔系数等
      factor: "恩格尔系数0.8，中产",
      //搜索页面传来的搜索条件
      selectedData_sid:"",
      selectedData_sname:"",
      selectedData_notes:"",
      //修改时存放索引
      bigIndex:"",
      smallIndex:"",
      showModify:[false,false,false],
      //修改页面的日历显示
      calendarShow: false,
      minDate:new Date(2024, 0, 1).getTime(),
      maxDate:new Date(2027, 0, 1).getTime(),
      //修改页面的类别和摊销设置显示
      classShow: false, 
      amortizeShow: false,
      //修改时临时存放
      mdyCellValue:{},
      page: 1,         // 当前页码
      pageSize: 5,    // 每页条数
      isLoading: false, // 加载状态
      hasMore: true    // 是否还有更多数据
    },
    ...dropdownTemplate.methods, 
    ...headerTemplate.methods, 
    onLoad() {
        // 确保Vant组件初始化
        setTimeout(() => {
            const dropdownItem = this.selectComponent('#date-picker');
            if (dropdownItem) {
                dropdownItem.toggle(false);
            }
        }, 1000);
        console.log('页面数据:', this.data); // 确认ec是否存在
        // 获取页面明细表数据
        this.fetchCashFlowInfo(false);
    },
    onChange(event) {
        if (event.detail.index === 1) { // 仅对第二个 Tab 生效
            this.setData({ 
                showChart: event.detail.index === 1
            });
          }
    },
    onChange_radio(event) {
        this.setData({
          radio: event.detail,
        });
    },
    onReady() {
    },
    //点击记一笔跳转到记录明细页
    switchToRecord(){
        wx.navigateTo({
            url: '/pages/record/record'
          });
    },
    //接收搜索页面传来的确认搜索参数
    setSelectedData: function(sid,sname,notes) {
        if (sname.length===0){
            this.setData({
                selectedData_sid: "",
                selectedData_notes: notes,
                selectedData_sname: notes,
              });
        } else{
            this.setData({
                selectedData_sid: sid,
                selectedData_sname: sname,
                selectedData_notes: "",
              });
        }
        console.log("这里：",this.data.selectedData_sname)
        // 这里可以执行其他数据处理逻辑
    },
    //以下为日历相关
    onDisplay() {
        this.setData({ calendarShow: true });
    },
    formatDate(date) {
        date = new Date(date);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    onConfirm(event) {
        this.setData({
            calendarShow: false,  
            "mdyCellValue.transaction_date": this.formatDate(event.detail),
          });
    },
    //取消选择
    deSelect(){
        this.setData({
            selectedData_sid: "",
            selectedData_sname: "",
            selectedData_notes: "",
        })
    },
    //打开修改弹窗,获取需要修改的记录数据
    showModify(e){
        const {celltype,id} = e.currentTarget.dataset;
        this.fetchOneCashFlow(id);
        console.log(this.data.mdyCellValue)
        if(celltype==="支出"){
            this.setData({
                showModify:[true,false,false],
            })
        } else if(celltype==="收入"){
            this.setData({
                showModify:[false,true,false],
            })
        } else {
            this.setData({
                showModify:[false,false,true],
            })
        } 
    },
    onDelete(e){
        const {bigIndex,smallIndex,id} = e.currentTarget.dataset;
        // 显示确认弹窗
        //增加判断逻辑：只能删除自己的记录
        wx.showModal({
            title: '确认删除',
            content: `确定要删除这条记录吗？`,
            success: async (res) => {
            if (res.confirm) {
                // 用户点击了确定，还需要补充后端数据库操作
                this.setData({
                    [`cell_values[${bigIndex}].cell_date_values`]: this.data.cell_values[bigIndex].cell_date_values.filter((item,i) => i !== smallIndex)
                });
                try {
                    const res = await authRequest({
                      url: api.cashflow+`${id}/`,
                      method: 'DELETE'
                    });
                } catch(err){
                    console.log(err)
                }
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
    //关闭弹窗
    onClose(){
        this.setData({
            showModify:false,
            calendarShow: false,
            classShow: false, 
            amortizeShow: false
        })
    },
    // 下拉刷新逻辑
    onPullDownRefresh() {
        this.setData({
            page: 1,
            hasMore: true
        });
        // 重新加载数据
        this.fetchCashFlowInfo(true);
    },
    // 上拉加载更多
    onReachBottom() {
        if (!this.data.isLoading && this.data.hasMore) {
        this.fetchCashFlowInfo(false);
        }
    },
    //获取流水明细表数据，在onload和onPullDownRefresh中调用
    async fetchCashFlowInfo(isRefresh = false) {
        if (this.data.isLoading || !this.data.hasMore) return;
        this.setData({ isLoading: true });

        try {
          const res = await authRequest({
            url: api.cashflow,
            method: 'GET',
            data: {
                page: Number(isRefresh ? 1 : this.data.page),
                size: Number(this.data.pageSize)
              }
          });
          if (res.statusCode === 200){
            const apiData = res.data.results;
            const transformApiData = this.transformApiData(apiData);
            
            this.setData({
                cell_values: isRefresh ? transformApiData.cell_values : [...this.data.cell_values,...transformApiData.cell_values],
                page: isRefresh ? 2 : Number(this.data.page) + 1,
                hasMore: res.data.next === null? false:true
            })
          }  
        } catch (err) {
          console.error('获取现金流水信息失败', err)
          wx.showToast({ title: '获取信息失败', icon: 'none' })
        } finally {
            this.setData({ isLoading: false });
            if (isRefresh) wx.stopPullDownRefresh();
          }
    },
    //接口返回的现金流水明细数据格式调整
    transformApiData(apiData) {
        // 按日期分组
        const dateGroups = {};
        
        apiData.forEach((item, index) => {
            // 格式化日期为 "MM-DD 星期X"
            const dateObj = new Date(item.transaction_date);
            const options = { month: '2-digit', day: '2-digit', weekday: 'long' };
            const formattedDate = dateObj.toLocaleDateString('zh-CN', options)
                .replace(/\//g, '-')
                .replace('星期', ' 星期');
            
            // 构建条目
            const entry = {
                cell_sid : item.id,
                cell_icon: item.subcategory.icon,
                cell_price: `￥${item.amount}`,
                cell_class: item.subcategory.name + (item.transaction_type === 2 ? '(收入)' : ''),
                cell_tag: item.is_amortized ? '已摊销' : '',
                cell_belong: `@${item.user.nickname}`,
                cell_type: item.transaction_type_display
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
    //获取单条流水记录
    async fetchOneCashFlow(id) {
        try {
            const res = await authRequest({
              url: api.cashflow+id+"/",
              method: 'PATCH',
            });
            if (res.statusCode === 200){
              const apiData = res.data;
              this.setData({
                mdyCellValue: apiData
              })
              console.log(apiData)
            }  
          } catch (err) {
            console.error('获取现金流明细信息失败', err)
            wx.showToast({ title: '获取信息失败', icon: 'none' })
          } 
    }
  });

