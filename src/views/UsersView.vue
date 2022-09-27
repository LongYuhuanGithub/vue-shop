<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索和添加区域 -->
      <el-row :gutter="15">
        <el-col :span="7">
          <el-input placeholder="请输入内容" clearable v-model="search" @keyup.enter="getUserList">
            <template #append>
              <el-button :icon="Search" @click="getUserList"/>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table style="width: 100%" border stripe :data="userList">
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="username" label="用户名"/>
        <el-table-column prop="email" label="邮箱"/>
        <el-table-column prop="mobile" label="电话"/>
        <el-table-column prop="role_name" label="角色"/>
        <el-table-column prop="mg_state" label="状态">
          <template v-slot="{ row }">
            <el-switch v-model="row.mg_state" @change="userStateChange(row)"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="187px">
          <template v-slot="{ row }">
            <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.id)"/>
            <el-button type="danger" :icon="Delete" @click="deleteUser(row.id)"/>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" :icon="Setting" @click="showSetRoleDialog(row)"/>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页导航 -->
      <el-pagination layout="total, sizes, prev, pager, next, jumper"
                     v-model:currentPage="pagination.current"
                     v-model:page-size="pagination.size"
                     :total="pagination.total"
                     :page-sizes="[10, 20, 30, 40, 50]"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"/>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" width="30%" v-model="addDialogVisible" @close="addFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="addFormRef" label-width="70px" status-icon :model="user" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username"/>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="user.password" type="password"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email"/>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="user.mobile"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" width="30%" v-model="updateDialogVisible" @close="updateFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="updateFormRef" label-width="70px" status-icon :model="user" :rules="rules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="user.username" disabled/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email"/>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="user.mobile"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUser">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="修改用户" width="30%" v-model="setRoleDialogVisible" @close="selectedRoleId = ''">
      <div>
        <p>当前用户：{{ user.username }}</p>
        <p>当前角色：{{ user.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" size="large" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"/>
          </el-select>
        </p>
      </div>
      <template #footer>
        <el-button @click="setRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { ArrowRight, Search, Edit, Delete, Setting } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getUserList())

// ref 操作 DOM 元素
const addFormRef = ref() // 添加表单的 ref
const updateFormRef = ref() // 修改表单的 ref

// 响应式状态
const search = ref('') // 搜索框的值
const userList = ref([]) // 用户列表
const roleList = ref([]) // 角色列表
const pagination = reactive({ // 分页数据对象
  current: 1, // 当前页
  size: 10, // 一页显示几条
  total: 0 // 总条数
})
const addDialogVisible = ref(false) // 控制添加用户对话框的显示与隐藏
const updateDialogVisible = ref(false) // 控制添加用户对话框的显示与隐藏
const setRoleDialogVisible = ref(false) // 控制分配权限对话框的显示与隐藏
const user = reactive({ // 用户数据模型
  id: 0,
  username: '',
  password: '',
  email: '',
  mobile: '',
  role_name: ''
})
const validateEmail = (rule, value, callback) => { // 邮箱的校验规则
  if (!/^\w+@[a-z0-9]+(\.[a-z]+)+$/.test(value)) return callback(new Error('请输入合法的邮箱'))
  return callback()
}
const validateMobile = (rule, value, callback) => { // 手机的校验规则
  if (!/^1[35789]\d{9}$/.test(value)) return callback(new Error('请输入合法的手机'))
  return callback()
}
const rules = reactive({ // 表单校验对象
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入手机', trigger: 'blur' },
    { validator: validateMobile, trigger: 'blur' }
  ]
})
const selectedRoleId = ref('') // 当前选择的角色 id

// 处理函数
const getUserList = async () => { // 获取用户列表
  const { data } = await http.get('/users', {
    params: {
      query: search.value,
      pagenum: pagination.current,
      pagesize: pagination.size
    }
  })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  pagination.total = data.data.total
  userList.value = data.data.users
}
const userStateChange = async row => { // 用户状态改变
  const { data } = await http.put(`/users/${row.id}/state/${row.mg_state}`)
  if (data.meta.status !== 200) {
    row.mg_state = !row.mg_state
    message.error(data.meta.msg)
  }
}
const handleCurrentChange = val => { // 处理当前页改变
  pagination.current = val
  getUserList()
}
const handleSizeChange = val => { // 处理一页显示几条改变
  pagination.size = val
  getUserList()
}
const addUser = () => { // 添加用户
  addFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.post('/users', user)
    if (data.meta.status !== 201) return message.error(data.meta.msg)
    message.success('添加成功')
    addDialogVisible.value = false
    await getUserList()
  })
}
const showUpdateDialog = async id => { // 显示修改对话框
  const { data } = await http.get('/users/' + id)
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  user.id = data.data.id
  user.username = data.data.username
  user.email = data.data.email
  user.mobile = data.data.mobile
  updateDialogVisible.value = true
}
const updateUser = () => { // 修改用户
  updateFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.put('/users/' + user.id, {
      email: user.email,
      mobile: user.mobile
    })
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('修改成功')
    updateDialogVisible.value = false
    await getUserList()
  })
}
const deleteUser = id => { // 删除用户
  ElMessageBox.confirm('此操作将永久删除该用户，是否继续？', '提示', { type: 'warning' }).then(async () => {
    const { data } = await http.delete('/users/' + id)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('删除成功')
    await getUserList()
  }).catch(error => error)
}
const showSetRoleDialog = async row => { // 显示分配角色对话框
  user.id = row.id
  user.username = row.username
  user.role_name = row.role_name
  const { data } = await http.get('/roles')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  roleList.value = data.data
  setRoleDialogVisible.value = true
}
const saveRoleInfo = async () => { // 保存角色信息
  if (!selectedRoleId.value) return message.error('请选择要分配的角色')
  const { data } = await http.put(`/users/${user.id}/role`, { rid: selectedRoleId.value })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  message.success('分配角色成功')
  await getUserList()
  setRoleDialogVisible.value = false
}
</script>
