<template>
  <div class="categories">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>

      <!-- 分类列表 -->
      <el-table style="width: 100%" border row-key="cat_id" :data="cateList">
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="cat_name" label="分类名称"/>
        <el-table-column label="是否有效">
          <template v-slot="{ row }">
            <el-icon v-if="!row.cat_deleted" :style="{ color: '#67c23a', fontSize: '18px' }"><CircleCheckFilled/></el-icon>
            <el-icon v-else :style="{ color: '#f56c6c', fontSize: '18px' }"><CircleCloseFilled/></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="{ row }">
            <el-tag v-if="row.cat_level === 0">一级</el-tag>
            <el-tag type="success" v-else-if="row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="197px">
          <template v-slot="{ row }">
            <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.id)">编辑</el-button>
            <el-button type="danger" :icon="Delete" @click="deleteRole(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页导航 -->
      <el-pagination layout="total, sizes, prev, pager, next, jumper"
                     v-model:currentPage="pagination.current"
                     v-model:page-size="pagination.size"
                     :total="pagination.total"
                     :page-sizes="[5, 10, 15, 20, 25]"
                     @current-change="handleCurrentChange"
                     @size-change="handleSizeChange"/>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" width="30%" v-model="addDialogVisible" @close="addDialogClose">
      <el-form class="demo-ruleForm" ref="addFormRef" label-width="80px" status-icon :model="cate" :rules="rules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cate.cat_name"/>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader style="width: 100%"
                       clearable
                       v-model="selectedKeys"
                       :options="parentCateList"
                       :props="cascaderProps"
                       @change="handleCascaderChange"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addCate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { ArrowRight, CircleCheckFilled, CircleCloseFilled, Edit, Delete } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getCateList())

// ref 操作 DOM 元素
const addFormRef = ref() // 添加表单的 ref

// 响应式状态
const cateList = ref([]) // 分类列表
const parentCateList = ref([]) // 父级分类列表
const pagination = reactive({ // 分页数据对象
  current: 1, // 当前页
  size: 5, // 一页显示几条
  total: 0 // 总条数
})
const addDialogVisible = ref(false) // 控制添加分类对话框的显示与隐藏
const cate = reactive({ // 分类数据模型
  cat_name: '', // 分类名称
  cat_pid: 0, // 父ID
  cat_level: 0 // 分类层级
})
const rules = reactive({ // 表单校验对象
  cat_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
})
const cascaderProps = reactive({ // 级联选择器的配置对象
  expandTrigger: 'hover',
  checkStrictly: true,
  value: 'cat_id',
  label: 'cat_name'
})
const selectedKeys = ref([]) // 级联选择器选中的ID数组

// 处理函数
const getCateList = async () => { // 获取分类列表
  const { data } = await http.get('/categories', {
    params: {
      type: 3,
      pagenum: pagination.current,
      pagesize: pagination.size
    }
  })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  pagination.total = data.data.total
  cateList.value = data.data.result
}
const getParentCateList = async () => { // 获取父级分类列表
  const { data } = await http.get('/categories', { params: { type: 2 } })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  parentCateList.value = data.data
}
const handleCurrentChange = val => { // 处理当前页改变
  pagination.current = val
  getCateList()
}
const handleSizeChange = val => { // 处理一页显示几条改变
  pagination.size = val
  getCateList()
}
const showAddDialog = () => { // 显示添加对话框
  getParentCateList()
  addDialogVisible.value = true
}
const handleCascaderChange = () => { // 处理级联选择器变化
  if (selectedKeys.value) {
    cate.cat_pid = selectedKeys.value[selectedKeys.value.length - 1] // 取选中的最后一个分类ID做为父ID
    cate.cat_level = selectedKeys.value.length // 选中分类的长度就是分类的等级
  } else {
    cate.cat_pid = 0
    cate.cat_level = 0
  }
}
const addCate = () => { // 添加分类
  addFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.post('/categories', cate)
    if (data.meta.status !== 201) return message.error(data.meta.msg)
    message.success('添加成功')
    addDialogVisible.value = false
    await getCateList()
  })
}
const addDialogClose = () => { // 添加对话框关闭
  addFormRef.value.resetFields()
  selectedKeys.value = []
}
</script>
