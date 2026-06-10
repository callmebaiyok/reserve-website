<template>
  <div class="admin-page">
    <h1>ประวัติการคืน Tickets ให้ผู้แก่ใช้งาน</h1>

    <div class="main-layout">
      <!-- LEFT -->
      <div class="left-section">

        <!-- Section 1 -->
        <div class="section-card">
          <h2>1. ประวัติการคืน Tickets</h2>

          <div class="filter-bar">
            <div class="filter-item">
              <label>ช่วงวันที่</label>
              <div class="date-range">
                <input type="date" v-model="dateFrom" />
                <span>›</span>
                <input type="date" v-model="dateTo" />
              </div>
            </div>
            <div class="filter-item">
              <label>ประเภทสนาม</label>
              <select v-model="filterSport">
                <option value="cancelled_admin">ยกเลิก (โดย Admin)</option>
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
            <div class="filter-item search">
              <label>ค้นหา</label>
              <input
                type="text"
                v-model="searchText"
                placeholder="ค้นหาจากชื่อผู้ใช้, สนาม, หมายเลขการจอง"
              />
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>เลือก</th>
                  <th>รหัสการจอง</th>
                  <th>วันที่ใช้</th>
                  <th>ชื่อผู้ใช้งาน</th>
                  <th>ประเภทสนาม</th>
                  <th>สนาม</th>
                  <th>วันที่ใช้งาน</th>
                  <th>เวลา</th>
                  <th>สาเหตุการยกเลิก</th>
                  <th>สถานะ</th>
                  <th>การใช้ Ticket</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in paginatedItems"
                  :key="item.id"
                  :class="{ selected: selectedItem?.id === item.id }"
                  @click="selectItem(item)"
                >
                  <td>
                    <input
                      type="radio"
                      :value="item.id"
                      v-model="selectedId"
                      @change="selectItem(item)"
                    />
                  </td>
                  <td>{{ item.id }}</td>
                  <td>{{ item.bookDate }}</td>
                  <td>{{ item.userName }}</td>
                  <td>
                    <div class="sport-cell">
                      <img
                        :src="item.sport === 'football' ? footballImg : shuttlecockImg"
                        class="sport-mini"
                        alt=""
                      />
                      {{ item.sport === 'football' ? 'ฟุตบอล' : 'แบดมินตัน' }}
                    </div>
                  </td>
                  <td>{{ item.court }}</td>
                  <td>{{ item.useDate }}</td>
                  <td>{{ item.time }}</td>
                  <td>{{ item.cancelReason }}</td>
                  <td>
                    <span class="status-badge cancelled-admin">ยกเลิกโดย Admin</span>
                  </td>
                  <td>{{ item.useTicket ? 'ใช้ Ticket' : 'ไม่ใช้ Ticket' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar">
            <div class="items-per-page">
              <span>แสดง</span>
              <select v-model="itemsPerPage" @change="currentPage = 1">
                <option :value="10">10</option>
                <option :value="20">20</option>
              </select>
              <span>รายการต่อหน้า</span>
            </div>
            <div class="pagination-info">
              {{ (currentPage - 1) * itemsPerPage + 1 }} -
              {{ Math.min(currentPage * itemsPerPage, filteredItems.length) }}
              จาก {{ filteredItems.length }} รายการ
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
                :class="['page-btn', currentPage === p ? 'active' : '']"
                @click="currentPage = p"
              >{{ p }}</button>
              <button @click="currentPage++" :disabled="currentPage === totalPages">
                <ChevronRight :size="14" />
              </button>
              <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                <ChevronsRight :size="14" />
              </button>
            </div>
          </div>
        </div>

        <!-- Section 2 -->
        <!--<div class="section-card" v-if="selectedItem">
          <h2>2. รายละเอียดการคืน Tickets</h2>
          <div class="detail-layout">
            <div class="detail-info">
              <h3>ข้อมูลการจอง</h3>
              <div class="info-row"><span>รหัสการจอง</span><span>: {{ selectedItem.id }}</span></div>
              <div class="info-row"><span>ผู้ใช้งาน</span><span>: {{ selectedItem.userName }}</span></div>
              <div class="info-row"><span>ประเภทสนาม</span><span>: {{ selectedItem.sport === 'football' ? 'ฟุตบอล' : 'แบดมินตัน' }}</span></div>
              <div class="info-row"><span>สนาม</span><span>: {{ selectedItem.court }}</span></div>
              <div class="info-row"><span>วันที่ใช้งาน</span><span>: {{ selectedItem.useDate }}</span></div>
              <div class="info-row"><span>เวลา</span><span>: {{ selectedItem.time }}</span></div>
              <div class="info-row"><span>สถานะการจอง</span><span>: ยกเลิกโดย Admin</span></div>
              <div class="info-row"><span>การใช้ Ticket</span><span>: {{ selectedItem.useTicket ? 'ใช้ Ticket' : 'ไม่ใช้ Ticket' }}</span></div>
            </div>

            <div class="return-form">
              <h3>คืน Tickets ให้ผู้ใช้งาน</h3>
              <div class="form-row">
                <div class="form-item">
                  <label>ประเภทสนาม</label>
                  <select v-model="returnSport">
                    <option value="football">ฟุตบอล</option>
                    <option value="badminton">แบดมินตัน</option>
                  </select>
                </div>
                <div class="form-item">
                  <label>จำนวน Tickets ที่จะคืน</label>
                  <input type="number" v-model="returnCount" min="1" max="10" />
                </div>
              </div>
              <div class="form-item full">
                <label>เหตุผลการคืน</label>
                <select v-model="returnReason">
                  <option value="ปิดสนาม (ก่อสร้างเร่งด่วน)">ปิดสนาม (ก่อสร้างเร่งด่วน)</option>
                  <option value="สนามชำรุด">สนามชำรุด</option>
                  <option value="เหตุสุดวิสัย">เหตุสุดวิสัย</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div class="form-item full">
                <label>หมายเหตุ (ไม่บังคับ)</label>
                <input type="text" v-model="returnNote" placeholder="ขออภัยในความไม่สะดวก" />
              </div>
              <div class="form-actions">
                <button class="btn-cancel" @click="clearForm">ยกเลิก</button>
                <button class="btn-confirm" @click="confirmReturn">ยืนยัน</button>
              </div>
            </div>
          </div>
        </div> -->
      

        <!-- hint ถ้ายังไม่เลือก -->
        
        <!--<div v-else class="select-hint">
          👆 คลิกเลือกรายการด้านบนเพื่อดูรายละเอียดการคืน Ticket
        </div>-->

      </div>
    

      <!-- RIGHT -->
      <div class="right-section">
        <div class="summary-card">
          <h3>สรุปการคืน Tickets วันนี้</h3>
          <div class="summary-total">
            <img :src="shuttlecockImg" class="sum-icon" alt="" />
            <div>
              <p class="sum-num">{{ todaySummary.total }} ใบ</p>
              <p class="sum-label">รวมทั้งหมด</p>
            </div>
          </div>
          <hr />
          <p class="sum-subtitle">แยกตามประเภทสนาม</p>
          <div class="sum-row"><span>ฟุตบอล</span><span class="sum-val">{{ todaySummary.football }} ใบ</span></div>
          <div class="sum-row"><span>แบดมินตัน</span><span class="sum-val">{{ todaySummary.badminton }} ใบ</span></div>
          <div class="sum-row"><span>ห้องซ้อมปิงปอง</span><span class="sum-val">{{ todaySummary.pingpong }} ใบ</span></div>
          <div class="sum-row"><span>บาสเกตบอล</span><span class="sum-val">{{ todaySummary.basketball }} ใบ</span></div>
        </div>

        <div class="summary-card">
          <h3>รายการล่าสุด</h3>
          <div class="recent-list">
            <div v-for="(r, i) in recentReturns" :key="i" class="recent-item">
              <p class="recent-date">{{ r.date }}</p>
              <p class="recent-detail">คืนให้: {{ r.user }}</p>
              <p class="recent-detail">{{ r.sport }} {{ r.amount }} ใบ</p>
            </div>
          </div>
          <button class="see-all-btn">ดูทั้งหมด</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm Modal -->
  <Transition name="fade">
    <div v-if="showConfirm" class="modal-overlay" @click="showConfirm = false">
      <div class="modal-box" @click.stop>
        <CheckCircle :size="48" color="#2e7d32" />
        <h3>ยืนยันการคืน Ticket</h3>
        <p>คืน <strong>{{ returnCount }} ใบ</strong> ให้ <strong>{{ selectedItem?.userName }}</strong></p>
        <p class="modal-sub">ประเภท: {{ returnSport === 'football' ? 'ฟุตบอล' : 'แบดมินตัน' }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showConfirm = false">ยกเลิก</button>
          <button class="btn-confirm" @click="doReturn">ยืนยัน</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle
} from 'lucide-vue-next'
import shuttlecockImg from '../assets/shuttlecock.png'
import footballImg from '../assets/football.png'

const dateFrom = ref('2026-04-01')
const dateTo = ref('2026-04-30')
const filterSport = ref('cancelled_admin')
const filterStatus = ref('all')
const searchText = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

interface Reservation {
  id: string
  bookDate: string
  userName: string
  sport: string
  court: string
  useDate: string
  time: string
  cancelReason: string
  useTicket: boolean
}

const reservations = ref<Reservation[]>([
  { id: 'RES-202604-00123', bookDate: '20/04/2026', userName: 'Suwanon Choojan (IT)',    sport: 'football',  court: 'Football Arena',  useDate: '23/04/2026', time: '14:00 - 16:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: true  },
  { id: 'RES-202604-00111', bookDate: '18/04/2026', userName: 'Kitipong Saechan (MED)', sport: 'badminton', court: 'Badminton Court1', useDate: '24/04/2026', time: '16:00 - 17:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: false },
  { id: 'RES-202604-00098', bookDate: '14/04/2026', userName: 'Suwanon Choojan (IT)',    sport: 'football',  court: 'Football Arena',  useDate: '19/04/2026', time: '17:00 - 18:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: true  },
  { id: 'RES-202604-00077', bookDate: '10/04/2026', userName: 'Wupaeat P. (IT)',         sport: 'badminton', court: 'Badminton Court1', useDate: '18/04/2026', time: '10:00 - 11:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: false },
  { id: 'RES-202604-00065', bookDate: '08/04/2026', userName: 'Somchai K. (IT)',         sport: 'badminton', court: 'Badminton Court2', useDate: '15/04/2026', time: '14:00 - 15:00', cancelReason: 'สนามชำรุด',                    useTicket: true  },
  { id: 'RES-202604-00054', bookDate: '05/04/2026', userName: 'Malee S. (MED)',          sport: 'football',  court: 'Football Arena',  useDate: '12/04/2026', time: '18:00 - 20:00', cancelReason: 'เหตุสุดวิสัย',                  useTicket: false },
  { id: 'RES-202604-00043', bookDate: '03/04/2026', userName: 'Prawit T. (IT)',          sport: 'badminton', court: 'Badminton Court3', useDate: '10/04/2026', time: '15:00 - 16:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: true  },
  { id: 'RES-202604-00032', bookDate: '01/04/2026', userName: 'Siriporn W. (MED)',       sport: 'football',  court: 'Football Arena',  useDate: '08/04/2026', time: '16:00 - 18:00', cancelReason: 'สนามชำรุด',                    useTicket: true  },
  { id: 'RES-202604-00021', bookDate: '28/03/2026', userName: 'Nattapong A. (IT)',       sport: 'badminton', court: 'Badminton Court1', useDate: '05/04/2026', time: '17:00 - 18:00', cancelReason: 'เหตุสุดวิสัย',                  useTicket: false },
  { id: 'RES-202604-00010', bookDate: '25/03/2026', userName: 'Kanokwan P. (MED)',       sport: 'badminton', court: 'Badminton Court2', useDate: '02/04/2026', time: '14:00 - 16:00', cancelReason: 'ปิดสนาม (ก่อสร้างเร่งด่วน)', useTicket: true  },
  { id: 'RES-202603-00099', bookDate: '22/03/2026', userName: 'Suwanon Choojan (IT)',    sport: 'football',  court: 'Football Arena',  useDate: '29/03/2026', time: '19:00 - 21:00', cancelReason: 'สนามชำรุด',                    useTicket: false },
  { id: 'RES-202603-00088', bookDate: '20/03/2026', userName: 'Kitipong Saechan (MED)', sport: 'badminton', court: 'Badminton Court3', useDate: '27/03/2026', time: '15:00 - 17:00', cancelReason: 'เหตุสุดวิสัย',                  useTicket: true  },
])

const filteredItems = computed(() =>
  reservations.value.filter(item => {
    if (searchText.value) {
      const q = searchText.value.toLowerCase()
      if (!item.userName.toLowerCase().includes(q) &&
          !item.court.toLowerCase().includes(q) &&
          !item.id.toLowerCase().includes(q)) return false
    }
    return true
  })
)

// ✅ totalPages คำนวณจากข้อมูลจริง
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage.value))
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredItems.value.slice(start, start + itemsPerPage.value)
})

const selectedId = ref('')
const selectedItem = ref<Reservation | null>(null)

function selectItem(item: Reservation) {
  selectedItem.value = item
  selectedId.value = item.id
  returnSport.value = item.sport
  returnCount.value = 1
}

const returnSport = ref('football')
const returnCount = ref(1)
const returnReason = ref('ปิดสนาม (ก่อสร้างเร่งด่วน)')
const returnNote = ref('')
const showConfirm = ref(false)

function clearForm() {
  selectedItem.value = null
  selectedId.value = ''
  returnNote.value = ''
}

function confirmReturn() {
  showConfirm.value = true
}

function doReturn() {
  recentReturns.value.unshift({
    date: new Date().toLocaleDateString('th-TH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    user: selectedItem.value?.userName || '',
    sport: returnSport.value === 'football' ? 'ฟุตบอล' : 'แบดมินตัน',
    amount: returnCount.value,
  })
  if (returnSport.value === 'football') {
    todaySummary.value.football += returnCount.value
  } else {
    todaySummary.value.badminton += returnCount.value
  }
  todaySummary.value.total += returnCount.value
  showConfirm.value = false
  clearForm()
  alert('คืน Ticket สำเร็จ!')
}

const todaySummary = ref({
  total: 5, football: 3, badminton: 1, pingpong: 1, basketball: 0,
})

const recentReturns = ref([
  { date: '20/04/2026 10:30', user: 'Suwanon Choojan (IT)', sport: 'ฟุตบอล', amount: 1 },
  { date: '20/04/2026 10:15', user: 'Suwanon Choojan (IT)', sport: 'ฟุตบอล', amount: 1 },
  { date: '20/04/2026 10:30', user: 'Suwanon Choojan (IT)', sport: 'แบดมินตัน', amount: 1 },
])
</script>

<style scoped>
.admin-page {
  padding: 28px 32px 80px; /* ✅ แก้จาก padding-bottom: 80 px (มีช่องว่าง) */
  min-height: 100vh;
}

.admin-page h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.main-layout { display: flex; gap: 20px; align-items: flex-start; }
.left-section { flex: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }

.section-card { background: white; border-radius: 12px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.section-card h2 { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }

.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; align-items: flex-end; }
.filter-item { display: flex; flex-direction: column; gap: 4px; }
.filter-item label { font-size: 12px; color: #888; font-weight: 500; }
.filter-item select, .filter-item input { border: 1px solid #ddd; border-radius: 8px; padding: 7px 10px; font-size: 13px; min-width: 130px; }
.filter-item.search input { min-width: 260px; }
.date-range { display: flex; align-items: center; gap: 6px; }
.date-range input { min-width: 120px; }

.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
thead { position: sticky; top: 0; background: white; z-index: 1; }
thead tr { border-bottom: 2px solid #eee; }
th { text-align: left; padding: 10px 12px; font-weight: 600; color: #555; font-size: 12px; white-space: nowrap; }
td { padding: 12px; color: #333; vertical-align: middle; white-space: nowrap; border-bottom: 1px solid #f0f0f0; }
tbody tr { cursor: pointer; transition: background 0.15s; }
tbody tr:hover { background: #fafafa; }
tbody tr.selected { background: #f0faf0; }
.sport-cell { display: flex; align-items: center; gap: 6px; }
.sport-mini { width: 18px; height: 18px; object-fit: contain; }
.status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.cancelled-admin { background: #fce4ec; color: #c62828; }

.pagination-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 12px; flex-wrap: wrap; }
.items-per-page { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
.items-per-page select { border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; }
.pagination-info { font-size: 13px; color: #555; }
.pagination-controls { display: flex; align-items: center; gap: 4px; }
.pagination-controls button { background: none; border: 1px solid #ddd; border-radius: 4px; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
.pagination-controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.pagination-controls button:not(:disabled):hover { background: #f0f0f0; }
.page-btn { background: none; border: 1px solid #ddd; border-radius: 4px; width: 28px; height: 28px; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.page-btn.active { background: #1565c0; color: white; border-color: #1565c0; }
.page-btn:hover { background: #f0f0f0; }

.select-hint {
  text-align: center;
  color: #aaa;
  font-size: 13px;
  padding: 16px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  background: white;
}

.detail-layout { display: flex; gap: 32px; }
.detail-info { flex: 1; }
.detail-info h3, .return-form h3 { font-size: 14px; font-weight: 700; color: #555; margin-bottom: 12px; }
.info-row { display: flex; gap: 8px; font-size: 13px; color: #333; margin-bottom: 8px; }
.info-row span:first-child { width: 120px; color: #888; flex-shrink: 0; }
.return-form { flex: 1; }
.form-row { display: flex; gap: 16px; margin-bottom: 12px; }
.form-item { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.form-item.full { margin-bottom: 12px; }
.form-item label { font-size: 12px; color: #888; font-weight: 500; }
.form-item select, .form-item input { border: 1px solid #ddd; border-radius: 8px; padding: 8px 10px; font-size: 13px; }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
.btn-cancel { background: #f5f5f5; border: 1px solid #ddd; border-radius: 8px; padding: 8px 24px; font-size: 14px; cursor: pointer; color: #555; }
.btn-confirm { background: #1b5e20; color: white; border: none; border-radius: 8px; padding: 8px 24px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-confirm:hover { background: #2e7d32; }

.right-section { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 80px; }
.summary-card { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.summary-card h3 { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
.summary-total { display: flex; align-items: center; gap: 12px; background: #f5f5f5; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
.sum-icon { width: 32px; height: 32px; object-fit: contain; }
.sum-num { font-size: 20px; font-weight: 800; color: #1a1a1a; }
.sum-label { font-size: 11px; color: #888; }
.sum-subtitle { font-size: 12px; color: #888; margin-bottom: 8px; }
.sum-row { display: flex; justify-content: space-between; font-size: 12px; color: #555; margin-bottom: 6px; }
.sum-val { font-weight: 700; color: #1a1a1a; }
.recent-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.recent-item { border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
.recent-date { font-size: 11px; color: #888; }
.recent-detail { font-size: 12px; color: #333; }
.see-all-btn { width: 100%; background: none; border: none; color: #1565c0; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; padding: 4px 0; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; border-radius: 16px; padding: 32px 40px; display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 320px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); text-align: center; }
.modal-box h3 { font-size: 18px; font-weight: 700; color: #1a1a1a; }
.modal-box p { font-size: 14px; color: #333; }
.modal-sub { font-size: 13px; color: #888; }
.modal-actions { display: flex; gap: 12px; margin-top: 8px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>