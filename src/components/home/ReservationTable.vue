<template>
  <div class="table-section">
    <h2>รายการจองล่าสุด</h2>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>สนาม</th>
            <th>ราคา</th>
            <th>สถานะ</th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedItems"
            :key="index"
            :class="{ 'row-highlighted': item.status === 'Pending' }"
          >
            <td>{{ item.date }}</td>
            <td>{{ item.time }}</td>
            <td>{{ item.court }}</td>
            <td>{{ item.amount }}</td>
            <td>
              <span :class="['status-badge', item.status.toLowerCase()]">
                {{ statusLabel(item.status) }}
              </span>
            </td>
            <td class="actions-cell">
              <!-- ✅ เปลี่ยนจาก emoji เป็น Lucide -->
              <button class="btn-detail" @click="viewDetail(item)">
                <Eye :size="14" /> รายละเอียด
              </button>
              <button class="btn-cancel" @click="cancelItem(item)">
                <Trash2 :size="14" /> ยกเลิก
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar">
      <div class="items-per-page">
        <span>แสดงหน้าละ :</span>
        <select v-model="itemsPerPage">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>
      <div class="pagination-info">
        {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, reservations.length) }} จาก {{ reservations.length }}
      </div>
      <div class="pagination-controls">
        <button @click="currentPage = 1" :disabled="currentPage === 1">
          <ChevronsLeft :size="14" />
        </button>
        <button @click="currentPage--" :disabled="currentPage === 1">
          <ChevronLeft :size="14" />
        </button>
        <span class="page-num">{{ currentPage }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages">
          <ChevronRight :size="14" />
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages">
          <ChevronsRight :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

interface Reservation {
  date: string
  time: string
  court: string
  amount: string
  status: string
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    Confirm: 'ยืนยันแล้ว',
    Pending: 'รอดำเนินการ',
    Cancelled: 'ยกเลิกแล้ว',
  }
  return map[status] ?? status
}

const reservations = ref<Reservation[]>([
  {
    date: '23 เมษายน 2569',
    time: '14.00 - 16.00',
    court: 'สนามฟุตบอล',
    amount: '800 บาท',
    status: 'Confirm',
  },
  {
    date: '25 เมษายน 2569',
    time: '16.00 - 18.00',
    court: 'สนามแบดมินตัน 1',
    amount: '400 บาท',
    status: 'Pending',
  },
])

const currentPage = ref(1)
const itemsPerPage = ref(5)

const totalPages = computed(() =>
  Math.ceil(reservations.value.length / itemsPerPage.value)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return reservations.value.slice(start, start + itemsPerPage.value)
})

function viewDetail(item: Reservation) {
  alert(`Detail: ${item.court} on ${item.date}`)
}

function cancelItem(item: Reservation) {
  if (confirm(`Cancel reservation for ${item.court}?`)) {
    reservations.value = reservations.value.filter((r) => r !== item)
  }
}
</script>

<style scoped>
.table-section {
  margin: 1px 90px 5px;
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.table-section h2 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a1a1a;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead tr {
  border-bottom: 2px solid #eee;
}

th {
  text-align: center;
  padding: 12px 16px;
  font-weight: 600;
  color: #555;
  font-size: 13px;
}

td {
  padding: 14px 16px;
  color: #333;
  vertical-align: middle;
  text-align: center;
}

tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

tbody tr:hover {
  background: #fafafa;
}

.status-badge {
  font-weight: 600;
  font-size: 13px;
}

.status-badge.confirm { color: #2e7d32; }
.status-badge.pending { color: #f57c00; }
.status-badge.cancelled { color: #c62828; }

.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-detail,
.btn-cancel {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: opacity 0.2s;
}

.btn-detail { background: #e8f5e9; color: #2e7d32; }
.btn-detail:hover { opacity: 0.8; }
.btn-cancel { background: #ffebee; color: #c62828; }
.btn-cancel:hover { opacity: 0.8; }

/* Pagination */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.items-per-page select {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  cursor: pointer;
}

.pagination-info {
  font-size: 13px;
  color: #555;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-controls button {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.pagination-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-controls button:not(:disabled):hover {
  background: #f0f0f0;
}

.page-num {
  background: #0000CC;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}
</style>