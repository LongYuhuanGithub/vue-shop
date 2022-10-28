<template>
  <div class="goods-add">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品添加</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"/>

      <!-- 步骤条区域 -->
      <el-steps :active="activeIndex" finish-status="success" align-center>
        <el-step title="基本信息" />
        <el-step title="商品参数" />
        <el-step title="商品属性" />
        <el-step title="商品图片" />
        <el-step title="商品内容" />
        <el-step title="完成" />
      </el-steps>

      <!-- 标签页区域 -->
      <el-form class="demo-ruleForm" ref="addFormRef" label-position="top" status-icon :model="goods" :rules="rules">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-change="tabChange">
          <el-tab-pane label="基本信息" :name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goods.goods_name"/>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goods.goods_price"/>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goods.goods_weight"/>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goods.goods_number"/>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="goods.goods_cat" :options="cateList" :props="cascaderProps" @change="handleCascaderChange"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" :name="1">
            <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(val, index) in item.attr_vals" :key="index" :label="val" border/>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" :name="2">
            <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"/>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" :name="3">
            <el-upload
              action="http://localhost:8888/api/private/v1/upload"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              :on-preview="handlePreview"
            >
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" :name="4">
            <div style="border: 1px solid #ccc; margin-bottom: 10px; z-index: 10;">
              <Toolbar
                mode="default"
                style="border-bottom: 1px solid #ccc;"
                :defaultConfig="{
                  excludeKeys: [
                    'group-image', // 排除图片
                    'group-video' // 排除视频
                  ]
                }"
                :editor="editorRef"
              />
              <Editor
                ref="editor"
                v-model="goods.goods_introduce"
                mode="default"
                style="min-height: 450px;"
                :defaultConfig="{ placeholder: '请输入内容...' }"
                @onCreated="handleCreated"
              />
            </div>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" width="50%" v-model="previewDialogVisible">
      <img :src="previewPath" alt="" class="preview-img">
    </el-dialog>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { inject, ref, shallowRef, reactive, onBeforeMount, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import _ from 'lodash'

const router = useRouter()
const http = inject('http')
const message = inject('message')

// ref 操作 dom 元素
const addFormRef = ref() // 添加表单的实例
const editorRef = shallowRef() // 编辑器实例，必须用 shallowRef

// 响应式状态
const cateList = ref([]) // 分类列表
const activeIndex = ref(0) // 步骤条当前激活的步骤
const goods = reactive({ // 商品数据模型
  goods_name: '', // 名称
  goods_price: 0, // 价格
  goods_weight: '', // 重量
  goods_number: 0, // 数量
  goods_cat: [], // 分类ID数组
  attrs: [], // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
  pics: [], // 图片数组
  goods_introduce: '' // 详情描述
})
const rules = reactive({ // 表单校验对象
  goods_name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  goods_price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  goods_weight: [
    { required: true, message: '请输入商品重量', trigger: 'blur' }
  ],
  goods_number: [
    { required: true, message: '请输入商品数量', trigger: 'blur' }
  ],
  goods_cat: [
    { required: true, message: '请输入商品分类', trigger: 'blur' }
  ]
})
const cascaderProps = reactive({ // 级联选择器的配置对象
  expandTrigger: 'hover',
  value: 'cat_id',
  label: 'cat_name'
})
const manyTableData = ref([]) // 动态参数表格数据
const onlyTableData = ref([]) // 静态属性表格数据
const headersObj = reactive({ // 上传图片请求携带的请求头对象
  Authorization: window.sessionStorage.getItem('vue_shop_token')
})
const previewPath = ref('') // 预览图片的路径
const previewDialogVisible = ref(false) // 控制图片预览对话框的显示与隐藏

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 处理函数
const getCateList = async () => { // 获取分类列表
  const { data } = await http.get('/categories')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  cateList.value = data.data
}
const handleCascaderChange = () => { // 处理级联选择器变化
  if (goods.goods_cat && goods.goods_cat.length !== 3) goods.goods_cat = [] // 选中的不是三级分类
}
const beforeTabLeave = (activeName, oldActiveName) => { // 标签页切换前的回调
  if (oldActiveName === 0 && goods.goods_cat && goods.goods_cat.length !== 3) { // 如果是从基本信息面板切换走的，就判断有没有选择分类
    message.error('请先选择商品分类！')
    return false // 返回 false 不切换标签
  }
}
const tabChange = async () => { // 标签页改变
  if (activeIndex.value === 1) { // 判断访问的是商品参数面板
    const { data } = await http.get(`/categories/${cateId.value}/attributes`, { params: { sel: 'many' } })
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    data.data.forEach(item => {
      item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
    })
    manyTableData.value = data.data
  } else if (activeIndex.value === 2) { // 判断访问的是商品属性面板
    const { data } = await http.get(`/categories/${cateId.value}/attributes`, { params: { sel: 'only' } })
    if (data.meta.status !== 200) return message.error(data.meta.msg)
    onlyTableData.value = data.data
  }
}
const handleSuccess = response => { // 图片上传成功的回调
  goods.pics.push({ pic: response.data.tmp_path })
}
const handleRemove = (uploadFile) => { // 处理移除图片操作
  goods.pics.splice(goods.pics.findIndex(item => item.pic === uploadFile.response.data.tmp_path), 1)
}
const handlePreview = file => { // 处理图片预览效果
  previewPath.value = file.response.data.url
  previewDialogVisible.value = true
}
const addGoods = () => { // 添加商品
  addFormRef.value.validate(async valid => {
    if (!valid) return message.error('请填写必要的表单项')
    const goodsDeep = _.cloneDeep(goods) // 深拷贝
    goodsDeep.goods_cat = goodsDeep.goods_cat.join(',')
    manyTableData.value.forEach(item => goods.attrs.push({ // 处理动态参数
      attr_id: item.attr_id,
      attr_value: item.attr_vals.join(' ')
    }))
    onlyTableData.value.forEach(item => goods.attrs.push({ // 处理静态属性
      attr_id: item.attr_id,
      attr_value: item.attr_vals
    }))
    goodsDeep.attrs = goods.attrs
    const { data } = await http.post('/goods', goodsDeep)
    if (data.meta.status !== 201) return message.error(data.meta.msg)
    message.success('添加成功')
    await router.push('/home/goods')
  })
}

// 生命周期函数
onBeforeMount(() => getCateList())
onBeforeUnmount(() => { // 组件销毁时，也及时销毁编辑器
  const editor = editorRef.value
  if (editor === null) return
  editor.destroy()
})

// 计算属性
const cateId = computed(() => { // 当前选中的三级分类的ID
  if (goods && goods.goods_cat.length === 3) return goods.goods_cat[2]
  else return null
})
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 10px 0;
}

// 预览图片
.preview-img {
  width: 100%;
}
</style>
