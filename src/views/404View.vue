<template>
  <div class="error-404">
    <div class="box">
      <div class="left animate__animated animate__fadeInLeft">
        <img src="@/assets/images/404.png" alt="404">
      </div>
      <div class="right animate__animated animate__fadeInRight">
        <div>404错误！</div>
        <div>找不到网页！</div>
        <div>对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。</div>
        <el-button type="primary" class="btn btn-info text-white" @click="router.push('/home')">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.error-404 {
  position: relative;
  height: 100%;
  overflow: hidden;

  .box {
    position: absolute;
    left: 50%;
    top: 50%;
    display: flex;
    align-items: center;
    transform: translate(-50%, -50%);

    .left {
      img {
        height: 20rem;
      }
    }

    .right {
      width: 18.75rem;

      div {
        &:nth-child(1) {
          margin-bottom: 1.25rem;
          color: #1582f0;
          font-size: 2.25rem;
          line-height: 2.5rem;
          font-weight: bold;
        }

        &:nth-child(2) {
          margin-bottom: 0.625rem;
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: bold;
        }

        &:nth-child(3) {
          margin-bottom: 2rem;
          color: rgb(156 163 175);
        }
      }
    }
  }
}
</style>
