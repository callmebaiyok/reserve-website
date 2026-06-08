<template>
  <div class="reserve-wrap">
    <div class="main-content">
      <!-- Left Column -->
      <div class="left-col">
        <div class="page-title">
          <h1>จองสนาม</h1>
          <p class="sub">เลือกวันที่และช่วงเวลา</p>
        </div>

        <div class="info-card">
          <h3>จองวันที่</h3>
          <p class="note">สามารถจองได้เฉพาะวันนี้เท่านั้น</p>
          <button class="date-btn" :style="{ backgroundColor: todayColor }">
          <CalendarDays :size="16" />
          {{ formattedDate }}
           </button>
          <p class="note muted">ไม่สามารถจองล่วงหน้าได้</p>
        </div>

        <div class="info-card">
        <p class="card-label">ข้อมูลผู้ใช้งาน</p>
        <div class="user-row"><User :size="16" /><span>Suwanon Choojan</span></div>
        <div class="user-row"><MonitorSmartphone :size="16" /><span>IT</span></div>
      </div>
      </div>

      <!-- Right Column -->
      <div class="right-col">
        <div class="right-header">
         
        </div>

        <div class="sport-cards">
          <div class="sport-card" @click="router.push('/badminton?sport=badminton')">
            <div class="sport-top">
              <span class="sport-emoji">🏸</span>
              <p class="sport-name">แบดมินตัน</p>
              <p class="sport-price">100 บาท / ชั่วโมง</p>
            </div>
            <div class="sport-img-wrap">
              <img :src="badmintonImg" alt="Badminton" class="sport-img" />
            </div>
            <div class="sport-booking"><span>จอง</span></div>
          </div>

          <div class="sport-card" @click="router.push('/badminton?sport=football')">
            <div class="sport-top">
              <span class="sport-emoji">⚽</span>
              <p class="sport-name">ฟุตบอล</p>
              <p class="sport-price">400 บาท / ชั่วโมง</p>
            </div>
            <div class="sport-img-wrap">
              <img :src="footballImg" alt="Football" class="sport-img" />
            </div>
            <div class="sport-booking"><span>จอง</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import badmintonImg from '../assets/shuttlecock.png'
import footballImg from '../assets/Football.png'
import { useRouter } from 'vue-router'
import {CalendarDays, User, MonitorSmartphone} from 'lucide-vue-next'

const router = useRouter()
const userName = 'Suwanon Choojan'
const userDept = 'IT'

const todayDay = computed(() => new Date().getDay())
const formattedDate = computed(() =>
  new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)
const dayColors: Record<number, string> = {
  0: '#EF5350',
  1: '#FFB300',
  2: '#E91E63',
  3: '#4CAF50',
  4: '#FF7043',
  5: '#42A5F5',
  6: '#AB47BC',
}
const todayColor = computed(() => dayColors[todayDay.value])

const selectSport = (sport: string) => {
  router.push(`/reserve/${sport}`)
}
</script>

<style scoped>

/* กล่องหลัก */
.reserve-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* กล่องเนื้อหา */
.main-content {
  display: flex;
  flex-direction: row;
  gap: 70px;
  padding: 24px 60px;
  align-items: center;
  width: 100%;
  max-width: 1200px;
}

/* ฝั่งซ้าย */
.left-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 300px;
  max-width: 320px;
}

/* หัวข้อ */
.page-title h1 {
  font-size: 40px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0;
}

/* คำอธิบาย */
.page-title .sub {
  font-size: 13px;
  color: #555;
  margin-top: 2px;
  font-weight: 600;
}

/* กล่องข้อมูล */
.info-card {
  background: white;
  border-radius: 20px;
  padding: 15px 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* หัวข้อในกล่อง */
.info-card h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
}

/* ข้อความทั่วไป */
.note {
  font-size: 15px;
  color: #555;
  margin: 0;
}

/* ข้อความสีอ่อน */
.note.muted {
  color: #999;
}

/* ป้ายวันที่ */
.date-btn {
  display: flex; align-items: center; gap: 8px; color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: default; width: fit-content;
}

/* ข้อมูลผู้ใช้ */
.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

/* ฝั่งขวา */
.right-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* กล่องการ์ดกีฬา */
.sport-cards {
  display: flex;
  flex-direction: row;
  gap: 60px;
  justify-content: center;
}

/* การ์ดกีฬา */
.sport-card {
  background: white;
  border-radius: 30px;
  width: 185px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

/* effect hover */
.sport-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
}

/* ส่วนบนการ์ด */
.sport-top {
  padding: 12px 12px 6px;
  text-align: center;
}

/* emoji */
.sport-emoji {
  font-size: 30px;
}

/* ชื่อกีฬา */
.sport-name {
  font-weight: 800;
  font-size: 20px;
  margin: 4px 0 2px;
  color: #1a1a1a;
}

/* ราคา */
.sport-price {
  font-size: 16px;
  color: #555;
  margin: 0;
}

/* กล่องรูป */
.sport-img-wrap {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

/* รูป */
.sport-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ปุ่มจอง */
.sport-booking {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  font-weight: 700;
  font-size: 17px;
  color: #1a1a1a;
  border-top: 1px solid #f0f0f0;
}
</style>