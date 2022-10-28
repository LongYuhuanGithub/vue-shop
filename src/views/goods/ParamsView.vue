<template>
  <div class="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"/>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleCascaderChange"/>
        </el-col>
      </el-row>

      <!-- 标签页区域 -->
      <el-tabs v-model="activeName" class="demo-tabs" @tab-change="getParamList">
        <!-- 动态参数标签 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table style="width: 100%" border stripe row-key="attr_id" :data="manyTableData">
            <el-table-column type="expand">
              <template v-slot="{ row }">
                <el-tag v-for="(item, index) in row.attr_vals" :key="index" closable style="margin: 10px;" @close="deleteVal(index, row)">{{ item }}</el-tag>
                <el-input
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="inputRef"
                  size="small"
                  style="margin: 10px; width: 80px;"
                  @keyup.enter="addVal(row)"
                  @blur="addVal(row)"
                />
                <el-button v-else size="small" style="margin: 10px; width: 80px;" @click="showInput(row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="50"/>
            <el-table-column prop="attr_name" label="参数名称"/>
            <el-table-column label="操作" width="200px">
              <template v-slot="{ row }">
                <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.attr_id)">编辑</el-button>
                <el-button type="danger" :icon="Delete" @click="deleteParam(row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性标签 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="small" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table style="width: 100%" border stripe row-key="attr_id" :data="onlyTableData">
            <el-table-column type="expand">
              <template v-slot="{ row }">
                <el-tag v-for="(item, index) in row.attr_vals" :key="index" closable style="margin: 10px;" @close="deleteVal(index, row)">{{ item }}</el-tag>
                <el-input
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="inputRef"
                  size="small"
                  style="margin: 10px; width: 80px;"
                  @keyup.enter="addVal(row)"
                  @blur="addVal(row)"
                />
                <el-button v-else size="small" style="margin: 10px; width: 80px;" @click="showInput(row)">
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" width="50"/>
            <el-table-column prop="attr_name" label="属性名称"/>
            <el-table-column label="操作" width="200px">
              <template v-slot="{ row }">
                <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.attr_id)">编辑</el-button>
                <el-button type="danger" :icon="Delete" @click="deleteParam(row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" width="30%" v-model="addDialogVisible" @close="addFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="addFormRef" label-width="80px" status-icon :model="param" :rules="rules">
        <el-form-item prop="attr_name" :label="titleText">
          <el-input v-model="param.attr_name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParam">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + titleText" width="30%" v-model="updateDialogVisible" @close="updateFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="updateFormRef" label-width="80px" status-icon :model="param" :rules="rules">
        <el-form-item prop="attr_name" :label="titleText">
          <el-input v-model="param.attr_name"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateParam">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive, nextTick, computed } from 'vue'
import { ArrowRight, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getCateList())

// ref 操作 DOM 元素
const addFormRef = ref() // 添加表单的 ref
const updateFormRef = ref() // 修改表单的 ref
const inputRef = ref() // 标签输入框的 ref

// 响应式状态
const cateList = ref([]) // 分类列表
const cascaderProps = reactive({ // 级联选择器的配置对象
  expandTrigger: 'hover',
  value: 'cat_id',
  label: 'cat_name'
})
const selectedKeys = ref([]) // 级联选择器选中的ID数组
const activeName = ref('many') // 当前选中的标签页名称
const manyTableData = ref([]) // 动态参数表格数据
const onlyTableData = ref([]) // 静态属性表格数据
const addDialogVisible = ref(false) // 控制添加对话框的显示与隐藏
const updateDialogVisible = ref(false) // 控制修改对话框的显示与隐藏
const param = reactive({ // 参数数据模型
  attr_id: 0, // 参数ID
  attr_name: '', // 参数名称
  attr_sel: '', // 当前选中的标签页名称，many 或 only
  attr_vals: [] // 参数的属性值
})
const rules = reactive({ // 表单校验对象
  attr_name: [
    { required: true, message: '请输入参数名称', trigger: 'blur' }
  ]
})

