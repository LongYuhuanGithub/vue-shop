<template>
  <div class="login">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="@/assets/images/logo.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form class="demo-ruleForm" ref="loginFormRef" :rules="rules" :model="user" status-icon>
        <el-form-item prop="username">
          <el-input placeholder="用户名" v-model="user.username">
            <template #prefix>
              <i class="iconfont icon-user"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="密码" v-model="user.password">
            <template #prefix>
              <i class="iconfont icon-3702mima"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <div class="btns">
            <el-button type="primary" @click="submitForm">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: { // 用户数据模型
        username: 'admin',
        password: '123456'
      },
      rules: { // 表单校验对象
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          const { data } = await this.$http.post('/login', this.user)
          console.log(data)
          if (data.meta.status !== 200) return this.$message.error('登录失败，用户名或密码错误！')
          this.$message.success('登录成功')
          // 将登录成功之后的 token，保存到客户端的 sessionStorage 中。token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
          // 项目中除了登录之外的其他 API 接口，必须在登录之后才能访问
          sessionStorage.setItem('vue_shop_token', data.data.token)
          this.$router.push('/home')
        }
      })
    },
    resetForm() { // 重置表单
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.login {
  position: relative;
  height: 100%;
  background-color: #2b4b6b;

  .login-box {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 3px;
    width: 400px;
    height: 250px;
    background-color: #fff;
    transform: translate(-50%, -50%);

    // 头像区域
    .avatar-box {
      position: absolute;
      top: 0;
      left: 50%;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      width: 110px;
      height: 110px;
      background-color: #fff;
      box-shadow: 0 0 10px #ddd;
      transform: translate(-50%, -50%);

      img {
        border-radius: 50%;
        width: 100%;
        height: 100%;
        background-color: #eee;
      }
    }

    // 登录表单
    .el-form {
      position: absolute;
      bottom: 0;
      padding: 0 20px;
      width: 100%;
      box-sizing: border-box;

      .btns {
        display: flex;
        justify-content: end;
        width: 100%;
      }
    }
  }
}
</style>
