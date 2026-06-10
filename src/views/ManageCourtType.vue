<template>
  <div class="page-wrapper">
    <NavBarAdmin />

    <div class="main-content">
      <!-- Left Sidebar -->
      <aside class="sidebar section-card">
        <h2 class="sidebar-main-title">Admin Dashboard</h2>
        <p class="select-date-label">Select date</p>
        <p class="selected-date-display">Wed, Apr 22</p>

        <div class="calendar-widget">
          <div class="calendar-header">
            <span>April 2026 ∨</span>
            <div class="calendar-nav">
              <button class="cal-nav-btn">‹</button>
              <button class="cal-nav-btn">›</button>
            </div>
          </div>
          <div class="cal-weekdays">
            <span v-for="d in ['S','M','T','W','TH','F','S']" :key="d">{{ d }}</span>
          </div>
          <div class="calendar-grid">
            <span
              v-for="(dayNum, index) in calendarDays"
              :key="index"
              class="cal-day"
              :class="{ 'is-selected': dayNum === 22, 'is-empty': !dayNum }"
            >{{ dayNum || '' }}</span>
          </div>
        </div>
      </aside>

      <!-- Right Main Area -->
      <main class="schedule-area">
        <div class="top-bar">
          <button class="add-btn" @click="openAddModal">+ เพิ่มประเภทสนาม</button>
        </div>

        <!-- Court Types Table -->
        <section class="section-card table-section">
          <h2 class="section-title">จัดการประเภทสนาม</h2>
          <p class="section-sub">เพิ่ม / แก้ไข / ลบ ประเภทสนามกีฬา</p>

          <div v-if="loading" class="loading-bar"></div>
          <div v-if="errorMsg" class="error-banner">⚠️ {{ errorMsg }}</div>

          <table class="court-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ไอคอน</th>
                <th>ชื่อประเภทสนาม</th>
                <th>รายละเอียด</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!loading && courtTypes.length === 0">
                <td colspan="5" class="empty-row">ไม่มีข้อมูลประเภทสนาม</td>
              </tr>
              <tr
                v-for="(type, index) in courtTypes"
                :key="type.courtTypeId"
                :class="{ 'row-selected': selectedTypeId === type.courtTypeId }"
                style="cursor: pointer;"
                @click="type.courtTypeId != null && (selectedTypeId = type.courtTypeId, onSelectChange())"
              >
                <td>{{ index + 1 }}</td>
                <td><span class="court-icon">{{ type.courtTypeId != null ? (iconMap[type.courtTypeId] || '🏟️') : '🏟️' }}</span></td>
                <td class="court-name-cell">{{ type.courtTypeName }}</td>
                <td class="court-desc-cell">{{ type.description }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-edit" @click.stop="openEditModal(type)" title="แก้ไข">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="action-delete" @click.stop="type.courtTypeId != null && deleteCourtType(type.courtTypeId)" title="ลบ">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Sub Courts Table -->
        <section class="section-card table-section sub-courts-section">
          <div class="sub-header">
            <div>
              <h2 class="section-title">สนามของแต่ละประเภท</h2>
              <p class="section-sub">จัดการสนามย่อยในแต่ละประเภท</p>
            </div>
            <div class="sub-controls">
              <div class="select-wrapper">
                <label>เลือกประเภทสนาม</label>
                <select v-model="selectedTypeId" class="type-select" @change="onSelectChange">
                  <option disabled :value="null">-- เลือกประเภทสนาม --</option>
                  <option v-for="ct in courtTypes" :key="ct.courtTypeId" :value="ct.courtTypeId">
                    {{ ct.courtTypeName }} ({{ ct.description }})
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div v-if="loadingCourts" class="loading-bar"></div>

          <table class="court-table">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อสนาม</th>
                <th>เวลาให้บริการ</th>
                <th>สล็อต (นาที)</th>
                <th>ราคา (บาท)</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="courts.length === 0">
                <td colspan="6" class="empty-row">ไม่มีข้อมูลสนาม หรือยังไม่ได้เลือกประเภทสนาม</td>
              </tr>
              <tr v-for="(court, index) in courts" :key="court.courtId">
                <td>{{ index + 1 }}</td>
                <td class="court-name-cell">{{ court.courtName }}</td>
                <td>{{ court.startReserveTime.slice(0,5) }} - {{ court.endReserveTime.slice(0,5) }} น.</td>
                <td>{{ court.slotTime }}</td>
                <td>{{ court.slotPrice }}</td>
                <td>
                  <div class="action-btns">
                    <button class="action-edit" @click="openEditCourtModal(court)" title="แก้ไขสนาม">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>

    <FooterSection />

    <!-- Add/Edit CourtType Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-box" @click.stop>
          <div class="modal-header">
            <h3>{{ isEditing ? 'แก้ไขประเภทสนามกีฬา' : 'เพิ่มประเภทสนามกีฬา' }}</h3>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>ไอคอน</label>
              <div class="icon-picker">
                <span
                  v-for="ic in iconOptions"
                  :key="ic"
                  class="icon-option"
                  :class="{ selected: selectedIcon === ic }"
                  @click="selectedIcon = ic"
                >{{ ic }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>ชื่อประเภทสนาม *</label>
              <input v-model="form.courtTypeName" type="text" placeholder="เช่น สนามแบดมินตัน" />
            </div>
            <div class="form-group">
              <label>คำอธิบายสั้นๆ</label>
              <input v-model="form.description" type="text" placeholder="เช่น Badminton Court" />
            </div>
            <div class="form-group">
              <label>ลำดับการแสดงผล</label>
              <input v-model.number="form.sequence" type="number" min="1" />
            </div>
            <div v-if="saveError" class="error-banner">⚠️ {{ saveError }}</div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">ยกเลิก</button>
            <button class="btn-confirm" :disabled="!form.courtTypeName || saving" @click="saveCourtType">
              <span v-if="saving">กำลังบันทึก...</span>
              <span v-else>{{ isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มประเภทสนาม' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Edit Court Modal -->
    <Transition name="fade">
      <div v-if="showCourtEditModal" class="modal-overlay" @click="closeCourtEditModal">
        <div class="modal-box modal-box-wide" @click.stop>
          <div class="modal-header">
            <h3>แก้ไขข้อมูลสนาม</h3>
            <button class="modal-close" @click="closeCourtEditModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>ชื่อสนาม *</label>
              <input v-model="courtEditForm.courtName" type="text" placeholder="เช่น สนาม A" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>วันที่เริ่มให้บริการ</label>
                <input v-model="courtEditForm.startReserveDate" type="date" />
              </div>
              <div class="form-group">
                <label>วันที่สิ้นสุด</label>
                <input v-model="courtEditForm.endReserveDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>เวลาเปิด</label>
                <input v-model="courtEditForm.startReserveTime" type="time" />
              </div>
              <div class="form-group">
                <label>เวลาปิด</label>
                <input v-model="courtEditForm.endReserveTime" type="time" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>สล็อต (นาที)</label>
                <input v-model.number="courtEditForm.slotTime" type="number" min="15" />
              </div>
              <div class="form-group">
                <label>ราคา (บาท)</label>
                <input v-model.number="courtEditForm.slotPrice" type="number" min="0" />
              </div>
              <div class="form-group">
                <label>จำนวนสล็อตสูงสุด</label>
                <input v-model.number="courtEditForm.maxSlot" type="number" min="1" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeCourtEditModal">ยกเลิก</button>
            <button class="btn-confirm" :disabled="!courtEditForm.courtName" @click="closeCourtEditModal">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService, type CourtType, type Court } from '../service/apiServices'

// ─── State ────────────────────────────────────────────────────────────────────
const courtTypes        = ref<CourtType[]>([])
const courts            = ref<Court[]>([])
const selectedCourtType = ref<CourtType | null>(null)
const selectedTypeId    = ref<number | null>(null)
const loading           = ref(false)
const loadingCourts     = ref(false)
const errorMsg          = ref('')

// ─── CourtType Modal ──────────────────────────────────────────────────────────
const showModal    = ref(false)
const isEditing    = ref(false)
const currentId    = ref<number | null>(null)
const saving       = ref(false)
const saveError    = ref('')
const selectedIcon = ref('🏟️')
const iconOptions  = ['🏸', '⚽', '🏀', '🏓', '🏋️', '🏊', '🎾', '🥊', '🏐', '⛳', '🏟️', '🏑', '🎱', '🤺', '🏄']

// ─── Court Edit Modal ─────────────────────────────────────────────────────────
const showCourtEditModal = ref(false)
const courtEditForm = ref({
  courtId:          null as number | null,
  courtName:        '',
  startReserveDate: '',
  endReserveDate:   '',
  startReserveTime: '',
  endReserveTime:   '',
  slotTime:         60,
  slotPrice:        0,
  maxSlot:          12,
})

const openEditCourtModal = (court: Court) => {
  courtEditForm.value = {
    courtId:          court.courtId,
    courtName:        court.courtName,
    startReserveDate: court.startReserveDate.slice(0, 10),
    endReserveDate:   court.endReserveDate.slice(0, 10),
    startReserveTime: court.startReserveTime.slice(0, 5),
    endReserveTime:   court.endReserveTime.slice(0, 5),
    slotTime:         court.slotTime,
    slotPrice:        Number(court.slotPrice),
    maxSlot:          court.maxSlot,
  }
  showCourtEditModal.value = true
}

const closeCourtEditModal = () => { showCourtEditModal.value = false }

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP_KEY = 'courtTypeIconMap'
const loadIconMap = (): Record<number, string> => {
  try { return JSON.parse(localStorage.getItem(ICON_MAP_KEY) || '{}') } catch { return {} }
}
const saveIconMap = (map: Record<number, string>) => {
  localStorage.setItem(ICON_MAP_KEY, JSON.stringify(map))
}
const iconMap = ref<Record<number, string>>(loadIconMap())

const form = ref<CourtType>({
  courtTypeName: '',
  description: '',
  sequence: 1,
  imgUuid: 'b4099451-adff-439f-94d2-3357b273045a',
})

// ─── Calendar ─────────────────────────────────────────────────────────────────
const calendarDays: (number | null)[] = [
  null, null, null,
  1,2,3,4,5,6,7,8,9,10,
  11,12,13,14,15,16,17,18,19,20,
  21,22,23,24,25,26,27,28,29,30,
]

// ─── API ──────────────────────────────────────────────────────────────────────
const fetchCourtTypes = async () => {
  loading.value  = true
  errorMsg.value = ''
  try {
    const res = await apiService.getAllCourtTypes()
    if (res.statusCode === 200) courtTypes.value = res.data
    else errorMsg.value = `โหลดข้อมูลไม่สำเร็จ (statusCode: ${res.statusCode})`
  } catch (error: any) {
    errorMsg.value = error?.message ?? 'ไม่สามารถเชื่อมต่อ API ได้'
  } finally {
    loading.value = false
  }
}

const fetchAllCourts = async () => {
  loadingCourts.value = true
  try {
    const res = await apiService.getAllCourts()
    if (res.statusCode === 200) courts.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loadingCourts.value = false
  }
}

const selectCourtType = async (type: CourtType) => {
  selectedCourtType.value = type
  courts.value            = []
  if (type.courtTypeId == null) return
  loadingCourts.value = true
  try {
    const res = await apiService.getCourtsByTypeId(type.courtTypeId)
    if (res.statusCode === 200) courts.value = res.data
  } catch (error) {
    console.error('[getCourtsByTypeId] error:', error)
  } finally {
    loadingCourts.value = false
  }
}

const onSelectChange = () => {
  const found = courtTypes.value.find(ct => ct.courtTypeId === selectedTypeId.value)
  if (found) selectCourtType(found)
}

const saveCourtType = async () => {
  saving.value    = true
  saveError.value = ''
  try {
    if (isEditing.value && currentId.value != null) {
      await apiService.updateCourtType(currentId.value, { ...form.value, updatedBy: '12345' })
      iconMap.value[currentId.value] = selectedIcon.value
      saveIconMap(iconMap.value)
    } else {
      const res = await apiService.createCourtType({ ...form.value, createdBy: '12345' })
      const newId = res?.data?.courtTypeId
      if (newId != null) { iconMap.value[newId] = selectedIcon.value; saveIconMap(iconMap.value) }
    }
    closeModal()
    await fetchCourtTypes()
  } catch (error: any) {
    saveError.value = error?.message ?? 'บันทึกไม่สำเร็จ กรุณาลองใหม่'
  } finally {
    saving.value = false
  }
}

const deleteCourtType = async (id: number) => {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสนามนี้?')) return
  try {
    await apiService.deleteCourtType(id, '12345')
    if (selectedCourtType.value?.courtTypeId === id) {
      selectedCourtType.value = null
      courts.value            = []
      selectedTypeId.value    = null
    }
    delete iconMap.value[id]
    saveIconMap(iconMap.value)
    await fetchCourtTypes()
    await fetchAllCourts()
  } catch (error) {
    console.error('[deleteCourtType] error:', error)
  }
}

const openAddModal = () => {
  isEditing.value    = false
  currentId.value    = null
  selectedIcon.value = '🏟️'
  saveError.value    = ''
  form.value         = { courtTypeName: '', description: '', sequence: 1, imgUuid: 'b4099451-adff-439f-94d2-3357b273045a' }
  showModal.value    = true
}

const openEditModal = (type: CourtType) => {
  isEditing.value    = true
  currentId.value    = type.courtTypeId ?? null
  selectedIcon.value = type.courtTypeId != null ? (iconMap.value[type.courtTypeId] || '🏟️') : '🏟️'
  saveError.value    = ''
  form.value         = { courtTypeName: type.courtTypeName, description: type.description, sequence: type.sequence, imgUuid: type.imgUuid }
  showModal.value    = true
}

const closeModal = () => { showModal.value = false }

onMounted(() => {
  fetchCourtTypes()
  fetchAllCourts()
})
</script>

<style scoped>
.page-wrapper {
  font-family: 'Sarabun', sans-serif;
  min-height: 100vh;
  background-image: url('../assets/background.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
}
.main-content { flex: 1; display: flex; gap: 24px; padding: 24px 28px; }
.section-card { background: rgba(255,255,255,0.88); border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 20px; }

/* Sidebar */
.sidebar { width: 260px; flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; height: fit-content; }
.sidebar-main-title { font-size: 1.1rem; font-weight: 700; color: #1b5e20; margin-bottom: 8px; }
.select-date-label { font-size: 0.82rem; color: #888; }
.selected-date-display { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 12px; }
.calendar-widget { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.calendar-header { background: #26A69A; color: white; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 0.95rem; }
.calendar-nav { display: flex; gap: 8px; }
.cal-nav-btn { background: white; border: none; color: #333; width: 24px; height: 24px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; padding: 8px 8px 0; font-size: 0.75rem; font-weight: 700; color: #888; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); padding: 4px 8px 12px; text-align: center; }
.cal-day { padding: 7px 0; font-size: 0.82rem; cursor: pointer; border-radius: 8px; transition: background 0.15s; color: #333; }
.cal-day:hover:not(.is-empty) { background: #e8f5e9; }
.cal-day.is-selected { background: #c8e6c9; font-weight: 700; }
.cal-day.is-empty { cursor: default; }

/* Right Area */
.schedule-area { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.top-bar { display: flex; justify-content: flex-end; }
.add-btn { background: #1b5e20; color: white; border: none; padding: 10px 20px; border-radius: 20px; font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: 'Sarabun', sans-serif; transition: background 0.2s; }
.add-btn:hover { background: #2e7d32; }

/* Loading & Error */
.loading-bar { height: 3px; background: linear-gradient(90deg, #1b5e20, #66bb6a, #1b5e20); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 4px; margin-bottom: 12px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.error-banner { background: #fff3f3; border: 1px solid #ffcdd2; color: #c62828; border-radius: 8px; padding: 10px 14px; font-size: 0.85rem; margin-bottom: 12px; }

/* Tables */
.table-section { overflow: hidden; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
.section-sub { font-size: 0.8rem; color: #888; margin-bottom: 16px; }
.court-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
.court-table thead tr { background: #f5f5f5; }
.court-table th { padding: 12px 16px; text-align: left; font-weight: 700; color: #555; font-size: 0.82rem; border-bottom: 2px solid #eee; }
.court-table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
.court-table tbody tr:hover { background: #fafafa; }
.court-table tbody tr:last-child td { border-bottom: none; }
.court-icon { font-size: 1.4rem; }
.court-name-cell { font-weight: 600; }
.court-desc-cell { color: #777; }
.empty-row { text-align: center; color: #aaa; padding: 32px 0 !important; font-style: italic; }
.action-btns { display: flex; gap: 8px; }
.action-edit, .action-delete { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
.action-edit:hover { background: #e3f2fd; }
.action-delete:hover { background: #ffebee; }
.row-selected td { background: #e8f5e9; color: #1b5e20; font-weight: 600; }

/* Sub Courts */
.sub-courts-section { margin-top: 0; }
.sub-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.sub-controls { display: flex; align-items: flex-end; gap: 12px; }
.select-wrapper { display: flex; flex-direction: column; gap: 4px; }
.select-wrapper label { font-size: 0.78rem; color: #888; }
.type-select { border: 1px solid #ddd; border-radius: 8px; padding: 8px 12px; font-size: 0.88rem; font-family: 'Sarabun', sans-serif; min-width: 220px; cursor: pointer; background: white; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; border-radius: 16px; padding: 28px; width: 460px; max-width: 95vw; box-shadow: 0 8px 40px rgba(0,0,0,0.2); animation: modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1); max-height: 90vh; overflow-y: auto; }
.modal-box-wide { width: 600px; }
@keyframes modalPop { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 14px; }
.modal-header h3 { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; }
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #888; }
.modal-body { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
.form-group input { border: 1px solid #ddd; border-radius: 8px; padding: 10px 12px; font-size: 0.9rem; font-family: 'Sarabun', sans-serif; transition: border 0.2s; }
.form-group input:focus { outline: none; border-color: #2e7d32; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.btn-cancel { background: #f5f5f5; border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.88rem; font-family: 'Sarabun', sans-serif; cursor: pointer; color: #555; }
.btn-cancel:hover { background: #eee; }
.btn-confirm { background: #1b5e20; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 0.88rem; font-weight: 600; font-family: 'Sarabun', sans-serif; cursor: pointer; transition: background 0.2s; }
.btn-confirm:hover:not(:disabled) { background: #2e7d32; }
.btn-confirm:disabled { background: #ccc; cursor: not-allowed; }

/* Icon Picker */
.icon-picker { display: flex; flex-wrap: wrap; gap: 8px; }
.icon-option { font-size: 1.4rem; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 2px solid #eee; cursor: pointer; transition: all 0.15s; }
.icon-option:hover { border-color: #81c784; background: #f1f8e9; }
.icon-option.selected { border-color: #2e7d32; background: #e8f5e9; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```