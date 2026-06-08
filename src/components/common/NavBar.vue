<template>
  <div>
    <nav class="navbar">
      <div class="navbar-left">
        <button class="hamburger" @click.stop="toggleSidebar">
          <Menu :size="22" />
        </button>
        <img src="../../assets/logo-psu.png" alt="PSU Logo" class="logo-psu" />
        <span class="navbar-title">งานสร้างเสริมสุขภาพ คณะแพทยศาสตร์ มหาวิทยาลัยสงขลานครินทร์</span>
      </div>

      <div class="navbar-right">
        <router-link to="/" class="nav-link">
          <Home :size="18" /> หน้าหลัก
        </router-link>

        <!-- Notification Bell -->
        <div class="nav-link nav-notification" @click.stop="toggleNotification">
          <Bell :size="18" />
          <span v-if="unreadCount > 0" class="badge badge-orange">{{ unreadCount }}</span>
        </div>

        <Transition name="fade">
          <div v-if="showNotificationPopup" class="notification-popup" @click.stop>
            <div class="popup-header">
              <span class="popup-title">🔔 แจ้งเตือนการปิดสนาม</span>
              <button class="popup-close" @click="showNotificationPopup = false"><X :size="16" /></button>
            </div>
            <hr class="popup-divider" />

            <div v-if="notifications.length === 0" class="no-notif">ไม่มีการแจ้งเตือนในขณะนี้</div>

            <div v-for="n in notifications" :key="n.id"
              :class="['notification-item', { unread: !n.read }]"
              @click="markAsRead(n.id)">
              <span class="notif-icon">{{ n.icon }}</span>
              <div class="notif-body">
                <div class="notif-title">{{ n.title }}</div>
                <div class="notif-desc">{{ n.desc }}</div>
                <div class="notif-date">{{ n.date }}</div>
              </div>
              <div v-if="!n.read" class="unread-dot"></div>
            </div>

            <hr class="popup-divider" />
            <button class="popup-mark-all" @click="markAllAsRead">ทำเครื่องหมายอ่านทั้งหมด</button>
          </div>
        </Transition>

        <div class="nav-link nav-ticket" @click.stop="toggleTicket">
          <Ticket :size="18" />
          <span class="badge">{{ badmintonTickets + footballTickets }}</span>
        </div>

        <Transition name="fade">
          <div v-if="showTicketPopup" class="ticket-popup" @click.stop>
            <div class="popup-header">
              <span class="popup-title">My tickets</span>
              <button class="popup-close" @click="showTicketPopup = false">
                <X :size="16" />
              </button>
            </div>
            <hr class="popup-divider" />

            <div class="ticket-item">
              <div class="ticket-sport-name">
                <span class="sport-mini-icon">🏸</span>
                <span>แบดมินตัน</span>
              </div>
              <span :class="['ticket-count-badge', badmintonTickets > 0 ? 'active' : 'zero']">
                {{ badmintonTickets }} Tickets
              </span>
            </div>

            <div class="ticket-item">
              <div class="ticket-sport-name">
                <span class="sport-mini-icon">⚽</span>
                <span>ฟุตบอล</span>
              </div>
              <span :class="['ticket-count-badge', footballTickets > 0 ? 'active' : 'zero']">
                {{ footballTickets }} Tickets
              </span>
            </div>

            <hr class="popup-divider" />
            <button class="popup-see-all" @click="goToTickets">
              ดูทั้งหมด / ใช้งาน Tickets
              <ChevronRight :size="16" />
            </button>
          </div>
        </Transition>

        <router-link to="/home" class="nav-link nav-reserve">
          <CalendarDays :size="18" /> จอง/ลงชื่อใช้สนาม
        </router-link>
      </div>
    </nav>

    <!-- Overlay -->
    <div v-if="isSidebarOpen" class="overlay" @click="closeSidebar"></div>

    <!-- Sidebar Drawer -->
    <transition name="slide">
      <div v-if="isSidebarOpen" class="sidebar">
        <div class="sidebar-header">
          <img src="../../assets/logo-psu.png" alt="PSU Logo" class="sidebar-logo" />
        </div>
        <ul class="sidebar-menu">
          <li class="menu-item" @click="navigate('/')">
            <span class="menu-text">หน้าหลัก</span>
          </li>

          <div class="divider"></div>

          <li class="menu-item has-submenu" @click="toggleSubmenu('book')">
            <span class="menu-text">จอง/ลงชื่อใช้สนาม</span>
            <span class="arrow" :class="{ open: openSubmenu === 'book' }">∧</span>
          </li>
          <transition name="expand">
            <ul v-if="openSubmenu === 'book'" class="submenu">
              <li class="submenu-item" @click="navigate('/reserve')">
                จองสนาม (บุคลากร/น.ศ. คณะแพทย์)
              </li>
              <li class="submenu-item" @click="navigate('/reserve')">
                จองสนาม (บุคลากร/น.ศ. ภายในมหาวิทยาลัย)
              </li>
            </ul>
          </transition>

          <div class="divider"></div>

          <li class="menu-item" @click="navigate('/courtschedule')">
            <span class="menu-text">ตารางการใช้สนามแบดมินตัน</span>
          </li>

          <div class="divider"></div>

          <li class="menu-item" @click="navigate('/football')">
            <span class="menu-text">ตารางการใช้สนามฟุตบอลหญ้าเทียม</span>
          </li>

          <div class="divider"></div>

          <li class="menu-item" @click="navigate('/tickets')">
            <span class="menu-text">ประวัติการใช้งาน Tickets</span>
          </li>

          <div class="divider"></div>

          <li class="menu-item" @click="navigate('/')">
            <span class="menu-text">เจ้าหน้าที่</span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, Ticket, CalendarDays, Home, X, ChevronRight, Bell } from 'lucide-vue-next'

