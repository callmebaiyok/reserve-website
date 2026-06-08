<template>
  <div class="tickets-page">
    <h1>ประวัติการใช้งาน Tickets</h1>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card main">
        <Ticket :size="36" color="white" />
        <div>
          <p class="sum-num">{{ totalTickets }} ใบ</p>
          <p class="sum-label">จำนวน Tickets คงเหลือทั้งหมด</p>
          <p class="sum-sub">จากทุกประเภทสนาม</p>
        </div>
      </div>

      <div class="summary-card clickable" @click="goToHistory('badminton')">
        <img :src="shuttlecockImg" class="sum-icon" alt="badminton" />
        <div>
          <p class="sum-sport-label">แบดมินตัน</p>
          <p class="sum-num-dark">{{ badmintonTickets }} ใบ</p>
          <p class="sum-click-hint">ดูประวัติการได้รับ →</p>
        </div>
      </div>

      <div class="summary-card clickable" @click="goToHistory('football')">
        <img :src="footballImg" class="sum-icon" alt="football" />
        <div>
          <p class="sum-sport-label">ฟุตบอล</p>
          <p class="sum-num-dark">{{ footballTickets }} ใบ</p>
          <p class="sum-click-hint">ดูประวัติการได้รับ →</p>
        </div>
      </div>
    </div>

    <!-- Content + Side Summary -->
    <div class="content-layout">
      <!-- Main Content -->
      <div class="main-content">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="filter-item">
            <label>ประเภทสนาม</label>
            <select v-model="filterSport">
              <option value="all">ทั้งหมด</option>
              <option value="badminton">แบดมินตัน</option>
              <option value="football">ฟุตบอล</option>
            </select>
          </div>
          <div class="filter-item">
            <label>สถานะการใช้งาน</label>
            <select v-model="filterStatus">
              <option value="all">ทั้งหมด</option>
              <option value="used">ใช้งานแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
          <div class="filter-item">
            <label>ช่วงวันที่</label>
            <div class="date-range">
              <input type="date" v-model="dateFrom" />
              <span>›</span>
              <input type="date" v-model="dateTo" />
            </div>
          </div>
          <button class="reset-btn" @click="resetFilter">
            <RotateCcw :size="14" /> ล้างตัวกรอง
          </button>
        </div>

        <!-- Table -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>วันที่ใช้</th>
                <th>ประเภทสนาม</th>
                <th>รายการจอง</th>
                <th>เวลา</th>
                <th>สถานะ</th>
                <th>Ticket</th>
                <th>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedHistory" :key="index">
                <td>{{ item.date }}</td>
                <td>
                  <div class="sport-cell">
                    <img :src="item.sport === 'badminton' ? shuttlecockImg : footballImg" class="sport-mini" alt="" />
                    {{ item.sport === 'badminton' ? 'แบดมินตัน' : 'ฟุตบอล' }}
                  </div>
                </td>
                <td>{{ item.court }}</td>
                <td>{{ item.time }}</td>
                <td>
                  <span :class="['status-badge', item.status]">
                    {{ item.status === 'used' ? 'ใช้งานแล้ว' : 'ยกเลิก' }}
                  </span>
                </td>
                <td :class="item.ticketChange > 0 ? 'ticket-plus' : 'ticket-minus'">
                  {{ item.ticketChange > 0 ? '+' : '' }}{{ item.ticketChange }} ใบ
                </td>
                <td>{{ item.note }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar">
          <div class="items-per-page">
            <span>แสดง</span>
            <select v-model="itemsPerPage" @change="currentPage = 1">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
            </select>
            <span>รายการต่อหน้า</span>
          </div>

          <div class="pagination-info">
            {{ (currentPage - 1) * itemsPerPage + 1 }} -
            {{ Math.min(currentPage * itemsPerPage, filteredHistory.length) }}
            จาก {{ filteredHistory.length }} รายการ
          </div>

          <div class="pagination-controls">
            <button @click="currentPage = 1" :disabled="currentPage === 1">
              <ChevronsLeft :size="14" />
            </button>
            <button @click="currentPage--" :disabled="currentPage === 1">
              <ChevronLeft :size="14" />
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              :class="['page-num-btn', currentPage === p ? 'active' : '']"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button @click="currentPage++" :disabled="currentPage === totalPages">
              <ChevronRight :size="14" />
            </button>
            <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">
              <ChevronsRight :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Side Summary -->
      <div class="side-summary">
        <p class="side-title">สรุปการใช้งาน Tickets</p>
        <div class="side-row"><span>ได้รับ Tickets ทั้งหมด</span><span class="side-val green">7 ใบ</span></div>
        <div class="side-row"><span>ใช้งานไป</span><span class="side-val red">3 ใบ</span></div>
        <div class="side-row"><span>ยกเลิกแล้วคืน</span><span class="side-val blue">2 ใบ</span></div>
        <div class="side-row bold"><span>คงเหลือปัจจุบัน</span><span class="side-val green">2 ใบ</span></div>
        <div class="note-box">
          <p class="note-title">หมายเหตุ</p>
          <ul>
            <li>1 การจอง ใช้ 1 Ticket</li>
            <li>หากยกเลิกการจอง Ticket จะคืนกลับ</li>
            <li>ไม่สามารถแลกเปลี่ยนเป็นเงินได้</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal ประวัติการได้รับ Ticket -->
  <Transition name="fade">
    <div v-if="showHistoryModal" class="modal-overlay" @click="showHistoryModal = false">
      <div class="history-modal" @click.stop>
        <div class="history-modal-header">
          <h2>
            ประวัติการได้รับ Ticket —
            {{ selectedHistorySport === 'badminton' ? 'แบดมินตัน' : 'ฟุตบอล' }}
          </h2>
          <button class="close-x" @click="showHistoryModal = false">
            <X :size="20" />
          </button>
        </div>

        <table class="history-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เหตุผล</th>
              <th>จำนวน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(h, i) in ticketHistory[selectedHistorySport]" :key="i">
              <td>{{ h.date }}</td>
              <td>{{ h.reason }}</td>
              <td :class="h.amount > 0 ? 'ticket-plus' : 'ticket-minus'">
                {{ h.amount > 0 ? '+' : '' }}{{ h.amount }} ใบ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Ticket, RotateCcw, X,
  ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight,
} from 'lucide-vue-next'
import shuttlecockImg from '../assets/shuttlecock.png'
import footballImg from '../assets/football.png'

