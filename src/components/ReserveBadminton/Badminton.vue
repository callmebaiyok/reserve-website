<template>
  <div class="reserve-page">
    <!-- Left Panel -->
    <div class="left-panel">
      <h1>จองสนาม</h1>
      <p class="subtitle">เลือกวันที่และช่วงเวลา</p>

      <div class="info-card">
        <p class="card-label">จองวันที่</p>
        <p class="card-sub">สามารถจองได้เฉพาะวันนี้เท่านั้น</p>
        <button class="date-btn" :style="{ backgroundColor: todayColor }">
          <CalendarDays :size="16" />
          {{ todayFormatted }}
        </button>
        <p class="card-sub">ไม่สามารถจองล่วงหน้าได้</p>
      </div>

      <div class="info-card">
        <p class="card-label">ข้อมูลผู้ใช้งาน</p>
        <div class="user-row"><User :size="16" /><span>Suwanon Choojan</span></div>
        <div class="user-row"><MonitorSmartphone :size="16" /><span>IT</span></div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="sport-tabs">
        <button
          :class="['tab-btn', selectedSport === 'badminton' ? 'active' : '']"
          @click="switchSport('badminton')"
        >
          <Feather :size="20" /><span>แบดมินตัน</span>
        </button>
        <button
          :class="['tab-btn', selectedSport === 'football' ? 'active' : '']"
          @click="switchSport('football')"
        >
          <CircleDot :size="20" /><span>ฟุตบอล</span>
        </button>
      </div>

      <div class="courts-list">
        <div v-for="court in currentCourts" :key="court.name" class="court-card">
          <h3>{{ court.name }}</h3>
          <div class="time-slots">
            <button
              v-for="slot in timeSlots"
              :key="slot"
              :class="[
                'slot-btn',
                isSelected(court.name, slot) ? 'selected' : '',
                isBooked(court.name, slot) ? 'booked' : ''
              ]"
              @click="toggleSlot(court.name, slot)"
            >
              <span v-if="isBooked(court.name, slot)" class="booked-text">จองแล้ว</span>
              <span v-else>{{ slot }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="confirm-row">
        <button class="confirm-btn" @click="openConfirmModal">
          ยืนยัน <ArrowRight :size="18" />
        </button>
      </div>
    </div>
  </div>

  <!-- Alert Modal -->
  <Transition name="fade">
    <div v-if="alertMsg" class="modal-overlay" @click="alertMsg = ''">
      <div class="modal-box" @click.stop>
        <div class="modal-icon"><AlertCircle :size="40" color="#e65100" /></div>
        <p class="modal-msg">{{ alertMsg }}</p>
        <button class="modal-close-btn" @click="alertMsg = ''">ตกลง</button>
      </div>
    </div>
  </Transition>

  <!-- Reservation Confirm Modal -->
  <Transition name="fade">
    <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
      <div class="confirm-modal" @click.stop>
        <button class="close-x" @click="showConfirm = false">
          <X :size="20" />
        </button>
        <div class="confirm-body">
          <div class="detail-section">
            <h2>รายละเอียดการจอง</h2>
            <div class="detail-row">
              <CalendarDays :size="20" color="#555" />
              <div>
                <p class="detail-label">วันที่ :</p>
                <p class="detail-value">{{ todayFormatted }}</p>
              </div>
            </div>
            <div class="detail-row">
              <Clock :size="20" color="#555" />
              <div>
                <p class="detail-label">ระยะเวลา :</p>
                <p class="detail-value">
                  {{ selectedSlots.length }} ชั่วโมง ({{ slotRangeText }})
                </p>
              </div>
            </div>
            <div class="detail-row">
              <MapPin :size="20" color="#555" />
              <div>
                <p class="detail-label">สถานที่ :</p>
                <p class="detail-value">{{ selectedSlots[0]?.court }}</p>
              </div>
            </div>
            <hr class="divider" />
            <p class="booked-by">จองโดย :</p>
            <p class="booked-name">suwanon choojan (IT)</p>
          </div>

          <div class="payment-section">
            <p class="payment-title">สรุปการชำระเงิน</p>
            <img
              :src="selectedSport === 'badminton' ? shuttlecockImg : footballImg"
              class="sport-icon-img"
              alt="sport"
            />
            <p class="total-price">{{ totalPrice }} บาท</p>

            <div class="payment-options">
              <label :class="['option-row', userTickets === 0 ? 'disabled' : '', payMethod === 'ticket' ? 'option-active' : '']">
                <input
                  type="radio"
                  value="ticket"
                  v-model="payMethod"
                  :disabled="userTickets === 0"
                />
                <div class="option-detail">
                  <span class="option-title">ใช้ Ticket ที่มีอยู่</span>
                  <span class="ticket-remain">
                    คงเหลือ :
                    <strong :class="userTickets === 0 ? 'red' : 'green'">{{ userTickets }} ใบ</strong>
                    <span v-if="payMethod === 'ticket'" class="ticket-deduct">
                      → ใช้ {{ ticketsNeeded }} ใบ → เหลือ {{ userTickets - ticketsNeeded }} ใบ
                    </span>
                  </span>
                </div>
                <span class="option-price">0 บาท</span>
              </label>

              <div class="or-divider">หรือ</div>

              <label :class="['option-row', payMethod === 'qr' ? 'option-active' : '']">
                <input type="radio" value="qr" v-model="payMethod" />
                <div class="option-detail">
                  <span class="option-title">ชำระเงินปกติ (QR Code)</span>
                </div>
                <span class="option-price">{{ totalPrice }} บาท</span>
              </label>
            </div>

            <button class="pay-btn" @click="handlePay">
              ยืนยันและชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  CalendarDays, User, MonitorSmartphone,
  Feather, CircleDot, ArrowRight,
  AlertCircle, X, Clock, MapPin
} from 'lucide-vue-next'
import shuttlecockImg from '../../assets/shuttlecock.png'
import footballImg from '../../assets/football.png'

