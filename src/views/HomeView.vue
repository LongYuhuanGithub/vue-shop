<template>
  <div class="home">
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <div>
          <img src="@/assets/images/logo.png" alt="">
          <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出登录</el-button>
      </el-header>
      <!-- 内容区域 -->
      <el-container>
        <!-- 左侧导航 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="isCollapse = !isCollapse">|||</div>
          <el-menu class="el-menu-vertical-demo"
                   background-color="#333744"
                   text-color="#fff"
                   active-text-color="#409eff"
                   unique-opened
                   router
                   :collapse="isCollapse"
                   :collapse-transition="false"
                   :default-active="activePath">
            <!-- 一级菜单 -->
            <el-sub-menu v-for="item in menuList" :key="item.id" :index="item.id + ''">
              <template #title>
                <el-icon :class="iconObj[item.id]"></el-icon>
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/home/' + subItem.path" @click="saveNavState('/home/' + subItem.path)">
                <el-icon><Menu/></el-icon>
                <span>{{ subItem.authName }}</span>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        <!-- 主体内容 -->
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade-transform">
              <keep-alive>
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { onBeforeMount, inject, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Menu } from '@element-plus/icons-vue'

const message = inject('message')
const http = inject('http')
const router = useRouter()

// 生命周期函数
onBeforeMount(() => {
  getMenuList()
  activePath.value = window.sessionStorage.getItem('vue_shop_active_path')
})

// 响应式状态
const menuList = ref([]) // 菜单列表
const iconObj = reactive({ // 每个菜单对应的图标
  125: 'iconfont icon-user',
  103: 'iconfont icon-tijikongjian',
  101: 'iconfont icon-shangpin',
  102: 'iconfont icon-danju',
  145: 'iconfont icon-baobiao'
})
const isCollapse = ref(false) // 左侧菜单是否折叠
const activePath = ref('') // 当前高亮的路由链接

// 处理函数
const logout = () => { // 退出登录
  ElMessageBox.confirm(
    '确认要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    sessionStorage.removeItem('vue_shop_token')
    router.push('/login')
  })
}
const getMenuList = async () => { // 获取菜单列表
  const { data } = await http.get('/menus')
  if (data.meta.status !== 200) return message.error(data.meta.msg)
  menuList.value = data.data
}
const saveNavState = currentActivePath => { // 保存菜单高亮状态
  window.sessionStorage.setItem('vue_shop_active_path', currentActivePath)
  activePath.value = currentActivePath
}
</script>

<style lang="scss" scoped>
.home {
  height: 100%;

  .el-container {
    height: 100%;

    // 头部区域
    .el-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-left: 0;
      padding-right: 14px;
      background-color: #373d41;
      color: #fff;
      font-size: 20px;

      div {
        display: flex;
        align-items: center;

        img {
          height: 56px;
        }
      }
    }

    // 内容区域
    .el-container {
      .el-header {
        background-color: #373d41;
      }

      .el-aside {
        background-color: #333744;

        .toggle-button {
          height: 30px;
          background-color: #475161;
          color: #fff;
          text-align: center;
          line-height: 30px;
        }

        // 去除 el-menu 组件的右边框
        .el-menu {
          border-right: none;
        }
      }

      .el-main {
        background-color: #eaedf1;

        // Transition 组件的过渡样式
        .fade-transform-enter-active,
        .fade-transform-leave-active {
          transition: all .7s ease-in-out;
        }

        .fade-transform-enter-from,
        .fade-transform-leave-to {
          position: absolute;
          width: 100%;
          transform: translateX(100%);
          opacity: 0;
        }
      }
    }
  }
}
</style>