const badmintonTickets = ref(2)
const footballTickets = ref(0)
const totalTickets = computed(() => badmintonTickets.value + footballTickets.value)

// Modal ประวัติการได้รับ ticket
const showHistoryModal = ref(false)
const selectedHistorySport = ref<'badminton' | 'football'>('badminton')

function goToHistory(sport: 'badminton' | 'football') {
  selectedHistorySport.value = sport
  showHistoryModal.value = true
}

const ticketHistory = {
  badminton: [
    { date: '15/04/2569', reason: 'ระบบยกเลิกการจอง', amount: +1 },
    { date: '10/04/2569', reason: 'ระบบยกเลิกการจอง', amount: +1 },
    { date: '01/04/2569', reason: 'ได้รับ Ticket เริ่มต้น', amount: +5 },
    { date: '23/04/2569', reason: 'ใช้งาน', amount: -1 },
    { date: '18/04/2569', reason: 'ใช้งาน', amount: -1 },
    { date: '03/04/2569', reason: 'ใช้งาน', amount: -1 },
  ],
  football: [
    { date: '01/04/2569', reason: 'ได้รับ Ticket เริ่มต้น', amount: +1 },
    { date: '18/04/2569', reason: 'ใช้งาน', amount: -1 },
  ],
}

// Filter
const filterSport = ref('all')
const filterStatus = ref('all')
const dateFrom = ref('2026-04-01')
const dateTo = ref('2026-04-30')
const currentPage = ref(1)
const itemsPerPage = ref(10)

function resetFilter() {
  filterSport.value = 'all'
  filterStatus.value = 'all'
  dateFrom.value = '2026-04-01'
  dateTo.value = '2026-04-30'
  currentPage.value = 1
}

const history = ref([
  { date: '23/04/2569 14:30', sport: 'badminton', court: 'สนามแบดมินตัน 1', time: '14:00 - 16:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '18/04/2569 19:20', sport: 'football',  court: 'สนามฟุตบอล',       time: '19:00 - 21:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '15/04/2569 14:30', sport: 'badminton', court: 'สนามแบดมินตัน 2', time: '13:00 - 15:00', status: 'cancelled', ticketChange: +1, note: 'ยกเลิกการจอง' },
  { date: '10/04/2569 11:15', sport: 'badminton', court: 'สนามแบดมินตัน 1', time: '11:00 - 12:00', status: 'cancelled', ticketChange: +1, note: 'ยกเลิกการจอง' },
  { date: '03/04/2569 17:40', sport: 'badminton', court: 'สนามแบดมินตัน 3', time: '17:00 - 18:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '01/04/2569 09:00', sport: 'badminton', court: 'สนามแบดมินตัน 1', time: '09:00 - 10:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '28/03/2569 14:00', sport: 'football',  court: 'สนามฟุตบอล',       time: '14:00 - 16:00', status: 'cancelled', ticketChange: +1, note: 'ยกเลิกการจอง' },
  { date: '25/03/2569 16:00', sport: 'badminton', court: 'สนามแบดมินตัน 2', time: '16:00 - 18:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '20/03/2569 10:00', sport: 'football',  court: 'สนามฟุตบอล',       time: '10:00 - 12:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '15/03/2569 13:00', sport: 'badminton', court: 'สนามแบดมินตัน 3', time: '13:00 - 14:00', status: 'cancelled', ticketChange: +1, note: 'ยกเลิกการจอง' },
  { date: '10/03/2569 11:00', sport: 'badminton', court: 'สนามแบดมินตัน 1', time: '11:00 - 13:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
  { date: '05/03/2569 15:00', sport: 'football',  court: 'สนามฟุตบอล',       time: '15:00 - 17:00', status: 'used',      ticketChange: -1, note: 'ใช้ Ticket' },
])

const filteredHistory = computed(() => {
  return history.value.filter(item => {
    if (filterSport.value !== 'all' && item.sport !== filterSport.value) return false
    if (filterStatus.value !== 'all' && item.status !== filterStatus.value) return false
    return true
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredHistory.value.length / itemsPerPage.value))
)

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredHistory.value.slice(start, start + itemsPerPage.value)
})
</script>

