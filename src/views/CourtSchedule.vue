<template>
  <div class="page-wrapper">
    <NavBar />
    <main class="main-content">
      <!-- Header Card -->
      <div class="section-card header-card">
        <div class="section-header">
          <!-- ซ้าย: หัวข้อ -->
          <div class="section-title">
            <CalendarDays class="calendar-icon" />
            <h2>ตารางการใช้สนามแบดมินตัน</h2>
          </div>

          <!-- ขวา: ปุ่ม + วันที่ -->
          <div class="date-nav">
            <button class="nav-date-btn" @click="prevDay">‹ ก่อนหน้า</button>

            <div class="custom-date-container">
              <!-- วันที่ -->
              <div
                class="minimal-date-display"
                @click="isDatePickerOpen = !isDatePickerOpen"
              >
                <span class="current-date">
                  {{ formatDateThai(currentDate) }}
                </span>
              </div>

              <!-- ปฏิทิน -->
              <div v-if="isDatePickerOpen" class="calendar-card">
                <!-- header -->
                <div class="calendar-header">
                  <div class="month-year">
                    {{ monthNames[viewDate.getMonth()] }}
                    {{ viewDate.getFullYear() }}
                  </div>

                  <div class="nav-arrows">
                    <button @click.stop="prevMonth">‹</button>
                    <button @click.stop="nextMonth">›</button>
                  </div>
                </div>

                <!-- grid -->
                <div class="calendar-grid">
                  <!-- วัน -->
                  <div
                    v-for="day in daysOfWeek"
                    :key="day"
                    class="weekday-label"
                  >
                    {{ day }}
                  </div>

                  <!-- วันที่ -->
                  <div
                    v-for="(day, index) in daysInMonth"
                    :key="index"
                    class="day-cell"
                    :class="{
                      'is-selected':
                        day === currentDate.getDate() &&
                        viewDate.getMonth() === currentDate.getMonth() &&
                        viewDate.getFullYear() === currentDate.getFullYear(),
                      empty: !day,
                    }"
                    @click="selectDate(day)"
                  >
                    {{ day }}
                  </div>
                </div>
              </div>
            </div>

            <button class="nav-date-btn" @click="nextDay">ถัดไป ›</button>
          </div>
        </div>
      </div>

      <!-- Schedule Card -->
      <div class="section-card schedule-card">
        <div class="schedule-header-row">
          <span class="schedule-date-label">{{
            formatDateThai(currentDate)
          }}</span>
          <div class="schedule-nav">
            <button class="icon-btn" @click="prevDay">‹</button>
            <button class="icon-btn" @click="nextDay">›</button>
          </div>
        </div>

        <!-- Grid -->
        <div class="schedule-grid-wrapper">
          <div class="schedule-grid" :style="gridStyle">
            <!-- Time headers -->
            <div class="grid-corner"></div>
            <div v-for="slot in timeSlots" :key="slot" class="time-header">
              {{ slot }}
            </div>

            <!-- Court rows -->
            <template v-for="court in courts" :key="court.id">
              <!-- ชื่อสนาม -->
              <div class="court-label">
                {{ court.name }}
              </div>

              <!-- ช่องเวลา -->
              <div
                v-for="slot in timeSlots"
                :key="court.id + '-' + slot"
                class="time-cell"
                :class="{ 'cell-hover': !getBooking(court.id, slot) }"
                @click="handleCellClick(court.id, slot)"
              >
                <div
                  v-if="getBooking(court.id, slot)"
                  class="booking-block"
                  :class="'court-color-' + court.id"
                  @click.stop="
                    openBookingDetails(getBooking(court.id, slot), court.id)
                  "
                >
                  <span class="booking-name">
                    {{ getBooking(court.id, slot)?.name }}
                  </span>
                  <span class="booking-time">
                    {{ getBooking(court.id, slot)?.time }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <span class="legend-label">สีประจำสนาม</span>
          <div class="legend-items">
            <div v-for="court in courts" :key="court.id" class="legend-item">
              <div class="legend-dot" :class="`court-color-${court.id}`"></div>
              <span>{{ court.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Background deco -->
    <div class="bg-elements" aria-hidden="true">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
    </div>

    <div v-if="isShowModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>รายละเอียดการจอง</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <div class="detail-icon">📋</div>
            <div class="detail-text">
              <strong>{{ selectedBooking?.name }}</strong>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">🕒</div>
            <div class="detail-text">
              <p>วันที่: {{ formatDateThai(currentDate) }}</p>
              <p>{{ selectedBooking?.slot }} น.</p>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">📍</div>
            <div class="detail-text">
              <p>สนาม: {{ selectedBooking?.courtName }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ✅ สิ้นสุดส่วน Modal -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { CalendarDays } from "lucide-vue-next";

// ─── Types ───────────────────────────────────────────────
interface Booking {
  courtId: number;
  slot: string;
  name: string;
  time: string;
}

interface Court {
  id: number;
  name: string;
}

// ─── Data ────────────────────────────────────────────────
const currentDate = ref<Date>(new Date(2026, 3, 23)); // 23 April 2026
const isDatePickerOpen = ref(false);
const viewDate = ref(new Date(currentDate.value)); // วันที่ที่แสดงในหน้าปฏิทิน

const daysOfWeek = ["S", "M", "T", "W", "TH", "F", "S"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// คำนวณวันที่ในปฏิทิน
const daysInMonth = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();
  const days: (number | null)[] = [];
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  return days;
});

const nextMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() + 1,
    1,
  );
};

const prevMonth = () => {
  viewDate.value = new Date(
    viewDate.value.getFullYear(),
    viewDate.value.getMonth() - 1,
    1,
  );
};

const selectDate = (day: number | null) => {
  if (day) {
    currentDate.value = new Date(
      viewDate.value.getFullYear(),
      viewDate.value.getMonth(),
      day,
    );
    isDatePickerOpen.value = false;
  }
};

const courts: Court[] = [
  { id: 1, name: "Court 1" },
  { id: 2, name: "Court 2" },
  { id: 3, name: "Court 3" },
  { id: 4, name: "Court 4" },
];

const timeSlots: string[] = [
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
];

const bookings = ref<Booking[]>([
  { courtId: 1, slot: "14:00-15:00", name: "พชร สุขลิ่ม", time: "14:00-15:00" },
  {
    courtId: 1,
    slot: "15:00-16:00",
    name: "ฐิตาพร เดชาทัย",
    time: "15:00-16:00",
  },
  {
    courtId: 1,
    slot: "16:00-17:00",
    name: "ฐิตาพร เดชาทัย",
    time: "16:00-17:00",
  },
  { courtId: 1, slot: "19:00-20:00", name: "ศิริพร แซ่โล่", time: "19:00-20:00" },
  {
    courtId: 2,
    slot: "14:00-15:00",
    name: "ศิริพร แซ่โล่",
    time: "14:00-16:00",
  },
  { courtId: 2, slot: "15:00-16:00", name: "ศิวกร ศิริยานุรักษ์ ", time: "15:00-16:00" },
  { courtId: 2, slot: "17:00-18:00", name: "ชมรมเเเบดมินตัน คณะเเพทย์", time: "17:00-18:00" },
  { courtId: 2, slot: "18:00-19:00", name: "เบญจวรรณ ทองเคลื่อน", time: "18:00-19:00" },
  { courtId: 3, slot: "15:00-16:00", name: "วรินธร เผ่ามุนี ", time: "15:00-16:00" },
  { courtId: 3, slot: "16:00-17:00", name: "กิตติธัช แพงสุ่ย", time: "16:00-17:00" },
  { courtId: 4, slot: "14:00-15:00", name: "กิตติธัช แพงสุ่ย", time: "14:00-15:00" },
  {
    courtId: 4,
    slot: "15:00-16:00",
    name: "วรินธร เผ่ามุนี ",
    time: "15:00-16:00",
  },
  { courtId: 4, slot: "16:00-17:00", name: "ฐิตาพร เดชาทัย", time: "16:00-17:00" },
  { courtId: 4, slot: "17:00-18:00", name: "ศิริพร แซ่โล่", time: "17:00-18:00" },
  { courtId: 4, slot: "18:00-19:00", name: "ชมรมเเเบดมินตัน คณะเเพทย์", time: "18:00-19:00" },
  { courtId: 4, slot: "19:00-20:00", name: "เบญจวรรณ ทองเคลื่อน", time: "19:00-20:00" },
]);

// ─── Computed ────────────────────────────────────────────
const gridStyle = computed(() => ({
  gridTemplateColumns: `100px repeat(${timeSlots.length}, minmax(100px, 1fr))`,
}));

// ─── Methods ─────────────────────────────────────────────
const menuOpen = ref(false);
const toggleMenu = (): void => {
  menuOpen.value = !menuOpen.value;
};

const formatDateThai = (date: Date): string => {
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const buddhistYear = date.getFullYear() + 543;
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${buddhistYear}`;
};

// ฟังก์ชันแปลง Date ให้เป็นฟอร์แมต YYYY-MM-DD (เพื่อให้ input type="date" อ่านค่าได้)
const formatISODate = (date: Date) => {
  return date.toISOString().split("T")[0];
};

// ฟังก์ชันเมื่อมีการเปลี่ยนวันที่จากปฏิทิน
const onDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.value) {
    currentDate.value = new Date(target.value);
  }
};

const prevDay = (): void => {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() - 1);
  currentDate.value = d;
};

const nextDay = (): void => {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() + 1);
  currentDate.value = d;
};

const getBooking = (courtId: number, slot: string): Booking | undefined => {
  return bookings.value.find((b) => b.courtId === courtId && b.slot === slot);
};

const handleCellClick = (courtId: number, slot: string): void => {
  // Placeholder: open booking modal
  console.log(`Book court ${courtId} at ${slot}`);
};

// เพิ่มตัวแปรเหล่านี้ลงในส่วน Data
const isShowModal = ref(false);
const selectedBooking = ref<any>(null);

// ฟังก์ชันเปิด Modal
const openBookingDetails = (booking: Booking | undefined, courtId: number) => {
  if (!booking) return;

  const court = courts.find((c) => c.id === courtId);
  selectedBooking.value = {
    ...booking,
    courtName: court ? court.name : "",
  };
  isShowModal.value = true;
};

// ฟังก์ชันปิด Modal
const closeModal = () => {
  isShowModal.value = false;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&family=Prompt:wght@400;600;700&display=swap");

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --green-dark: #1b5e20;
  --green-main: #2e7d32;
  --green-mid: #388e3c;
  --green-light: #e8f5e9;
  --teal-footer: #00695c;
}

/*พื้นหลัง*/
.page-wrapper {
  font-family: 'Sarabun', 'Inter', serif;
  min-height: 100vh;
  background-image: url("/src/assets/background.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ─── Navbar ─── */

/* ─── Main ─── */
.main-content {
  flex: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

/* ─── Cards ─── */
.section-card {
  background: white;
  border-radius: 18px;
  box-shadow:
    0 4px 24px rgba(46, 125, 50, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: fadeUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/*กรอบตารางการใช้สนามแบด*/
.header-card {
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 2px solid #a7a7a7; /* เส้นสีเทาบางๆ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* เพิ่มเงาให้กรอบดูมีมิติ */
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-icon {
  font-size: 1.3rem;
}
.section-title h2 {
  font-family: 'Sarabun', 'Inter', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--green-dark);
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 14px;
}
.nav-date-btn {
  padding: 6px 16px;
  border-radius: 8px;
  border: 1.5px solid #c8e6c9;
  background: white;
  color: var(--green-mid);
  font-family: 'Sarabun', 'Inter', serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-date-btn:hover {
  background: #e8f5e9;
  border-color: #81c784;
}
.current-date {
  font-family: 'Sarabun', 'Inter', serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--green-dark);
}

/* ─── Schedule Card ─── */
.schedule-card {
  padding: 20px 24px;
  animation-delay: 0.08s;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(31, 31, 31, 0.4);
}

.schedule-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.schedule-date-label {
  font-family: 'Sarabun', 'Inter', serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: #333;
}

.schedule-nav {
  display: flex;
  gap: 6px;
}
.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1.5px solid #c8e6c9;
  background: white;
  color: var(--green-mid);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: #e8f5e9;
}

/* ─── Grid ─── */
.schedule-grid-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e8f5e9;
}
.schedule-grid {
  display: grid;
  min-width: 900px;
}

.grid-corner {
  background: #ffffff;
  border-right: 1px solid #a7a7a7;
  border-bottom: 1px solid #e8f5e9;
}

.time-header {
  background: #ffffff; /*สีกรอบของเวลาสนาม*/
  padding: 10px 6px;
  text-align: center;
  font-size: 0.8rem; /*ขนาดเวลา*/
  font-weight: 700;
  color: #000000;
  border-right: 1px solid #bcbcbc; /*เส้นระหว่าง*/
  border-bottom: 1px solid #a7a7a7; /*เส้นคั้น*/
}
/*ป้ายชื่อสนาม*/
.court-label {
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 14px;
  font-weight: 700;
  font-size: 0.88rem;
  color: #000000;
  border-right: 1px solid #a7a7a7;
  border-bottom: 1px solid #a7a7a7;
  min-height: 60px;
}
.time-cell {
  border-right: 1px solid #e8f5e9;
  border-bottom: 1px solid #e8f5e9;
  min-height: 60px;
  padding: 4px;
  position: relative;
  transition: background 0.15s;
}
.time-cell.cell-hover:hover {
  background: #f1f8e9;
  cursor: pointer;
}

/* ─── Booking Blocks ─── */
.booking-block {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: default;
  min-height: 50px;
}
.booking-name {
  font-size: 0.7rem;
  font-weight: 700;
}
.booking-time {
  font-size: 0.62rem;
  opacity: 0.75;
}

/* Court Colors */
.court-color-1 {
  background: #c8e6c9;
  border: 2px solid #116910;
  color: #134516;
}
.court-color-2 {
  background: #e1bee7;
  border: 2px solid #460c68;
  color: #4a148c;
}
.court-color-3 {
  background: #c5cae9;
  border: 2px solid rgb(33, 42, 95);
  color: #1a237e;
}
.court-color-4 {
  background: #fff9c4;
  border: 2px solid #54540c;
  color: #3b3b00;
}

/* ─── Legend ─── */
/*กรอบสีประจำสนาม*/
.legend {
  margin-top: 18px; /*เว้นระยะจากตารางด้านบน*/
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px 20px;
  border: 1px solid #919191; /* เส้นสีเทาบางๆ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* เพิ่มเงาให้กรอบดูมีมิติ */
  /*ตัวอักษร "สีประจำสนาม"*/
}
.legend-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #000000;
}
.legend-items {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.82rem;
  color: #333;
}

/*กรอบสีเล็กๆของแต่ละcourt*/
.legend-dot {
  width: 25px;
  height: 19px;
  border-radius: 5px; /*ทำมุมโค้ง*/
}

/* ─── Footer ─── */

/* ─── Background ─── */
.bg-elements {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}
.bg-circle-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #a5d6a7, transparent 70%);
  top: -150px;
  right: -150px;
}
.bg-circle-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #b2dfdb, transparent 70%);
  bottom: 80px;
  left: -80px;
}

/* Modal Overlay - พื้นหลังดำจางๆ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* Modal Content - ตัวกล่องป๊อปอัพ */
.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalPop {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.modal-header h3 {
  font-family: 'Sarabun', 'Inter', serif;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #444444;
  line-height: 1;
}

/* แถวรายละเอียด */
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.detail-icon {
  width: 40px;
  height: 40px;
  background: #f0f7f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.detail-text strong {
  font-size: 1.1rem;
  color: #2e7d32;
}

.detail-text p {
  color: #666;
  font-size: 0.95rem;
  margin-top: 2px;
}

/* คอนเทนเนอร์หลักของปฏิทิน */
.custom-date-container {
  position: relative;
  display: inline-block;
}

.minimal-date-display {
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.minimal-date-display:hover {
  background: rgba(46, 125, 50, 0.1);
}

/* การ์ดปฏิทิน (ถอดแบบจากรูป) */

/* คอนเทนเนอร์หลักต้องไม่โดนตัดขอบ */
.date-picker-wrapper {
  position: relative; /* เพื่อให้ลูกเทียบตำแหน่งได้ */
  z-index: 50; /* ให้อยู่สูงกว่าองค์ประกอบอื่นๆ ใน Card */
}

.calendar-card {
  position: absolute;
  top: calc(100% + 15px); /* ให้ห่างจากตัวหนังสือวันสักนิด */
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2); /* เพิ่มเงาให้ลอยเด่นขึ้นมา */
  overflow: hidden;
  z-index: 9999; /* สำคัญมาก: ให้ลอยทับทุกอย่างบนหน้าจอ */
  border: 1px solid #ddd;
}

.header-card {
  overflow: visible !important; /* ยอมให้ปฏิทินที่อยู่ข้างในลอยออกมานอกกรอบได้ */
  z-index: 10;
}

.calendar-header {
  background: #8e8e8e; /* สีเทาตามรูป image_0bdb5e.png */
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-year {
  font-size: 1.1rem;
  font-family: 'Sarabun', 'Inter', serif;
  /* ภาษาไทย = Sarabun, ภาษาอังกฤษ = Inter */
  color: #000000;

}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: 4px;
  opacity: 0.8;
}

.nav-arrows button {
  background: white;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  margin-left: 6px;
  cursor: pointer;
  color: #333;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 15px;
  text-align: center;
}

.weekday-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 10px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 50%;
  transition: 0.2s;
  color: #333;
}

.day-cell:hover:not(.empty) {
  background: #f0f0f0;
}

/* ไฮไลท์วันที่เลือกเป็นวงกลมสีเทาตามรูป */
.day-cell.is-selected {
  background: #d6d6d6 !important;
  font-weight: bold;
}

.day-cell.empty {
  cursor: default;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .nav-title {
    display: none;
  }
  .main-content {
    padding: 16px 12px;
  }
  .footer {
    flex-direction: column;
  }
}

/*แต่งไอคอนปฎิทินหน้าข้อความตารางการใช้สนาม*/
.title-icon-img {
  width: 24px; /* ปรับขนาดความกว้างตามความเหมาะสม */
  height: 24px; /* ปรับขนาดความสูง */
  object-fit: contain;
  margin-right: 8px; /* เว้นระยะห่างจากตัวหนังสือ */
  vertical-align: middle; /* จัดให้อยู่ตรงกลางบรรทัดเดียวกับข้อความ */
}

</style>
