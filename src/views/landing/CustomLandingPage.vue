<template>
  <div class="custom-landing-container">
    <!-- 直接渲染原生重构的落地页，彻底告别 Iframe 白屏问题 -->
    <LandingPage />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import LandingPage from './LandingPage.vue';

export default {
  name: 'CustomLandingPage',
  components: {
    LandingPage
  },
  setup() {
    onMounted(() => {
      // 页面挂载后确保加载动画隐藏
      if (window.hideAppLoading) {
        window.hideAppLoading();
      }
    });

    return {};
  }
};
</script>

<style lang="scss" scoped>
.custom-landing-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  background-color: var(--background-color);
}
</style>
