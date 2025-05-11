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
    deSelect(){
        this.setData({
            selectedData_sid: "",
            selectedData_sname: "",
            selectedData_notes: "",
        })
    },
    //打开修改弹窗,获取需要修改的记录数据
    showModify(e){
        console.log(this.data.dropdown1.selectedDates)
        const {celltype,id} = e.currentTarget.dataset;
        this.fetchOneCashFlow(id);
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
        console.log("isLoading值为：",this.data.isLoading)
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
                size: Number(this.data.pageSize),
                start_date: this.data.dropdown1.selectedDates[0],
                end_date: this.data.dropdown1.selectedDates[1]
              }
          });
          console.log(res)
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
    const bigCat = subCategory.BigCategory;
    const subCatId = String(subCategory.id);
    
    // 2. 处理大分类-支出
    if (subCategory.BigCategory.type_display === "支出"){
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
    } else if (subCategory.BigCategory.type_display === "收入") {
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
                  is_amortized: true,
                  amortization_start_date: this.data.mdyCellValue.transaction_date,
                  amortization_months: this.data.mdyCellValue.amortization_months || 1,
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
                  is_amortized: this.data.mdyCellValue.amortization_start_date !== null && 
                  this.data.mdyCellValue.amortization_start_date !== '', // 简写布尔值转换
                  amortization_start_date: this.data.mdyCellValue.amortization_start_date || null, // 空字符串转为null
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
},
  });

