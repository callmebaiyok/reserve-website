<template>
  <div
    class="page-container"
    :style="isLoginPage ? {} : { backgroundImage: `url(${bgImage})` }"
  >
    <NavBarAdmin v-if="isAdmin" />
    <NavBar v-else-if="!isLoginPage" />
    <main>
      <RouterView />
    </main>
    <FooterSection v-if="!isLoginPage" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/common/NavBar.vue'
import NavBarAdmin from './components/common/NavBarAdmin.vue'
import FooterSection from './components/common/FooterSection.vue'
import { currentUser } from './stores/auth'
import bgImage from './assets/hero-bg.png'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
const isAdmin = computed(() => currentUser.value.role === 'admin')
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
}
main { flex: 1; }
</style>