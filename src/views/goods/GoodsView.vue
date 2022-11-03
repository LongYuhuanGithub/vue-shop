<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="15">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="search" @keyup.enter="getGoodsList" @clear="getGoodsList">
            <template #append>
              <el-button :icon="Search" @click="getGoodsList"/>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="router.push('/home/goodsadd')">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table style="width: 100%" border stripe :data="goodsList">
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="goods_name" label="商品名称"/>
        <el-table-column prop="goods_price" label="商品价格（元）" width="110px"/>
        <el-table-column prop="goods_weight" label="商品重量" width="100px"/>
        <el-table-column label="创建时间" width="160px">
          <template v-slot="{ row }">
            {{ moment(row.add_time).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="{ row }">
            <el-button type="primary" :icon="Edit" @click="console.log(row.goods_id)"/>
            <el-button type="danger" :icon="Delete" @click="deleteGoods(row.goods_id)"/>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页导航 -->
      <el-pagination layout="total, sizes, prev, pager, next, jumper"
                     v-model:currentPage="pagination.current"
                     v-model:page-size="pagination.size"
                     :total="pagination.total"
                     :page-sizes="[10, 20, 30, 40, 50]"
                     @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"/>
    </el-card>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { ArrowRight, Search, Edit, Delete } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')
const moment = inject('moment')
const router = useRouter()

// 生命周期函数
onBeforeMount(() => getGoodsList())

// 响应式状态
const search = ref('') // 搜索框的值
const goodsList = ref([]) // 用户列表
const pagination = reactive({ // 分页数据对象
  current: 1, // 当前页
  size: 10, // 一页显示几条
  total: 0 // 总条数
})

// 处理函数
const getGoodsList = async () => { // 获取商品列表
  const { data } = await http.get('/goods', {
    params: {
      query: search.value,
      pagenum: pagination.current,
      pagesize: pagination.size
    }
  })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  pagination.total = data.data.total
  goodsList.value = data.data.goods
}
const handleCurrentChange = val => { // 处理当前页改变
  pagination.current = val
  getGoodsList()
}
const handleSizeChange = val => { // 处理一页显示几条改变
  pagination.size = val
  getGoodsList()
}
const deleteGoods = id => { // 删除商品
  ElMessageBox.confirm('此操作将永久删除该商品，是否继续？', '提示', { type: 'warning' }).then(async () => {
    const { data } = await http.delete('/goods/' + id)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('删除成功')
    await getGoodsList()
  }).catch(error => error)
}
</script>
