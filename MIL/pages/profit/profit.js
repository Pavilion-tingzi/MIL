import dropdownTemplate from '../../templates/dropdown/dropdown';
import * as echarts from '../../components/ec-canvas/echarts';
let chart = null;

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

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
        data: ['12月', '1月', '2月', '3月', '4月', '5月', '6月'],
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
        data: [300, 270, 340, 344, 300, 320, 310],
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
        data: [120, 102, 141, 174, 190, 250, 220],
        itemStyle: {
            color: '#f9ccab' // 设置柱子的颜色
          },
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

Page({
    data: {
        dropdown1: {
            ...dropdownTemplate.data,
          },
        ec:{
            onInit: initChart,
        },
        //总结余，总收入，总支出
        total_pf:"999.99",
        total_income:"999.99",
        total_expense:"999.99",
        //每月数据
        monthly_values:[
            {
                month:"2025年02月",
                profit:"123.22",
                income:"999.99",
                spend:"823.12"
            },
            {
                month:"2025年01月",
                profit:"231.24",
                income:"569.99",
                spend:"233.12"
            },
            {
                month:"2024年12月",
                profit:"-231.24",
                income:"1242.99",
                spend:"3333.12"
            },
        ]
    },
    ...dropdownTemplate.methods, 
})