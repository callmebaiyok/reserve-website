<template>
  <div class="dashboard-page">
    <NavBarAdmin />
    <div class="main-content">
      <aside class="sidebar section-card">
        <h2 class="sidebar-main-title">Admin Dashboard</h2>
        <p class="select-date-label">เลือกวันที่</p>
        <p class="selected-date-display">{{ selectedDate }}</p>

        <div class="calendar-widget">
          <div class="calendar-header">
            <span>{{ calendarHeader }}</span>
            <div class="calendar-nav">
              <button class="cal-nav-btn" @click="prevMonth">‹</button>
              <button class="cal-nav-btn" @click="nextMonth">›</button>
            </div>
          </div>
          <div class="calendar-grid">
            <!-- วันในสัปดาห์ -->
            <span class="cal-weekday" v-for="d in ['อา','จ','อ','พ','พฤ','ศ','ส']" :key="d">{{ d }}</span>
            <!-- วันที่ -->
            <span
              v-for="(dayNum, index) in calendarDays"
              :key="index"
              class="cal-day"
              :class="{
                'is-selected': isSelected(dayNum),
                'is-today': isToday(dayNum),
                'is-empty': !dayNum
              }"
              @click="selectDate(dayNum)"
            >
              {{ dayNum }}
            </span>
          </div>
        </div>
      </aside>

      <main class="schedule-area">
        <section class="schedule-section section-card">
          <h2 class="schedule-title">Schedule: {{ currentScheduleDate }}</h2>

          <div class="time-header-row">
            <div class="court-col-header">สนาม</div>
            <div v-for="time in timeSlots" :key="time" class="time-slot">{{ time }}</div>
          </div>

          <div v-for="(group, gIndex) in courtGroups" :key="gIndex" class="court-group">
            <div v-if="group.type === 'Football Arena'" class="group-header-row">
              <div class="court-col-header"></div>
              <div v-for="time in timeSlots" :key="'g-'+time" class="time-slot">{{ time }}</div>
            </div>

            <div v-for="court in group.courts" :key="court.name" class="court-row">
              <div class="court-name">{{ court.name }}</div>
              <div v-for="slot in court.statuses" :key="slot.time" class="status-cell">
                <span
                  class="status-badge clickable"
                  :style="{ color: getStatusObj(slot.status).color, backgroundColor: getStatusObj(slot.status).bgColor }"
                  @click="handleFreeClick(court, slot)"
                >
                  {{ getStatusObj(slot.status).label }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <button class="add-type-btn" @click="$router.push('/managecourt')">
          + เพิ่มประเภทสนาม
        </button>
      </main>
    </div>

    <ModalLockSlot
      v-if="isShowModal"
      :courtName="selectedCourt"
      :allTimeSlots="timeSlots"
      :availableSlots="selectedCourtFreeSlots"
      @close="isShowModal = false"
      @confirm="handleConfirmLock"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ModalLockSlot from '../views/ModalLockSlot.vue'


// --- Types ---
interface Status {
  label: 'FREE' | 'CLOSED'
  color: string
  bgColor: string
}
interface CourtStatus {
  time: string
  status: 'FREE' | 'CLOSED'
}
interface Court {
  name: string
  statuses: CourtStatus[]
}
interface CourtGroup {
  type: string
  courts: Court[]
}

// ── Calendar ──
const today = new Date()

const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-based

const selectedDay = ref(today.getDate())
const selectedMonth = ref(today.getMonth())
const selectedYear = ref(today.getFullYear())

const thaiMonths = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน',
  'พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม',
  'กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
]
const thaiDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']

const calendarHeader = computed(() =>
  `${thaiMonths[currentMonth.value]} ${currentYear.value + 543}`
)

const selectedDate = computed(() => {
  const d = new Date(selectedYear.value, selectedMonth.value, selectedDay.value)
  return `${thaiDays[d.getDay()]}ที่ ${selectedDay.value} ${thaiMonths[selectedMonth.value]} ${selectedYear.value + 543}`
})

