<template>
  <div class="reports">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <div ref="reportRef" style="width: 750px; height: 400px;"/>
    </el-card>
  </div>
</template>

<script setup>
import { inject, ref, reactive, onMounted, markRaw } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import _ from 'lodash'

const message = inject('message')
const http = inject('http')

// ref 操作 dom 元素
const reportRef = ref() // 图表容器的实例

// 响应式状态
const echartsInstance = ref(null) // echarts 实例对象
const options = reactive({ // 需要合并的数据
  title: {
    text: '用户来源'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#E9EEF3'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      boundaryGap: false
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ]
})

// 生命周期函数
onMounted(async () => {
  echartsInstance.value = markRaw(echarts.init(reportRef.value, null, { renderer: 'svg' }))
  const { data } = await http.get('reports/type/1')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  const result = _.merge(data.data, options) // 合并对象
  echartsInstance.value.setOption(result)
})
</script>

<style lang="scss" scoped>
</style>
