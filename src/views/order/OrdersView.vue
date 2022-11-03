<template>
  <div class="orders">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row :gutter="15">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="search" @keyup.enter="getOrderList" @clear="getOrderList">
            <template #append>
              <el-button :icon="Search" @click="getOrderList"/>
            </template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table style="width: 100%" border stripe :data="orderList">
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="order_number" label="订单编号"/>
        <el-table-column prop="order_price" label="订单价格"/>
        <el-table-column label="是否付款">
          <template v-slot="{ row }">
            <el-tag v-if="row.pay_status === '1'" type="success">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"/>
        <el-table-column label="下单时间">
          <template v-slot="{ row }">
            {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template v-slot="{ row }">
            <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.id)"/>
            <el-button type="success" :icon="Location" @click="showProgressDialog"/>
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

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" width="30%" v-model="addressDialogVisible" @close="addressFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="addressFormRef" label-width="90px" status-icon :model="address" :rules="rules">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="address.address1" :options="cityData" style="width: 100%;"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="address.address2"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">保存</el-button>
      </template>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" width="50%" v-model="progressDialogVisible">
      <el-timeline>
        <el-timeline-item v-for="(item, index) in progressInfo" :key="index" :timestamp="item.time">
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { ArrowRight, Search, Edit, Location } from '@element-plus/icons-vue'
import moment from 'moment'
import cityData from '@/assets/data/citydata'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getOrderList())

// ref 操作 DOM 元素
const addressFormRef = ref() // 修改地址表单的 ref

// 响应式状态
const search = ref('') // 搜索框的值
const orderList = ref([]) // 订单列表
const pagination = reactive({ // 分页数据对象
  current: 1, // 当前页
  size: 10, // 一页显示几条
  total: 0 // 总条数
})
const addressDialogVisible = ref(false) // 控制修改地址对话框的显示与隐藏
const progressDialogVisible = ref(false) // 控制物流进度对话框的显示与隐藏
const address = reactive({ // 地址数据模型
  address1: [],
  address2: ''
})
const rules = reactive({ // 表单校验对象
  address1: [
    { required: true, message: '请选择省市区/县', trigger: 'blur' }
  ],
  address2: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
})
const progressInfo = ref([ // 物流进度信息
  {
    time: '2018-05-10 09:39:00',
    ftime: '2018-05-10 09:39:00',
    context: '已签收,感谢使用顺丰,期待再次为您服务',
    location: ''
  },
  {
    time: '2018-05-10 08:23:00',
    ftime: '2018-05-10 08:23:00',
    context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
    location: ''
  },
  {
    time: '2018-05-10 07:32:00',
    ftime: '2018-05-10 07:32:00',
    context: '快件到达 [北京海淀育新小区营业点]',
    location: ''
  },
  {
    time: '2018-05-10 02:03:00',
    ftime: '2018-05-10 02:03:00',
    context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
    location: ''
  },
  {
    time: '2018-05-09 23:05:00',
    ftime: '2018-05-09 23:05:00',
    context: '快件到达 [北京顺义集散中心]',
    location: ''
  },
  {
    time: '2018-05-09 21:21:00',
    ftime: '2018-05-09 21:21:00',
    context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
    location: ''
  },
  {
    time: '2018-05-09 13:07:00',
    ftime: '2018-05-09 13:07:00',
    context: '顺丰速运 已收取快件',
    location: ''
  },
  {
    time: '2018-05-09 12:25:03',
    ftime: '2018-05-09 12:25:03',
    context: '卖家发货',
    location: ''
  },
  {
    time: '2018-05-09 12:22:24',
    ftime: '2018-05-09 12:22:24',
    context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
    location: ''
  },
  {
    time: '2018-05-08 21:36:04',
    ftime: '2018-05-08 21:36:04',
    context: '商品已经下单',
    location: ''
  }
])

// 处理函数
const getOrderList = async () => { // 获取订单列表
  const { data } = await http.get('/orders', {
    params: {
      query: search.value,
      pagenum: pagination.current,
      pagesize: pagination.size
    }
  })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  pagination.total = data.data.total
  orderList.value = data.data.goods
}
const handleCurrentChange = val => { // 处理当前页改变
  pagination.current = val
  getOrderList()
}
const handleSizeChange = val => { // 处理一页显示几条改变
  pagination.size = val
  getOrderList()
}
const showUpdateDialog = async id => { // 显示修改地址对话框
  console.log(id) // =========================================================================================================================================================
  addressDialogVisible.value = true
}
const showProgressDialog = async () => { // 显示物流进度对话框
  // 接口报错
  // const { data } = await http.get('/kuaidi/804909574412544580')
  // if (data.meta.status !== 200) return message.error(data.meta.msg)
  // progressInfo.value = data.data
  progressDialogVisible.value = true
}
</script>
