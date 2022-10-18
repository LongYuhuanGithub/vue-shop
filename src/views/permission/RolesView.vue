<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>

      <!-- 角色列表 -->
      <el-table style="width: 100%" border stripe row-key="id" :data="roleList">
        <el-table-column type="expand">
          <template v-slot="{ row }">
            <el-row v-for="(item, index) in row.children" :key="item.id" :class="['border-bottom', index ? '' : 'border-top']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="deleteRights(row, item.id)">{{ item.authName }}</el-tag>
                <el-icon><CaretRight/></el-icon>
              </el-col>
              <!-- 嵌套渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, index2) in item.children" :key="item2.id" :class="[index2 ? 'border-top' : '']">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="deleteRights(row, item2.id)">{{ item2.authName }}</el-tag>
                    <el-icon><CaretRight/></el-icon>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" closable v-for="item3 in item2.children" :key="item3.id" @close="deleteRights(row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#" width="50"/>
        <el-table-column prop="roleName" label="角色名称"/>
        <el-table-column prop="roleDesc" label="角色描述"/>
        <el-table-column label="操作" width="317px">
          <template v-slot="{ row }">
            <el-button type="primary" :icon="Edit" @click="showUpdateDialog(row.id)">编辑</el-button>
            <el-button type="danger" :icon="Delete" @click="deleteRole(row.id)">删除</el-button>
            <el-button type="warning" :icon="Setting" @click="showSetRightsDialog(row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加用户" width="30%" v-model="addDialogVisible" @close="addFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="addFormRef" label-width="80px" status-icon :model="role" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="role.roleName"/>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="role.roleDesc"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改用户" width="30%" v-model="updateDialogVisible" @close="updateFormRef.resetFields()">
      <el-form class="demo-ruleForm" ref="updateFormRef" label-width="80px" status-icon :model="role" :rules="rules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="role.roleName"/>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="role.roleDesc"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" width="30%" v-model="setRightsDialogVisible">
      <!-- node-key="id" 表示选中之后选择的是节点对应的 id 属性 -->
      <el-tree ref="treeRef" default-expand-all show-checkbox node-key="id" :data="rightList" :props="treeProps" :default-checked-keys="defKeys" @close="defKeys = []"/>
      <template #footer>
        <el-button @click="setRightsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="allotRight">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { ElMessageBox } from 'element-plus'
import { ArrowRight, Edit, Delete, Setting, CaretRight } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')

// 生命周期函数
onBeforeMount(() => getRoleList())

// ref 操作 DOM 元素
const addFormRef = ref() // 添加表单的 ref
const updateFormRef = ref() // 修改表单的 ref
const treeRef = ref() // 树形控件的 ref

// 响应式状态
const roleList = ref([]) // 角色列表
const rightList = ref([]) // 权限列表
const treeProps = reactive({ // 树形控件的属性绑定对象
  label: 'authName', // 每个节点的名称字段
  children: 'children' // 节点间实现嵌套的字段
})
const defKeys = ref([]) // 树形控件中默认选中的节点的 id 值数组
const addDialogVisible = ref(false) // 控制添加角色对话框的显示与隐藏
const updateDialogVisible = ref(false) // 控制添加角色对话框的显示与隐藏
const setRightsDialogVisible = ref(false) // 控制分配权限对话框的显示与隐藏
const role = reactive({ // 角色数据模型
  id: 0,
  roleName: '',
  roleDesc: ''
})
const rules = reactive({ // 表单校验对象
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ],
  roleDesc: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
})

// 处理函数
const getRoleList = async () => { // 获取角色列表
  const { data } = await http.get('/roles')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  roleList.value = data.data
}
const addRole = () => { // 添加角色
  addFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.post('/roles', role)
    if (data.meta.status !== 201) return message.error(data.meta.msg)
    message.success('添加成功')
    addDialogVisible.value = false
    await getRoleList()
  })
}
const showUpdateDialog = async id => { // 显示修改对话框
  const { data } = await http.get('/roles/' + id)
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  role.id = data.data.roleId
  role.roleName = data.data.roleName
  role.roleDesc = data.data.roleDesc
  updateDialogVisible.value = true
}
const updateRole = () => { // 修改角色
  updateFormRef.value.validate(async valid => {
    if (!valid) return
    const { data } = await http.put('/roles/' + role.id, role)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('修改成功')
    updateDialogVisible.value = false
    await getRoleList()
  })
}
const deleteRole = id => { // 删除角色
  ElMessageBox.confirm('此操作将永久删除该角色，是否继续？', '提示', { type: 'warning' }).then(async () => {
    const { data } = await http.delete('/roles/' + id)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('删除成功')
    await getRoleList()
  }).catch(error => error)
}
const deleteRights = (role, rightId) => { // 删除权限
  ElMessageBox.confirm('此操作将永久删除该权限，是否继续？', '提示', { type: 'warning' }).then(async () => {
    const { data } = await http.delete(`/roles/${role.id}/rights/${rightId}`)
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    message.success('删除成功')
    console.log(role.children, data.data)
    role.children = data.data
  }).catch(error => error)
}
const showSetRightsDialog = async row => { // 显示分配权限对话框
  const { data } = await http.get('/rights/tree')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  rightList.value = data.data
  getLeafKeys(row, defKeys.value)
  role.id = row.id
  setRightsDialogVisible.value = true
}
const getLeafKeys = (node, array) => { // 获取角色下所有三级权限的 id 值，并保存到 defKeys 数组中
  if (!node.children) return array.push(node.id) // 如果当前节点不包含 children 属性，则就是三级节点
  node.children.forEach(item => getLeafKeys(item, array)) // 如果包含 children 属性，就往深层递归
}
const allotRight = async () => { // 为角色分配权限
  const keys = [
    ...treeRef.value.getCheckedKeys(), // 获取所有选中的节点
    ...treeRef.value.getHalfCheckedKeys() // 获取所有半选的节点
  ]
  const { data } = await http.post(`/roles/${role.id}/rights`, { rids: keys.join(',') })
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  message.success('分配权限成功')
  await getRoleList()
  setRightsDialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.roles {
  // 角色列表
  .el-table {
    .el-row {
      display: flex;
      align-items: center;

      .el-tag {
        margin: 7px;
      }
    }

    .border-top {
      border-top: 1px solid #eee;
    }

    .border-bottom {
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
