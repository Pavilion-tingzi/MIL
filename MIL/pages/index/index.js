import dropdownTemplate from '../../templates/dropdown/dropdown';
import * as echarts from '../../components/ec-canvas/echarts';
import headerTemplate from '../../templates/header/header';

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
          {cell_id: '1',
           cell_date: '03-02 星期五',
           cell_date_values: [
               {
                cell_icon: '/images/icon/bc_transport.png',
                cell_price: '￥9.99',
                cell_class: '交通-公交',
                cell_tag: '已摊销',
                cell_belong: '@李四'
                },
                {
                cell_icon: '/images/icon/sc_lunch.png',
                cell_price: '￥4.30',
                cell_class: '餐饮-午餐',
                cell_belong: '@李四'
                }
            ]
          },
          {cell_id: '2',
           cell_date: '03-01 星期四',
           cell_date_values: [
               {cell_icon: '/images/icon/bc_transport.png',
                cell_price: '￥10.01',
                cell_class: '交通-公交',
                cell_tag: '已摊销',
                cell_belong: '@张三'
                },
                {
                cell_icon: '/images/icon/sc_lunch.png',
                cell_price: '￥5.13',
                cell_class: '餐饮-午餐',
                cell_belong: '@张三'
                }
            ]
          },
          {cell_id: '3',
           cell_date: '02-28 星期三',
           cell_date_values: [
               {cell_icon: '/images/icon/bc_transport.png',
                cell_price: '￥10.01',
                cell_class: '交通-公交',
                cell_tag: '已摊销',
                cell_belong: '@张三'
                },
                {
                cell_icon: '/images/icon/sc_lunch.png',
                cell_price: '￥5.13',
                cell_class: '餐饮-午餐',
                cell_belong: '@张三'
                }
            ]
          },
          {cell_id: '4',
          cell_date: '02-27 星期二',
          cell_date_values: [
              {cell_icon: '/images/icon/bc_transport.png',
               cell_price: '￥10.01',
               cell_class: '交通-公交',
               cell_tag: '已摊销',
               cell_belong: '@张三'
               },
               {
               cell_icon: '/images/icon/sc_lunch.png',
               cell_price: '￥5.13',
               cell_class: '餐饮-午餐',
               cell_belong: '@张三'
               }
           ]
         },
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
      showChart: false,
      ec: {
        onInit: initChart
      },
      //统计表中的系数，恩格尔系数等
      factor: "恩格尔系数0.8，中产",
      //搜索页面传来的搜索条件
      selectedData_sid:"",
      selectedData_sname:"",
      selectedData_notes:"",
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
    //取消选择
    deSelect(){
        this.setData({
            selectedData_sid: "",
            selectedData_sname: "",
            selectedData_notes: "",
        })
    }
  });

