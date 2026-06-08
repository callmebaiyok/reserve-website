<template>
  <nav class="navbar">
    <div class="navbar-left">
      <!-- Hamburger -->
      <button class="hamburger" @click="showMenu = !showMenu">
        <Menu :size="22" />
      </button>

      <!-- Side Menu -->
      <Transition name="slide">
        <div v-if="showMenu" class="side-menu">
          <div class="menu-header">
            <img src="../../assets/logo-psu.png" class="menu-logo" alt="PSU" />
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/')">
            <Home :size="18" />
            <span>หน้าหลัก</span>
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/admindashboard')">
            <LayoutDashboard :size="18" />
            <span>Admin Dashboard</span>
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/managecourt')">
            <Settings :size="18" />
            <span>จัดการประเภทสนาม</span>
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/courtschedule')">
            <CalendarDays :size="18" />
            <span>ตารางการใช้สนามแบดมินตัน</span>
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/football')">
            <CalendarDays :size="18" />
            <span>ตารางการใช้สนามฟุตบอลหญ้าเทียม</span>
          </div>
          <hr class="menu-divider" />

          <div class="menu-item" @click="navigate('/admin/return-tickets')">
            <Ticket :size="18" />
            <span>คืน Tickets ให้ผู้ใช้งาน</span>
          </div>
          <hr class="menu-divider" />
        </div>
      </Transition>

      <!-- Overlay -->
      <div v-if="showMenu" class="menu-overlay" @click="showMenu = false"></div>

      <!-- Logo -->
      <img src="../../assets/logo-psu.png" alt="PSU Logo" class="logo-psu" />
      <span class="navbar-title">งานสร้างเสริมสุขภาพ คณะแพทยศาสตร์ มหาวิทยาลัยสงขลานครินทร์</span>
    </div>

    <div class="navbar-right">
      <!-- Admin Badge -->
      <div class="admin-badge">
        <Shield :size="16" />
        <span>Admin</span>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Menu, Home, CalendarDays, Ticket,
  LayoutDashboard, Settings, Shield
} from 'lucide-vue-next'

const router = useRouter()
const showMenu = ref(false)

function navigate(path: string) {
  router.push(path)
  showMenu.value = false
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  padding: 1px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left { display: flex; align-items: center; gap: 10px; }
.hamburger { background: none; border: none; cursor: pointer; color: #333; display: flex; align-items: center; padding: 8px; border-radius: 6px; transition: background 0.2s; }
.hamburger:hover { background: #f0f0f0; }
.logo-psu { height: 60px; object-fit: contain; }
.navbar-title { font-size: 15px; color: #333; font-weight: 500; max-width: 500px; }

.navbar-right { display: flex; align-items: center; gap: 16px; }

/* Admin Badge */
.admin-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #1b5e20;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* Side Menu */
.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: 4px 0 20px rgba(0,0,0,0.15);
  z-index: 200;
  overflow-y: auto;
  padding: 20px 0;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 199;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px 16px;
}

.menu-logo { height: 44px; object-fit: contain; }
.menu-brand { font-size: 13px; font-weight: 700; color: #1b5e20; }
.menu-sub { font-size: 11px; color: #888; }

.menu-divider { border: none; border-top: 1px solid #f0f0f0; margin: 0; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #1b5e20;
}

/* Slide animation */
.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>