<style scoped>
.tickets-page {
  padding: 32px 40px;
}

.tickets-page h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.summary-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 28px;
}
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  flex: 1;
}
.summary-card.main { background: #1b5e20; color: white; }
.summary-card.clickable { cursor: pointer; transition: box-shadow 0.2s, transform 0.2s; }
.summary-card.clickable:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-2px); }
.sum-num { font-size: 24px; font-weight: 800; color: white; }
.sum-num-dark { font-size: 22px; font-weight: 800; color: #1a1a1a; }
.sum-label { font-size: 13px; color: rgba(255,255,255,0.8); }
.sum-sport-label { font-size: 13px; color: #888; }
.sum-sub { font-size: 12px; color: rgba(255,255,255,0.6); }
.sum-click-hint { font-size: 12px; color: #1565c0; margin-top: 4px; }
.sum-icon { width: 40px; height: 40px; object-fit: contain; }

.content-layout { display: flex; gap: 24px; align-items: flex-start; }
.main-content { flex: 1; display: flex; flex-direction: column; gap: 16px; }

.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-item label { font-size: 12px; color: #888; font-weight: 500; }
.filter-item select { border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 14px; cursor: pointer; min-width: 130px; }
.date-range { display: flex; align-items: center; gap: 8px; }
.date-range input { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 13px; }
.reset-btn { display: flex; align-items: center; gap: 6px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 8px 16px; font-size: 13px; cursor: pointer; color: #555; margin-left: auto; }
.reset-btn:hover { background: #eee; }

.table-wrapper { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow-x: auto; min-width: 0; }
table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: auto; }
thead tr { border-bottom: 2px solid #eee; }
th { text-align: left; padding: 12px 16px; font-weight: 600; color: #555; font-size: 13px; white-space: nowrap; }
td { padding: 14px 16px; color: #333; vertical-align: middle; white-space: nowrap; }
tbody tr { border-bottom: 1px solid #f0f0f0; }
tbody tr:hover { background: #fafafa; }
.sport-cell { display: flex; align-items: center; gap: 8px; }
.sport-mini { width: 20px; height: 20px; object-fit: contain; }
.status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.status-badge.used { background: #e8f5e9; color: #2e7d32; }
.status-badge.cancelled { background: #fff3e0; color: #e65100; }
.ticket-plus { color: #2e7d32; font-weight: 700; }
.ticket-minus { color: #e53935; font-weight: 700; }

.pagination-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.items-per-page { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
.items-per-page select { border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; }
.pagination-info { font-size: 13px; color: #555; }
.pagination-controls { display: flex; align-items: center; gap: 4px; }
.pagination-controls button { background: none; border: 1px solid #ddd; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.pagination-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.page-num-btn { background: none; border: 1px solid #ddd; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.page-num-btn.active { background: #1565c0 !important; color: white !important; border-color: #1565c0 !important; }
.page-num-btn:hover { background: #f0f0f0; }

.side-summary {
  width: 220px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.side-title { font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
.side-row { display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-bottom: 8px; }
.side-row.bold { font-weight: 700; color: #1a1a1a; border-top: 1px solid #eee; padding-top: 8px; }
.side-val { font-weight: 700; }
.green { color: #2e7d32; }
.red { color: #e53935; }
.blue { color: #1565c0; }
.note-box { background: #f9f9f9; border-radius: 8px; padding: 10px 12px; margin-top: 12px; }
.note-title { font-size: 12px; font-weight: 700; color: #555; margin-bottom: 6px; }
.note-box ul { padding-left: 16px; }
.note-box li { font-size: 11px; color: #777; line-height: 1.8; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.history-modal { background: white; border-radius: 16px; padding: 28px; width: 560px; max-width: 95vw; box-shadow: 0 8px 40px rgba(0,0,0,0.2); }
.history-modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.history-modal-header h2 { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.close-x { background: none; border: none; cursor: pointer; color: #555; }
.history-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.history-table th { text-align: left; padding: 10px 14px; font-weight: 600; color: #555; border-bottom: 2px solid #eee; }
.history-table td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>