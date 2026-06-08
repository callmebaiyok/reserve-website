<template>
  <div class="login-page" :style="{ backgroundImage: `url(${bg})` }">
    <div class="content">
      <h1>เข้าสู่ระบบ</h1>
      <p class="subtitle">เลือกช่องทางการเข้าสู่ระบบ</p>

      <!-- ✅ User login -->
      <div class="login-box passport" @click="handleLogin('user')">
        <div class="left-box">
          <img :src="passport" />
          <span>PSU Passport</span>
        </div>
        <ChevronRight :size="20" color="#666" />
      </div>

      <div class="login-box outlook" @click="handleLogin('user')">
        <div class="left-box">
          <img :src="outlook" />
          <span>Medicine Mail</span>
        </div>
        <ChevronRight :size="20" color="#666" />
      </div>

      <div class="login-box thaiid" @click="handleLogin('user')">
        <div class="left-box">
          <img :src="thaiid" />
          <span>ThaiID</span>
        </div>
        <ChevronRight :size="20" color="#666" />
      </div>

      <!-- ✅ Admin login -->
      <div class="login-box admin-box" @click="handleLogin('admin')">
  <div class="left-box">
    <Shield :size="32" color="#1b5e20" />
    <span>เข้าสู่ระบบ Admin</span>
  </div>
  <ChevronRight :size="20" color="#1b5e20" />
</div>
    </div>
  </div>
</template>

<script setup>
import bg from '../assets/login.png'
import passport from '../assets/psupassport.png'
import outlook from '../assets/outlook.png'
import thaiid from '../assets/thaiid.webp'
import { useRouter } from 'vue-router'
import { ChevronRight, Shield } from 'lucide-vue-next'
import { login } from '../stores/auth'

const router = useRouter()

function handleLogin(role) {
  if (role === 'admin') {
    login('admin', 'Admin User', 'IT')
    router.push('/admindashboard')
  } else {
    login('user', 'Suwanon Choojan', 'IT')
    router.push('/courtschedule')
  }
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding-top: 40px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 48px 40px;
}

h1 {
  color: #1b5e20;
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(255,255,255,0.8);
}

.subtitle {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 28px;
}

.login-box {
  width: 400px;
  margin: 8px 0;
  padding: 16px 24px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.login-box:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 28px rgba(0,0,0,0.15);
}

.left-box {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.left-box img {
  width: 80px;
  height: 40px;
  object-fit: contain;
}

.passport   { border: 2px solid #2e7d32; }
.outlook    { border: 2px solid #1565c0; }
.thaiid     { border: 2px solid #00897b; }

/* ✅ Admin box */
.admin-box {
  border: 2px solid #1b5e20;
  margin-top: 16px;
  background: rgba(232, 245, 233, 0.95);
}
</style>