<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-icon">
          <LockKeyhole :size="20" :stroke-width="2.5" />
        </div>
        <h2 class="modal-title">ปิดสนาม</h2>
        <button class="close-btn" @click="$emit('close')">
          <X :size="18" :stroke-width="2" />
        </button>
      </div>

      <!-- Court name -->
      <div class="court-label">
        <span class="court-tag">{{ courtName }}</span>
      </div>

      <!-- Time range picker -->
      <div class="section-label">เลือกช่วงเวลาที่ต้องการปิด</div>

      <div class="time-range-row">
        <div class="time-select-group">
          <label class="time-select-label">เริ่มต้น</label>
          <select v-model="startTime" class="time-select" @change="onStartChange">
            <option v-for="t in availableSlots" :key="'s-'+t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="range-arrow">
          <ArrowRight :size="20" :stroke-width="2" />
        </div>

        <div class="time-select-group">
          <label class="time-select-label">สิ้นสุด</label>
          <select v-model="endTime" class="time-select">
            <option
              v-for="t in availableEndSlots"
              :key="'e-'+t"
              :value="t"
            >{{ t }}</option>
          </select>
        </div>
      </div>

      <!-- Visual preview of selected slots -->
      <div class="section-label">ตัวอย่างช่วงเวลาที่จะปิด</div>
      <div class="slot-preview">
        <div
          v-for="t in allTimeSlots"
          :key="'p-'+t"
          class="preview-slot"
          :class="{ 'in-range': isInRange(t), 'out-range': !isInRange(t) }"
        >
          {{ t }}
        </div>
      </div>

      <!-- Summary -->
      <div v-if="selectedSlots.length > 0" class="summary-box">
        <span class="summary-icon"><Clock :size="16" :stroke-width="2" /></span>
        <span>ปิด <strong>{{ selectedSlots.length }}</strong> ช่วงเวลา ({{ startTime }} – {{ endTimeDisplay }})</span>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">ยกเลิก</button>
        <button
          class="btn-confirm"
          :disabled="selectedSlots.length === 0"
          @click="confirmLock"
        >
          ยืนยันปิดสนาม
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LockKeyhole, X, ArrowRight, Clock } from 'lucide-vue-next'

const props = defineProps<{
  courtName: string
  allTimeSlots: string[]        // ['14:00','15:00',...,'21:00']
  availableSlots: string[]      // slots ที่ยัง FREE อยู่
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', payload: { courtName: string; slots: string[] }): void
}>()

// Default start = first available slot
const startTime = ref(props.availableSlots[0] ?? props.allTimeSlots[0])
const endTime   = ref(props.availableSlots[0] ?? props.allTimeSlots[0])

// End slot options must be >= startTime and also FREE
const availableEndSlots = computed(() => {
  const startIdx = props.allTimeSlots.indexOf(startTime.value)
  return props.availableSlots.filter(t => {
    const i = props.allTimeSlots.indexOf(t)
    return i >= startIdx
  })
})

// Reset endTime if it's now before startTime
const onStartChange = () => {
  const startIdx = props.allTimeSlots.indexOf(startTime.value)
  const endIdx   = props.allTimeSlots.indexOf(endTime.value)
  if (endIdx < startIdx) {
    endTime.value = startTime.value
  }
}

// All slots between start and end (inclusive) that are FREE
const selectedSlots = computed(() => {
  const startIdx = props.allTimeSlots.indexOf(startTime.value)
  const endIdx   = props.allTimeSlots.indexOf(endTime.value)
  return props.allTimeSlots
    .slice(startIdx, endIdx + 1)
    .filter(t => props.availableSlots.includes(t))
})

const isInRange = (t: string) => {
  const startIdx = props.allTimeSlots.indexOf(startTime.value)
  const endIdx   = props.allTimeSlots.indexOf(endTime.value)
  const i        = props.allTimeSlots.indexOf(t)
  return i >= startIdx && i <= endIdx
}

// Display end+1hr as the "end" label (like booking systems)
const endTimeDisplay = computed(() => {
  const idx = props.allTimeSlots.indexOf(endTime.value)
  const nextIdx = idx + 1
  if (nextIdx < props.allTimeSlots.length) {
    return props.allTimeSlots[nextIdx]
  }
  // parse and add 1hr
  const [h] = endTime.value.split(':').map(Number)
  return `${(h + 1).toString().padStart(2, '0')}:00`
})

const confirmLock = () => {
  emit('confirm', {
    courtName: props.courtName,
    slots: selectedSlots.value
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

.modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  font-family: 'Sarabun', sans-serif;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #E8F5E9;
  border-radius: 10px;
  color: #1B5E20;
  flex-shrink: 0;
}
.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1B5E20;
  flex: 1;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: #f0f0f0; color: #555; }

/* Court tag */
.court-label { margin-bottom: 20px; }
.court-tag {
  background: #E8F5E9;
  color: #1B5E20;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
}

/* Section label */
.section-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

/* Time range row */
.time-range-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 24px;
}
.time-select-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.time-select-label {
  font-size: 0.8rem;
  color: #555;
  font-weight: 600;
}
.time-select {
  border: 2px solid #C8E6C9;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 1rem;
  font-family: 'Sarabun', sans-serif;
  color: #1B5E20;
  font-weight: 700;
  background: #F9FFF9;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}
.time-select:focus { border-color: #2E7D32; }

.range-arrow {
  display: flex;
  align-items: center;
  color: #aaa;
  padding-bottom: 12px;
  flex-shrink: 0;
}

/* Slot preview */
.slot-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.preview-slot {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s ease;
}
.preview-slot.in-range {
  background: #1B5E20;
  color: #fff;
}
.preview-slot.out-range {
  background: #F5F5F5;
  color: #bbb;
}

/* Summary */
.summary-box {
  background: #FFF8E1;
  border: 1px solid #FFE082;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #5D4037;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}
.summary-icon {
  display: flex;
  align-items: center;
  color: #F9A825;
  flex-shrink: 0;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn-cancel {
  background: #f0f0f0;
  color: #555;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: 'Sarabun', sans-serif;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #e0e0e0; }

.btn-confirm {
  background: #1B5E20;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: 'Sarabun', sans-serif;
  cursor: pointer;
  font-weight: 700;
  transition: background 0.15s, opacity 0.15s;
}
.btn-confirm:hover:not(:disabled) { background: #2E7D32; }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
</style>