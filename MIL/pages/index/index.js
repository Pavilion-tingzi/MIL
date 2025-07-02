import dropdownTemplate from '../../templates/dropdown/dropdown';
import * as echarts from '../../components/ec-canvas/echarts';
import headerTemplate from '../../templates/header/header';
import api from '../../config/settings';
const { authRequest } = require('../../utils/request');

Page({  
    data:{
        active: 0, // 当前激活标签
        isIndexPage:true,
        dropdown1: {
            ...dropdownTemplate.data,
          },
        //以下是明细表列表中元素的取值
        cell_values: [
            {
                cell_sid : "",//流水id
                cell_icon: "",//图标
                cell_price: "",//金额
                cell_class: "",//是否为收入，收入显示“（收入）”，支出显示为空
                cell_tag: "",//是否摊销，摊销显示“已摊销”，否则显示为空
                cell_belong:"",//所属用户昵称
                cell_smalltype: "",//交易小类名称
                cell_bigtype:"",//交易大类id
            }
      ],
        //以下是统计表列表中元素的取值(支出)
        cell_values_s: [
          {
            big_category_name: "", //如“交通”
            big_category_icon:"", //图标地址
            total_amount: "", //大类金额汇总
            percent: "" //大类金额占总支出比
          }
      ], 
      //以下是统计表列表中元素的取值(收入)
        cell_values_si:[
            {
                big_category_name: "", //如“交通”
                big_category_icon:"", //图标地址
                total_amount: "", //大类金额汇总
                percent: "" //大类金额占总收入比
              }
        ],
        //根据标签判断当前统计表中展示的是支出还是收入
        currentList: [],
        total_income:"",
        total_expense:"",
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
        onInit: null
      },
      // 统计表中饼图数据（支出）
      chartData:[],
      // 统计表中饼图数据（收入）
      chartData_i:[],
      //统计表中的系数，恩格尔系数等
      factor: "",
      //搜索页面传来的搜索条件
      selectedData_sid:[],
      selectedData_sname:[],
      selectedData_notes:"",
      //修改时存放索引
      bigIndex:"",
      smallIndex:"",
      showModify:[false,false,false],
      //修改页面的日历显示
      calendarShow: false,
      minDate:new Date(2025, 0, 1).getTime(),
      maxDate:new Date().getTime(),
      //修改页面的类别和摊销设置显示
      classShow: false, 
      classOptions: [
        {
          text: '餐饮',
          value: '1',
          children: [
              { text: '早餐', value: '11' },
              { text: '中餐', value: '12' },
              { text: '晚餐', value: '13' },
              { text: '食材', value: '14' },
              { text: '奶茶', value: '15' },
              { text: '零食', value: '16' },
              { text: '调味品', value: '16' }
            ],
        },
        {
          text: '住宿',
          value: '2',
          children: [
              { text: '房租', value: '21' },
              { text: '房贷', value: '22' },
              { text: '物业/水电煤', value: '23' },
              { text: '维修', value: '24' },
            ],
        },
      ],
      classOptions2: [
        {
          text: '工资',
          value: '1',
        },
        {
          text: '奖金',
          value: '2',
        },
      ],
      classOptions3:[],
      fieldValue: '',
      cascaderValue: '',
      amortizeShow: false,
      //修改时临时存放
      mdyCellValue:{},
      page: 1,         // 当前页码
      pageSize: 6,    // 每页条数
      isLoading: false, // 加载状态
      hasMore: true    // 是否还有更多数据
    },
    ...dropdownTemplate.methods, 
    ...headerTemplate.methods, 

    initChart(canvas, width, height,prd) {
        console.log("开始进行initChart"); 
         
        // ...你的图表代码...
        const chart = echarts.init(canvas, null, {
          width: width || 300,
          height: height || 300,
          devicePixelRatio: prd
        });
        canvas.setChart(chart);
        this.chartInstance = chart; // 存储图表实例以便后续更新
        this.updateChart();
        return chart;
    },

    updateChart(){
        console.log(this.data.chartData_i,this.data.radio)
        if (!this.chartInstance) return;
        const option = {
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
              data: this.data.radio === "1" ? this.data.chartData : this.data.chartData_i
            }]
          };
          this.chartInstance.setOption(option);
    },

    async onLoad() { 
        wx.showLoading({ title: '加载中' });
    },
    async onShow(){
        await this.setData({ isLoading: false, hasMore: true});
        await this.fetchCashFlowInfo(true);
        setTimeout(async () => {
            await this.fetchSummary();
            this.setData({
                ec: {
                    onInit: this.initChart.bind(this)
                  }
            })
            wx.hideLoading()
          }, 300);
    },
    onReady() {
        // 此时数据可能已返回，直接渲染
        wx.hideLoading()
    },
    async onChange(event) {
        if (event.detail.index === 1) { // 仅对第二个 Tab 生效
            await this.setData({ 
                showChart: event.detail.index === 1,
            });
            await this.fetchSummary();
            await this.updateChart();
          }
    },
    async onChange_radio(event) {
        await this.setData({
          radio: event.detail,
        });
        this.getCurrentList();
        this.updateChart();
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
                selectedData_sid: [],
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
    },
    //修改记录时同步修改mdyCellValue
    onInputChange: function(e) {
        const { field } = e.currentTarget.dataset; // 获取字段名
        const value = e.detail; // 获取输入值
        console.log("获取的字段为：",field,"获取的值为",value);
        this.setData({
          [`mdyCellValue.${field}`]: value // 动态更新对应表单的字段
        });

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
    onCloseCld(){
        this.setData({
            calendarShow: false,  
          });
    },
    //以下为选择类别相关
    onChooseClass(){
        this.setData({
            classShow: true,
          });
        this.fetchClassInfo()
    },
    onFinish(e) {
        const { selectedOptions, value } = e.detail;
        const fieldValue = selectedOptions
            .map((option) => option.text || option.name)
            .join('/');
        if (this.data.showModify[0]===true) {
            this.setData({
                "mdyCellValue.subcategory.name": fieldValue,
                "mdyCellValue.subcategory.id":selectedOptions[1].value,
                cascaderValue: value,
                classShow: false,
            })
        } else {
            this.setData({
                "mdyCellValue.subcategory.name": fieldValue,
                "mdyCellValue.subcategory.id":selectedOptions[0].value,
                cascaderValue: value,
                classShow: false,
            })
        }
    },
    //以下为折旧摊销设置
    setAmortization(){
        this.setData({
            amortizeShow: true,
        });
    },
    onAmDatesChange(event){
        const amdates = event.detail;
        this.setData({
            "mdyCellValue.amortization_months": amdates,  
          });
    },
    onAmConfirm(event){
        this.setData({
            calendarShow: false,  
            "mdyCellValue.amortization_start_date": this.formatDate(event.detail),
          });
    },
    amRewrite(){
        this.setData({
            "mdyCellValue.amortization_months": "", 
            "mdyCellValue.amortization_start_date":"",
          }); 
    },
    onCloseAm(){
        this.setData({
            amortizeShow: false
        })
    },
    onCloseClass(){
        this.setData({
            classShow: false,
        })
    },
    //取消选择
    async deSelect(){
        await this.setData({
            selectedData_sid: [],
            selectedData_sname: [],
            selectedData_notes: "",
            isLoading: false, 
            hasMore: true
        })
        this.fetchCashFlowInfo(true);
    },
    //打开修改弹窗,获取需要修改的记录数据
    async showModify(e){
        const {celltype,id} = e.currentTarget.dataset;
        await this.fetchOneCashFlow(id);
        if (Object.keys(this.data.mdyCellValue).length === 0) {
            pass
        } else {
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
                try {
                    const res = await authRequest({
                      url: api.cashflow+`${id}/`,
                      method: 'DELETE'
                    });
                    if (res.statusCode >=200 && res.statusCode<300) {
                        // 显示操作成功提示
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success',
                            duration: 1500
                        });
                        this.setData({
                            [`cell_values[${bigIndex}].cell_date_values`]: this.data.cell_values[bigIndex].cell_date_values.filter((item,i) => i !== smallIndex)
                        });
                    } else {
                        wx.showToast({
                            title: '无权限删除',
                            icon: 'none'
                        });
                    }
                } catch(err){
                    console.log(err)
                }
                
            } else if (res.cancel) {
                // 用户点击了取消，什么都不做
            }
            }
        });
    },
    //关闭修改弹窗
    onClose(){
        this.setData({
            showModify:false,
        })
    },
    //确认修改，数据入库
    onASClassConfirm(){
        const id = this.data.mdyCellValue.id
        console.log("确认修改：",id,this.data.mdyCellValue)
        this.mdyOneCashFlow(id)
        this.onClose()
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
    async onReachBottom() {
        if (!this.data.isLoading && this.data.hasMore) {
            await this.fetchCashFlowInfo(false);
        }
    },
    // 判断统计表展示支出还是收入数据
    getCurrentList(){
        const currentList = this.data.radio === "1" ? this.data.cell_values_s : this.data.cell_values_si;
        console.log(currentList,this.data.radio);
        this.setData({
            currentList:currentList
        })
    },
    //获取流水明细表数据，在onload和onPullDownRefresh中调用
    async fetchCashFlowInfo(isRefresh = false) {
        if (this.data.isLoading || !this.data.hasMore) return;
        this.setData({ isLoading: true });
        try {
          console.log("发送了请求")
          const res = await authRequest({
            url: api.cashflow,
            method: 'GET',
            data: {
                page: Number(isRefresh ? 1 : this.data.page),
                size: Number(this.data.pageSize),
                start_date: this.data.dropdown1.selectedDates[0],
                end_date: this.data.dropdown1.selectedDates[1],
                group: this.data.dropdown1.value1 === 1 ? 1 : "",
                categories: this.data.selectedData_notes[0]? "" : this.data.selectedData_sname.join(','),
                noteskey: this.data.selectedData_notes[0]? this.data.selectedData_notes[0]:""
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
          }  else if (res.statusCode === 401) {
              // 401 认证失效，提示用户并跳转登录页
                wx.showToast({
                    title: '登录已过期，请重新登录',
                    icon: 'none',
                    duration: 2000 // 2秒后自动关闭
                });

                // 3秒后跳转到登录页
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/pages/login/login' // 替换成你的登录页路径
                    });
                }, 3000);
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
            } else {
                this.setData({
                    mdyCellValue: {}
                  })
                wx.showToast({
                  title: '无权限修改',
                  icon: 'none'
                })
            }
          } catch (err) {
            console.error('获取现金流明细信息失败', err)
            wx.showToast({ title: '获取信息失败', icon: 'none' })
          } 
    },
    //获取类别数据
  async fetchClassInfo() {
    try {
      const res = await authRequest({
        url: api.category,
        method: 'GET'
      })
      const apiData = this.transformTypeApiData(res.data)
      this.setData({
        classOptions: apiData[0],
        classOptions2: apiData[1],
        classOptions3: apiData[2]
      })
    } catch (err) {
      console.error('获取类别信息失败', err)
      wx.showToast({ title: '获取信息失败', icon: 'none' })
    }
  },
  //接口返回的类别明细数据格式调整
  transformTypeApiData(apiData) {
    // 1. 按大分类分组
  const bigCategoryMap = new Map();
  const bigCategoryMap2 = [];
  const bigCategoryMap3 = [];
  
  apiData.forEach(subCategory => {
    const bigCat = subCategory.BigCategory_detail;
    const subCatId = String(subCategory.id);
    
    // 2. 处理大分类-支出
    if (subCategory.BigCategory_detail.type_display === "支出"){
        if (!bigCategoryMap.has(bigCat.id)) {
            bigCategoryMap.set(bigCat.id, {
              // 大分类字段
              text: bigCat.name,
              value: String(bigCat.id),
              // 子分类数组
              children: []
            });
          }
          // 3. 添加子分类
          bigCategoryMap.get(bigCat.id).children.push({
            // 子分类字段
            text: subCategory.name,
            value: subCatId,
          });
    } else if (subCategory.BigCategory_detail.type_display === "收入") {
        // 处理大分类-收入
        bigCategoryMap2.push({
            text: subCategory.name,
            value: subCatId,
        })
    } else {
        // 处理大分类-物品收入
        bigCategoryMap3.push({
            text: subCategory.name,
            value: subCatId,
        })
    }
  });
  
  // 4. 返回数组格式
  return [Array.from(bigCategoryMap.values()),Array.from(bigCategoryMap2.values()),Array.from(bigCategoryMap3.values())];
  },
  //修改流水记录，数据入库
  async mdyOneCashFlow(id) {
    try {
        if (this.data.showModify[2]===true) {
            const res = await authRequest({
                url: api.cashflow+id+"/",
                method: 'PATCH',
                data: {
                  amount:this.data.mdyCellValue.amount,
                  transaction_date:this.data.mdyCellValue.transaction_date,
                  notes:this.data.mdyCellValue.notes,
                  transaction_type:this.data.mdyCellValue.transaction_type,
                  subcategory_id:this.data.mdyCellValue.subcategory.id,
                  is_amortized: this.data.mdyCellValue.amortization_months !== null && this.data.mdyCellValue.amortization_months !== "",
                  amortization_start_date: this.data.mdyCellValue.transaction_date,
                  amortization_months: this.data.mdyCellValue.amortization_months || null,
                  item_name: this.data.mdyCellValue.item_name
                }
              });
              if (res.statusCode >=200 && res.statusCode<300){
                  wx.showToast({ title: '修改成功', icon: 'success' });
                  this.setData({
                      mdyCellValue:{},
                  });
              } else if(res.statusCode === 400){
                  const firstKey = Object.keys(res.data)[0];
                  wx.showModal({
                      title: '',
                      content: firstKey+":"+res.data[firstKey][0],
                      showCancel: false, // 是否显示取消按钮
                      confirmText: '确定', // 确定按钮的文本
                  })
              } else {
                  wx.showToast({ title: '请重新登录', icon: 'none' })
              }
        } else {
            const res = await authRequest({
                url: api.cashflow+id+"/",
                method: 'PATCH',
                data: {
                  amount:this.data.mdyCellValue.amount,
                  transaction_date:this.data.mdyCellValue.transaction_date,
                  notes:this.data.mdyCellValue.notes,
                  transaction_type:this.data.mdyCellValue.transaction_type,
                  subcategory_id:this.data.mdyCellValue.subcategory.id,
                  is_amortized: this.data.mdyCellValue.amortization_months !== null && this.data.mdyCellValue.amortization_months !== "", 
                  amortization_start_date: this.data.mdyCellValue.amortization_months !== ""? this.data.mdyCellValue.amortization_start_date || this.data.mdyCellValue.transaction_date : this.data.mdyCellValue.transaction_date,
                  amortization_months: this.data.mdyCellValue.amortization_months || null
                }
              });
              if (res.statusCode >=200 && res.statusCode<300){
                  wx.showToast({ title: '修改成功', icon: 'success' });
                  this.setData({
                      mdyCellValue:{},
                  });
              } else if(res.statusCode === 400){
                  const firstKey = Object.keys(res.data)[0];
                  wx.showModal({
                      title: '',
                      content: firstKey+":"+res.data[firstKey][0],
                      showCancel: false, // 是否显示取消按钮
                      confirmText: '确定', // 确定按钮的文本
                  })
              } else {
                  wx.showToast({ title: '请重新登录', icon: 'none' })
              }
        }
      } catch (err) {
        console.error('修改失败', err)
        wx.showToast({ title: '修改失败', icon: 'none' })
    } 
    await this.setData({ isLoading: false, hasMore: true});
    await this.fetchCashFlowInfo(true);
  },
  //获取现金流水统计数据
  async fetchSummary(){
    try {
        const res = await authRequest({
          url: api.cashflowSummary,
          method: 'GET',
          data: {
              start_date: this.data.dropdown1.selectedDates[0],
              end_date: this.data.dropdown1.selectedDates[1],
              group: this.data.dropdown1.value1 === 1 ? 1 : "",
            }
        });
        if (res.statusCode === 200){
          const apiData = res.data;
          await this.setData({
              total_income:apiData.income.total_income,
              total_expense:apiData.expense.total_expense,
              cell_values_s:apiData.expense.details,
              cell_values_si:apiData.income.details,
              chartData:[],
              chartData_i:[],
          })
          this.getCurrentList()
          for (let item of apiData.expense.details){
            this.data.chartData.push({
                value: item.total_amount,
                name: item.big_category_name
              })
          }
          for (let item of apiData.income.details){
            this.data.chartData_i.push({
                value: item.total_amount,
                name: item.big_category_name
              })
          }
        }  
      } catch (err) {
        console.error('获取统计信息失败', err)
        wx.showToast({ title: '获取统计信息失败', icon: 'none' })
      }
  }
  });

