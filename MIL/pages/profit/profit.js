import dropdownTemplate from '../../templates/dropdown/dropdown';
import * as echarts from '../../components/ec-canvas/echarts';
import api from '../../config/settings';
const { authRequest } = require('../../utils/request');

Page({
    data: {
        dropdown1: {
            ...dropdownTemplate.data,
          },
        ec:{
            onInit: null
        },
        showChart:true,
        chartDate:"",
        chartValue_income:"",
        chartValue_expense:"",
        //总结余，总收入，总支出
        total_pf:"",
        total_income:"",
        total_expense:"",
        update_time:"",
        //每月数据
        monthly_values:[
            {
                month:"",
                profit:"",
                income:"",
                spend:""
            }
        ]
    },
    ...dropdownTemplate.methods, 
    initChart(canvas, width, height, dpr) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(chart);
        this.chartInstance2 = chart;
        this.updateChart();
        return chart;
    },
    updateChart(){
        console.log(this.data.chartDate,this.data.chartValue_income)
        if (!this.chartInstance2) return;
        var option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
              },
              confine: true
            },
            legend: {
              data: ['收入', '支出']
            },
            grid: {
              left: 20,
              right: 20,
              bottom: 0,
              top: 50,
              containLabel: true
            },
            yAxis: [
              {
                type: 'value',
                axisLine: {
                  lineStyle: {
                    color: '#999'
                  }
                },
                axisLabel: {
                  color: '#666',
                  fontSize: 10  // 调小y轴标签字体
                }
              }
            ],
            xAxis: [
              {
                type: 'category',
                axisTick: { show: false },
                data: this.data.chartDate,
                axisLine: {
                  lineStyle: {
                    color: '#999'
                  }
                },
                axisLabel: {
                  color: '#666',
                  fontSize: 10  // 调小y轴标签字体
                }
              }
            ],
            series: [
              {
                name: '收入',
                type: 'bar',
                label: {
                  normal: {
                    show: true,
                    position:"top",
                    fontSize: 10,  // 调小柱状图内部标签字体
                    color: '#434d6f'
                  }
                },
                data: this.data.chartValue_income,
                itemStyle: {
                    color: '#b7c7eb' // 设置柱子的颜色
                  },
              },
              {
                name: '支出',
                type: 'bar',
                stack: '总量',
                label: {
                  normal: {
                    show: true,
                    position:"top",
                    fontSize: 10,  // 调小柱状图内部标签字体
                    color: '#664b38'
                  }
                },
                data: this.data.chartValue_expense,
                itemStyle: {
                    color: '#f9ccab' // 设置柱子的颜色
                  },
              }
            ]
          };
          this.chartInstance2.setOption(option);
    },
    async onLoad(){
        await this.fetchSummary()
        this.setData({
            ec: {
                onInit: this.initChart.bind(this)
              }
        })
    },
    showProfitDetails(){
        wx.navigateTo({
            url: '/pages/profitDetail/profitDetail'
          });
    },
    updateProfitStat(){
        this.updateProfitStatRequest()
    },
    async fetchSummary(){
        try {
            const res = await authRequest({
              url: api.profitSummary,
              method: 'GET',
              data: {
                  start_date: this.data.dropdown1.selectedDates[0],
                  end_date: this.data.dropdown1.selectedDates[1],
                  group: this.data.dropdown1.value1 === 1 ? 1 : "",
                }
            });
            if (res.statusCode === 200){
              console.log(res.data.data)
              if (res.data.data.length === 0){
                  this.updateProfitStatRequest()
              } else {
                const apiData = res.data;
                const update_time = new Date(apiData.data[0].updated_at)
                const update_time1 = `${update_time.getFullYear()}-${String(update_time.getMonth() + 1).padStart(2, '0')}-${String(update_time.getDate()).padStart(2, '0')} ${String(update_time.getHours()).padStart(2, '0')}:${String(update_time.getMinutes()).padStart(2, '0')}:${String(update_time.getSeconds()).padStart(2, '0')}`
                await this.setData({
                  total_pf:apiData.summary.profit_sum,
                  total_income:apiData.summary.total_income_sum,
                  total_expense:apiData.summary.total_expense_sum,
                  update_time:update_time1
                })
                let monthly_values = []
                let chartValue_expense = []
                let chartValue_income = []
                let chartDate = []
                for (let i=0;i in apiData.monthly_summary;i++){
                  monthly_values.push(
                      {
                          month:`${apiData.monthly_summary[i].year}`+"年"+`${apiData.monthly_summary[i].month}`+"月",
                          profit:apiData.monthly_summary[i].profit_sum,
                          income:apiData.monthly_summary[i].income_sum,
                          spend:apiData.monthly_summary[i].expense_sum
                      }
                  )
                  chartDate.push(`${apiData.monthly_summary[i].month}`+"月",)
                  chartValue_income.push(apiData.monthly_summary[i].income_sum)
                  chartValue_expense.push(apiData.monthly_summary[i].expense_sum) 
                }
                this.setData({
                  monthly_values:monthly_values,
                  chartValue_income:chartValue_income,
                  chartValue_expense:chartValue_expense,
                  chartDate:chartDate
                })
              }
              this.updateChart()
            }  
          } catch (err) {
            console.error('获取利润统计信息失败', err)
            wx.showToast({ title: '未获取利润统计数据，请手动更新', icon: 'none' })
          }
    },
    async updateProfitStatRequest(){
        try {
            const res = await authRequest({
              url: api.calculateProfit,
              method: 'POST'
            });
            if (res.statusCode === 200){
              wx.showToast({
                title: '数据更新成功',
              })
              this.fetchSummary()
            }  
          } catch (err) {
            console.error('数据更新失败', err)
            wx.showToast({ title: '数据更新失败', icon: 'none' })
          }
    }
})