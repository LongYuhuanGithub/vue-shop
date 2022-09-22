<template>
  <div class="home">
    <el-popconfirm title="确认要退出吗？" @confirm="logout">
      <template #reference>
        <el-button type="info">退出</el-button>
      </template>
    </el-popconfirm>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      sessionStorage.removeItem('vue_shop_token')
      this.$router.push('/login')
    }
  }
}
</script>