const route = useRoute()

// ===== วันที่ =====
const todayDay = computed(() => new Date().getDay())
const todayFormatted = computed(() =>
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

// ===== Sport — รับจาก query param =====
const selectedSport = ref<string>(
  (route.query.sport as string) || 'badminton'
)

const badmintonCourts = [
  { name: 'สนามแบดมินตัน A' },
  { name: 'สนามแบดมินตัน B' },
  { name: 'สนามแบดมินตัน C' },
  { name: 'สนามแบดมินตัน D' },
]
const footballCourts = [
  { name: 'สนามฟุตบอล A' },
  { name: 'สนามฟุตบอล B' },
]
const currentCourts = computed(() =>
  selectedSport.value === 'badminton' ? badmintonCourts : footballCourts
)
const timeSlots = [
  '14.00 - 15.00', '15.00 - 16.00', '16.00 - 17.00', '17.00 - 18.00',
  '18.00 - 19.00', '19.00 - 20.00', '20.00 - 21.00', '21.00 - 22.00',
]

const bookedSlots = ref<{ court: string; slot: string }[]>([
  { court: 'สนามแบดมินตัน A', slot: '14.00 - 15.00' },
  { court: 'สนามแบดมินตัน A', slot: '15.00 - 16.00' },
  { court: 'สนามแบดมินตัน B', slot: '16.00 - 17.00' },
  { court: 'สนามฟุตบอล A',    slot: '18.00 - 19.00' },
  { court: 'สนามฟุตบอล A',    slot: '19.00 - 20.00' },
])

function isBooked(court: string, slot: string): boolean {
  return bookedSlots.value.some(s => s.court === court && s.slot === slot)
}

const selectedSlots = ref<{ court: string; slot: string }[]>([])
const alertMsg = ref('')

function switchSport(sport: string) {
  selectedSport.value = sport
  selectedSlots.value = []
  alertMsg.value = ''
}

function isSelected(court: string, slot: string) {
  return selectedSlots.value.some(s => s.court === court && s.slot === slot)
}

function slotToHour(slot: string): number {
  return parseInt(slot.split('.')[0].trim())
}

function toggleSlot(court: string, slot: string) {
  alertMsg.value = ''
  if (isBooked(court, slot)) {
    alertMsg.value = 'เวลานี้มีผู้จองแล้ว กรุณาเลือกเวลาอื่น'
    return
  }
  const index = selectedSlots.value.findIndex(s => s.court === court && s.slot === slot)
  if (index >= 0) {
    selectedSlots.value.splice(index, 1)
    return
  }
  if (selectedSlots.value.length >= 2) {
    alertMsg.value = 'จองได้สูงสุด 2 ชั่วโมงเท่านั้น'
    return
  }
  if (selectedSlots.value.length === 1) {
    const existing = selectedSlots.value[0]
    if (existing.court !== court) {
      alertMsg.value = 'กรุณาเลือกเวลาในสนามเดียวกันเท่านั้น'
      return
    }
    if (Math.abs(slotToHour(slot) - slotToHour(existing.slot)) !== 1) {
      alertMsg.value = 'กรุณาเลือกเวลาที่ติดกัน เช่น 14.00-15.00 และ 15.00-16.00'
      return
    }
  }
  selectedSlots.value.push({ court, slot })
}

const slotRangeText = computed(() => {
  if (selectedSlots.value.length === 0) return ''
  const hours = selectedSlots.value.map(s => slotToHour(s.slot)).sort((a, b) => a - b)
  return `${hours[0]}.00 - ${hours[hours.length - 1] + 1}.00`
})

const pricePerHour = computed(() => selectedSport.value === 'badminton' ? 100 : 400)
const totalPrice = computed(() => selectedSlots.value.length * pricePerHour.value)

const userTickets = ref(7)
const ticketsNeeded = computed(() => selectedSlots.value.length)
const payMethod = ref<'ticket' | 'qr'>('qr')
const showConfirm = ref(false)

function openConfirmModal() {
  alertMsg.value = ''
  if (selectedSlots.value.length === 0) {
    alertMsg.value = 'กรุณาเลือกเวลาที่ต้องการ'
    return
  }
  payMethod.value = userTickets.value > 0 ? 'ticket' : 'qr'
  showConfirm.value = true
}

function handlePay() {
  if (payMethod.value === 'ticket') {
    userTickets.value -= ticketsNeeded.value
    alert(`ชำระด้วย Ticket สำเร็จ!\nใช้ ${ticketsNeeded.value} ใบ | เหลือ ${userTickets.value} ใบ`)
  } else {
    alert(`ชำระเงิน ${totalPrice.value} บาท ผ่าน QR Code สำเร็จ!`)
  }
  showConfirm.value = false
  selectedSlots.value = []
}
</script>

<style scoped>
.reserve-page {
  display: flex;
  gap: 32px;
  padding: 32px 40px;
  min-height: calc(100vh - 80px);
}

.left-panel { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 20px; }
.left-panel h1 { font-size: 32px; font-weight: 700; color: #1a1a1a; }
.subtitle { font-size: 14px; color: #888; margin-top: -12px; }
.info-card { background: white; border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.card-label { font-weight: 700; font-size: 15px; color: #1a1a1a; }
.card-sub { font-size: 13px; color: #888; }
.date-btn { display: flex; align-items: center; gap: 8px; color: white; border: none; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: default; width: fit-content; }
.user-row { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #333; }

.right-panel { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.sport-tabs { display: flex; justify-content: center; gap: 60px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
.tab-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 500; color: #aaa; padding: 8px 24px; border-bottom: 3px solid transparent; transition: all 0.2s; }
.tab-btn.active { color: #1b5e20; border-bottom: 3px solid #1b5e20; }
.courts-list { display: flex; flex-direction: column; gap: 16px; }
.court-card { background: white; border-radius: 12px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.court-card h3 { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 14px; }
.time-slots { display: flex; flex-wrap: wrap; gap: 10px; }

.slot-btn { border: 1.5px solid #2e7d32; background: white; color: #2e7d32; border-radius: 20px; padding: 6px 16px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-weight: 500; min-width: 110px; text-align: center; }
.slot-btn:hover { background: #e8f5e9; }
.slot-btn.selected { background: #2e7d32; color: white; }
.slot-btn.booked { border: 1.5px solid #e0e0e0; background: #f5f5f5; color: #bdbdbd; cursor: not-allowed; }
.slot-btn.booked:hover { background: #f5f5f5; }
.booked-text { font-size: 12px; color: #bdbdbd; font-weight: 500; }

.confirm-row { display: flex; justify-content: flex-end; }
.confirm-btn { display: flex; align-items: center; gap: 10px; background: #1b5e20; color: white; border: none; border-radius: 8px; padding: 12px 28px; font-size: 15px; font-weight: 700; cursor: pointer; letter-spacing: 1px; transition: background 0.2s; }
.confirm-btn:hover { background: #2e7d32; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; border-radius: 16px; padding: 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 16px; min-width: 320px; max-width: 400px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-align: center; }
.modal-icon { background: #fff3e0; border-radius: 50%; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }
.modal-msg { font-size: 16px; font-weight: 500; color: #333; line-height: 1.6; }
.modal-close-btn { background: #1b5e20; color: white; border: none; border-radius: 8px; padding: 10px 32px; font-size: 15px; font-weight: 600; cursor: pointer; }

.confirm-modal { background: white; border-radius: 16px; padding: 32px; width: 720px; max-width: 95vw; position: relative; box-shadow: 0 8px 40px rgba(0,0,0,0.2); }
.close-x { position: absolute; top: 16px; right: 16px; background: none; border: none; cursor: pointer; color: #555; }
.confirm-body { display: flex; gap: 32px; }
.detail-section { flex: 1; display: flex; flex-direction: column; gap: 16px; }
.detail-section h2 { font-size: 20px; font-weight: 700; color: #1a1a1a; }
.detail-row { display: flex; align-items: flex-start; gap: 12px; }
.detail-label { font-size: 13px; color: #888; margin-bottom: 2px; }
.detail-value { font-size: 15px; font-weight: 500; color: #1a1a1a; }
.divider { border: none; border-top: 1px solid #eee; margin: 4px 0; }
.booked-by { font-size: 13px; color: #888; }
.booked-name { font-size: 15px; font-weight: 600; color: #1a1a1a; }

.payment-section { width: 240px; background: #f9fff9; border: 1px solid #e0f0e0; border-radius: 12px; padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.payment-title { font-size: 15px; font-weight: 700; color: #1b5e20; }
.sport-icon-img { width: 64px; height: 64px; object-fit: contain; }
.total-price { font-size: 28px; font-weight: 800; color: #e53935; }
.payment-options { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.option-row { display: flex; align-items: center; gap: 8px; border: 1.5px solid #ddd; border-radius: 10px; padding: 10px 12px; cursor: pointer; transition: all 0.2s; width: 100%; }
.option-row input[type="radio"] { accent-color: #1b5e20; width: 16px; height: 16px; flex-shrink: 0; }
.option-active { border-color: #1b5e20; background: #f0faf0; }
.option-detail { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.option-title { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.option-price { font-size: 13px; font-weight: 700; color: #1b5e20; white-space: nowrap; }
.disabled { opacity: 0.4; cursor: not-allowed; }
.ticket-remain { font-size: 11px; color: #666; }
.ticket-deduct { color: #943331; font-weight: 600; }
.green { color: #2e7d32; }
.red { color: #e53935; }
.or-divider { text-align: center; font-size: 13px; color: #aaa; }
.pay-btn { width: 100%; background: #1b5e20; color: white; border: none; border-radius: 8px; padding: 12px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px; transition: background 0.2s; margin-top: 4px; }
.pay-btn:hover { background: #2e7d32; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>