// 处理函数
const getCateList = async () => { // 获取分类列表
  const { data } = await http.get('/categories')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  cateList.value = data.data
}
const getParamList = async () => { // 获取参数列表
  if (!cateId.value) return
  // 根据所选分类的ID，和当前所处的面板，获取对应的参数
  const { data } = await http.get(`/categories/${cateId.value}/attributes`, { params: { sel: activeName.value } })
  if (data.meta.status !== 200) return message.error(data.meta.msg)

  data.data.forEach(item => {
    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
    item.inputVisible = false // 控制标签输入框和按钮的切换显示
    item.inputValue = '' // 标签输入框的内容
  })

  // 判断获取的是动态参数还是静态属性
  if (activeName.value === 'many') manyTableData.value = data.data
  else onlyTableData.value = data.data
}
const handleCascaderChange = () => { // 处理级联选择器变化
  if (selectedKeys.value && selectedKeys.value.length !== 3) { // 选中的不是三级分类
    selectedKeys.value = []
    manyTableData.value = []
    onlyTableData.value = []
    return
  }
  getParamList()
}
const addParam = () => { // 添加参数
  addFormRef.value.validate(async valid => {
    if (!valid) return
    param.attr_sel = activeName.value
    const { data } = await http.post(`/categories/${cateId.value}/attributes`, {
      attr_name: param.attr_name,
      attr_sel: param.attr_sel
    })
    if (data.meta.status !== 201) return message.error(data.meta.msg)
    message.success('添加成功')
    addDialogVisible.value = false
    await getParamList()
  })
}
const showUpdateDialog = async id => { // 显示修改对话框
  const { data } = await http.get(`/categories/${cateId.value}/attributes/${id}`, { params: { attr_sel: activeName.value } })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  param.attr_id = data.data.attr_id
  param.attr_name = data.data.attr_name
  param.attr_sel = data.data.attr_sel
  param.attr_vals = data.data.attr_vals
  updateDialogVisible.value = true
}
const updateParam = () => { // 修改参数
  updateFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.put(`/categories/${cateId.value}/attributes/${param.attr_id}`, {
      attr_name: param.attr_name,
      attr_sel: param.attr_sel,
      attr_vals: param.attr_vals
    })
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('修改成功')
    updateDialogVisible.value = false
    await getParamList()
  })
}
const deleteParam = id => { // 删除删除
  ElMessageBox.confirm('此操作将永久删除该参数，是否继续？', '提示', { type: 'warning' }).then(async () => {
    const { data } = await http.delete(`/categories/${cateId.value}/attributes/${id}`)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('删除成功')
    await getParamList()
  }).catch(error => error)
}
const showInput = row => { // 显示标签输入框
  row.inputVisible = true
  nextTick(() => inputRef.value.focus())
}
const saveVal = async row => { // 保存属性值
  const { data } = await http.put(`/categories/${cateId.value}/attributes/${row.attr_id}`, {
    attr_name: row.attr_name,
    attr_sel: row.attr_sel,
    attr_vals: row.attr_vals.join(' ')
  })
  return data
}
const addVal = async row => { // 添加属性值
  const inputValue = row.inputValue.trim()
  if (!inputValue.length) {
    row.inputVisible = false
    row.inputValue = ''
    return
  }
  row.attr_vals.push(inputValue)
  row.inputVisible = false
  row.inputValue = ''
  const data = await saveVal(row)
  if (data.meta.status !== 200) {
    row.attr_vals.pop()
    return message.error(data.meta.msg)
  }
  message.success('修改参数项成功')
}
const deleteVal = async (index, row) => { // 删除属性值
  const deleteItem = row.attr_vals.splice(index, 1)
  const data = await saveVal(row)
  if (data.meta.status !== 200) {
    row.attr_vals.splice(index, 0, deleteItem[0])
    return message.error(data.meta.msg)
  }
  message.success('修改参数项成功')
}

// 计算属性
const isBtnDisabled = computed(() => selectedKeys.value && selectedKeys.value.length !== 3) // 按钮是否被禁用
const cateId = computed(() => { // 当前选中的三级分类的ID
  if (selectedKeys.value && selectedKeys.value.length === 3) return selectedKeys.value[2]
  else return null
})
const titleText = computed(() => activeName.value === 'many' ? '动态参数' : '静态属性') // 添加对话框上的标题
</script>

<style lang="scss" scoped>
.categories {
  // 商品选择区域
  .cat_opt {
    margin-top: 15px;
  }
}
</style>
