<template>
  <div class="rights">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 权限列表 -->
      <el-table style="width: 100%" border stripe :data="rightList">
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="authName" label="权限名称"/>
        <el-table-column prop="path" label="路径"/>
        <el-table-column label="权限等级">
          <template v-slot="{ row }">
            <el-tag v-if="row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getRightsList())

// 响应式状态
const rightList = ref([]) // 权限列表

// 处理函数
const getRightsList = async () => { // 获取权限列表
  const { data } = await http.get('/rights/list')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  rightList.value = data.data
}
</script>