const router = useRouter()
const isSidebarOpen = ref(false)
const openSubmenu = ref<string | null>(null)
const showTicketPopup = ref(false)
const showNotificationPopup = ref(false)
const badmintonTickets = ref(2)
const footballTickets = ref(0)

// ── Toggle functions (ปิดอีกอันเมื่อเปิดอันนี้) ──
const toggleNotification = (): void => {
  showNotificationPopup.value = !showNotificationPopup.value
  showTicketPopup.value = false
}

const toggleTicket = (): void => {
  showTicketPopup.value = !showTicketPopup.value
  showNotificationPopup.value = false
}

// ── Close both popups on outside click ──
const closeAllPopups = (): void => {
  showNotificationPopup.value = false
  showTicketPopup.value = false
}

onMounted(() => document.addEventListener('click', closeAllPopups))
onUnmounted(() => document.removeEventListener('click', closeAllPopups))

// ── Sidebar ──
const toggleSidebar = (): void => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (!isSidebarOpen.value) openSubmenu.value = null
}

const closeSidebar = (): void => {
  isSidebarOpen.value = false
  openSubmenu.value = null
}

const toggleSubmenu = (key: string): void => {
  openSubmenu.value = openSubmenu.value === key ? null : key
}

const navigate = (path: string): void => {
  router.push(path)
  closeSidebar()
}

const goToTickets = (): void => {
  router.push('/tickets')
  showTicketPopup.value = false
}