const currentScheduleDate = computed(() => {
  const m = String(selectedMonth.value + 1).padStart(2, '0')
  const d = String(selectedDay.value).padStart(2, '0')
  return `${selectedYear.value}-${m}-${d}`
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

const isSelected = (day: number | null) =>
  day !== null &&
  day === selectedDay.value &&
  currentMonth.value === selectedMonth.value &&
  currentYear.value === selectedYear.value

const isToday = (day: number | null) =>
  day !== null &&
  day === today.getDate() &&
  currentMonth.value === today.getMonth() &&
  currentYear.value === today.getFullYear()

const selectDate = (day: number | null) => {
  if (!day) return
  selectedDay.value = day
  selectedMonth.value = currentMonth.value
  selectedYear.value = currentYear.value
}

const prevMonth = () => {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

const nextMonth = () => {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

// --- Schedule Data ---
const timeSlots = ['14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

const statusMap: Record<'FREE' | 'CLOSED', Status> = {
  FREE:   { label: 'FREE',   color: '#1B5E20', bgColor: '#E8F5E9' },
  CLOSED: { label: 'CLOSED', color: '#B71C1C', bgColor: '#FFEBEE' },
}

const courtGroups = ref<CourtGroup[]>([
  {
    type: 'Badminton',
    courts: [
      { name: 'แบดมินตันสนาม A', statuses: [
        { time: '14:00', status: 'FREE' }, { time: '15:00', status: 'FREE' },
        { time: '16:00', status: 'CLOSED' }, { time: '17:00', status: 'FREE' },
        { time: '18:00', status: 'FREE' }, { time: '19:00', status: 'FREE' },
        { time: '20:00', status: 'FREE' }, { time: '21:00', status: 'FREE' },
      ]},
      { name: 'แบดมินตันสนาม B', statuses: timeSlots.map(time => ({ time, status: 'FREE' as const })) },
      { name: 'แบดมินตันสนาม C', statuses: timeSlots.map(time => ({ time, status: 'FREE' as const })) },
      { name: 'แบดมินตันสนาม D', statuses: timeSlots.map(time => ({ time, status: 'FREE' as const })) },
    ]
  },
  {
    type: 'Football Arena',
    courts: [
      { name: 'สนามฟุตบอลหญ้าเทียม', statuses: timeSlots.map(time => ({ time, status: 'FREE' as const })) },
    ]
  }
])

const selectedCourtFreeSlots = computed(() => {
  for (const group of courtGroups.value) {
    const court = group.courts.find(c => c.name === selectedCourt.value)
    if (court) return court.statuses.filter(s => s.status === 'FREE').map(s => s.time)
  }
  return []
})

const getStatusObj = (statusStr: 'FREE' | 'CLOSED'): Status => statusMap[statusStr]

const isShowModal = ref(false)
const selectedCourt = ref('')
const selectedSlot = ref('')

const handleFreeClick = (court: Court, slot: CourtStatus) => {
  if (slot.status === 'FREE') {
    selectedCourt.value = court.name
    selectedSlot.value = slot.time
    isShowModal.value = true
  }
}

const handleConfirmLock = (data: { courtName: string; slots: string[] }) => {
  courtGroups.value.forEach(group => {
    group.courts.forEach(court => {
      if (court.name === data.courtName) {
        court.statuses.forEach(s => {
          if (data.slots.includes(s.time)) s.status = 'CLOSED'
        })
      }
    })
  })
  isShowModal.value = false
}
</script>

<style scoped>
/* --- General & Variables --- */
:root {
  --green-psu-dark: #1B5E20;
  --green-psu-mid: #2E7D32;
  --green-psu-light: #C8E6C9;
  --bg-deco-light: #F1F8E9;
  --text-main: #333;
  --card-shadow: 0 4px 15px rgba(0,0,0,0.08);
}

.dashboard-page {
  font-family: 'Sarabun', sans-serif;
  min-height: 100vh;
  background-image: url('../assets/background.png'); /* 👈 ตรงนี้ */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* Background Image/Placeholder */
.page-background-placeholder {
  position: absolute;
  inset: 0;
  background-color: #F1F8E9; /* สีเขียวจางๆ จำลองพื้นหลัง */
  z-index: 0;
}
.page-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.7; /* ตามภาพหลัก */
  z-index: 0;
}

/* Common Card Style */
.section-card {
  background: #FFFFFFCC;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
  z-index: 1;
}

/* --- Header --- */
.main-header {
  background: white;
  padding: 10px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  z-index: 10;
}
.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}
.menu-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}
.psu-logo { height: 35px; }
.header-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1B5E20;
  margin: 0;
}
.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
}
.nav-link.active {
  color: #2E7D32;
  font-weight: 700;
}

/* --- Main Content Layout --- */
.main-content {
  flex: 1;
  display: flex;
  gap: 25px;
  padding: 25px 30px;
  z-index: 1;
}

/* --- Sidebar (Left) --- */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-main-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 20px;
}
.select-date-label { font-size: 0.9rem; color: #666; margin-bottom: 2px; }
.selected-date-display {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 15px;
}

/* Calendar Widget */
.calendar-widget {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  width: 100%;
}
.calendar-header {
  background-color: #26A69A; /* สี Teal ตามรูป */
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.calendar-nav { display: flex; gap: 10px; }
.cal-nav-btn { background: none; border: none; color: white; cursor: pointer; }
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  text-align: center;
}
.cal-weekday { font-weight: 600; color: #666; padding-bottom: 5px; }
.cal-day {
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent; /* จองพื้นที่ไว้สำหรับ border */
  
}
.cal-day:hover:not(.is-empty) {
  background-color: rgba(38, 166, 154, 0.1);
  border-radius: 8px;
}
.cal-day.is-selected {
  background-color: #C8E6C9;
  font-weight: 700;
  border-radius: 10px;
}
.cal-day.is-empty { cursor: default; }


.month-display {
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.down-arrow {
  font-size: 0.8rem;
  opacity: 0.8;
}
/* ปุ่มกดเปลี่ยนเดือนแบบในรูป */
.nav-controls {
  display: flex;
  gap: 8px;
}
.nav-btn {
  background: white;
  color: #333;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px; /* มนเล็กน้อยแบบสี่เหลี่ยมในรูป */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* --- Schedule Area (Right) --- */
.schedule-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.schedule-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
}

/* Table Style Headers */
.time-header-row, .group-header-row {
  display: grid;
  grid-template-columns: 140px repeat(8, 1fr); /* Match structure */
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  padding: 10px 0;
  border-bottom: 1px solid #EEE;
}
.court-col-header { text-align: left; padding-left: 10px; }

/* Court Group/Rows */
.court-group { margin-bottom: 10px; }
.court-row {
  display: grid;
  grid-template-columns: 140px repeat(8, 1fr);
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F5F5F5;
  font-size: 0.8rem;
}
.court-name { font-weight: 600; padding-left: 10px; }
.status-cell { text-align: center; }
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.7rem;
  display: inline-block;
  min-width: 50px;
  transition: all 0.2s ease;
}
/* ตอนถูกเลือก */
.status-badge.active {
  background-color: #1B5E20 !important;
  color: white !important;
  border: 2px solid #0D3B12;
}

/* Bottom Button */
.add-type-btn {
  align-self: flex-end;
  background-color: #2E7D32;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  z-index: 1;
}

/* วันที่ถูกเลือกเป็นวงกลมเขียว */
.day-cell.is-selected {
  background-color: #26A69A !important;
  color: white !important;
  border-radius: 50% !important;
  font-weight: bold;
}

.contact-info {
  display: flex;
  gap: 20px;
  font-size: 0.75rem;
  margin-top: 10px;
  margin-bottom: 10px;
}

.clickable {
  cursor: pointer;
  transition: 0.15s;
}
/* ตอน hover */
.clickable:hover {
  opacity: 0.9;
}
/* ตอนกำลังกด */
.clickable:active {
  background-color: #1B5E20 !important;
  color: white !important;
  border: 2px solid #10601a;
}

.copyright { font-size: 0.7rem; opacity: 0.8; margin-top: 10px; }
</style>