// ── Notifications ──
const notifications = ref([
  { id: 1, icon: '🏸', title: 'ปิดสนามแบดมินตัน', desc: 'สนาม 1-3 ปิดปรับปรุง 24-25 พ.ค. 2568', date: '20 พ.ค. 2568', read: false },
  { id: 2, icon: '⚽', title: 'ปิดสนามฟุตบอล', desc: 'สนามหญ้าเทียมปิดบำรุงรักษา 22 พ.ค. 2568', date: '19 พ.ค. 2568', read: false },
  { id: 3, icon: '📢', title: 'แจ้งเตือนทั่วไป', desc: 'สนามปิดวันหยุดนักขัตฤกษ์ 1 มิ.ย. 2568', date: '18 พ.ค. 2568', read: true },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const markAsRead = (id: number) => { const n = notifications.value.find(n => n.id === id); if (n) n.read = true }
const markAllAsRead = () => notifications.value.forEach(n => (n.read = true))
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
  z-index: 200;
  width: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
}

.logo-psu {
  height: 60px;
  object-fit: contain;
}

.navbar-title {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  max-width: 700px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: #333;
  font-size: 15px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  cursor: pointer;
}

.nav-link:hover {
  background: #f0f0f0;
}

.nav-ticket {
  position: relative;
}

.badge {
  position: absolute;
  top: 0px;
  right: 2px;
  background: #e53935;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ─── Ticket Popup ─── */
.ticket-popup {
  position: absolute;
  top: calc(100% + 12px);
  right: 80px;
  width: 260px;
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  padding: 14px 16px;
  z-index: 500;
  border: 1px solid #eee;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-title {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.popup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  display: flex;
  align-items: center;
}

.popup-divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 10px 0;
}

.ticket-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.ticket-sport-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.sport-mini-icon {
  font-size: 18px;
}

.ticket-count-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

.ticket-count-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.ticket-count-badge.zero {
  background: #f5f5f5;
  color: #999;
}

.popup-see-all {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #1b5e20;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.popup-see-all:hover {
  background: #2e7d32;
}

/* ─── Overlay ─── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
}

/* ─── Sidebar ─── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  background: white;
  z-index: 400;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,0.15);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #eee;
}

.sidebar-logo {
  height: 48px;
  object-fit: contain;
}

.sidebar-brand {
  font-size: 0.62rem;
  font-weight: 700;
  color: #1b5e20;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.sidebar-title {
  font-size: 0.78rem;
  color: #555;
  margin-left: auto;
}

.sidebar-label {
  padding: 10px 20px 6px;
  font-size: 0.75rem;
  color: #999;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #222;
  cursor: pointer;
  transition: background 0.15s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.arrow {
  font-size: 0.75rem;
  color: #888;
  transition: transform 0.25s;
  display: inline-block;
  transform: rotate(180deg);
}

.arrow.open {
  transform: rotate(0deg);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fafafa;
}

.submenu-item {
  padding: 12px 24px 12px 40px;
  font-size: 0.88rem;
  color: #444;
  cursor: pointer;
  transition: background 0.15s;
  border-top: 1px solid #f0f0f0;
}

.submenu-item:hover {
  background: #f0f0f0;
}

.divider {
  height: 1px;
  background: #efefef;
  margin: 0;
}

/* ─── Transitions ─── */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.28s cubic-bezier(.22,1,.36,1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ─── Notification Bell ─── */
.nav-notification { position: relative; cursor: pointer; }
.badge-orange { position: absolute; top: 0; right: 2px; background: #e53935; color: white; font-size: 10px; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.notification-popup { position: absolute; top: calc(100% + 12px); right: 80px; width: 300px; background: white; border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); padding: 14px 16px; z-index: 500; border: 1px solid #eee; }
.no-notif { text-align: center; font-size: 13px; color: #999; padding: 16px 0; }
.notification-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 6px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.notification-item:hover { background: #f9f9f9; }
.notification-item.unread { background: #fff8f0; }
.notif-icon { font-size: 20px; flex-shrink: 0; }
.notif-body { flex: 1; }
.notif-title { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.notif-desc { font-size: 12px; color: #555; margin-top: 2px; line-height: 1.4; }
.notif-date { font-size: 11px; color: #aaa; margin-top: 4px; }
.unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #e53935; flex-shrink: 0; margin-top: 4px; }
.popup-mark-all { width: 100%; display: flex; align-items: center; justify-content: center; background: none; color: #555; border: 1px solid #ddd; border-radius: 8px; padding: 8px; font-size: 12px; cursor: pointer; }
.popup-mark-all:hover { background: #f5f5f5; }
</style>