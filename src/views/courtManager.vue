<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Court, CourtType }  from '../service/apiServices';
import { apiService } from '../service/apiServices'; 

// State management
const courtTypes = ref<CourtType[]>([]);
const courts = ref<Court[]>([]);
const selectedCourtType = ref<CourtType | null>(null);
const loading = ref<boolean>(false);``

// Dialog State
const dialog = ref<boolean>(false);
const isEdit = ref<boolean>(false);
const currentId = ref<number | null>(null);
const form = ref<CourtType>({
  courtTypeName: '',
  description: '',
  sequence: 1,
  imgUuid: 'b4099451-adff-439f-94d2-3357b273045a', // ค่า Default สำหรับการสอน
});

// ดึงข้อมูลประเภทสนามทั้งหมด
const fetchCourtTypes = async () => {
  loading.value = true;
  try {
    const res = await apiService.getAllCourtTypes();
    if (res.statusCode === 200) {
      courtTypes.value = res.data;
    }
  } catch (error) {
    console.error('Error fetching court types:', error);
  } finally {
    loading.value = false;
  }
};

// ดูข้อมูลสนามย่อยเมื่อเลือกประเภทสนาม
const selectCourtType = async (type: CourtType) => {
  selectedCourtType.value = type;
  courts.value = [];
  if (!type.courtTypeId) return;
  
  try {
    const res = await apiService.getCourtsByTypeId(type.courtTypeId);
    if (res.statusCode === 200) {
      courts.value = res.data;
    }
  } catch (error) {
    console.error('Error fetching courts:', error);
  }
};

// เปิดหน้าต่างจัดการข้อมูล (เพิ่ม / แก้ไข)
const openDialog = (type?: CourtType) => {
  if (type && type.courtTypeId) {
    isEdit.value = true;
    currentId.value = type.courtTypeId;
    form.value = {
      courtTypeName: type.courtTypeName,
      description: type.description,
      sequence: type.sequence,
      imgUuid: type.imgUuid,
    };
  } else {
    isEdit.value = false;
    currentId.value = null;
    form.value = { courtTypeName: '', description: '', sequence: 1, imgUuid: 'b4099451-adff-439f-94d2-3357b273045a' };
  }
  dialog.value = true;
};

// บันทึกข้อมูล (Create or Update)
const saveCourtType = async () => {
  try {
    if (isEdit.value && currentId.value) {
      await apiService.updateCourtType(currentId.value, { ...form.value, updatedBy: '12345' });
    } else {
      await apiService.createCourtType({ ...form.value, createdBy: '12345' });
    }
    dialog.value = false;
    fetchCourtTypes(); // โหลดข้อมูลใหม่หลังจากบันทึกเสร็จ
  } catch (error) {
    console.error('Error saving:', error);
  }
};

// ลบข้อมูลประเภทสนาม
const deleteCourtType = async (id: number) => {
  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประเภทสนามนี้?')) {
    try {
      await apiService.deleteCourtType(id, '12345');
      if (selectedCourtType.value?.courtTypeId === id) {
        selectedCourtType.value = null;
        courts.value = [];
      }
      fetchCourtTypes();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }
};

// เรียกใช้งานทันทีเมื่อ Component ถูก Mount
onMounted(() => {
  fetchCourtTypes();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>ประเภทสนามกีฬา</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">เพิ่มประเภท</v-btn>
          </v-card-title>
          
          <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>
          
          <v-list lines="two">
            <v-list-item
              v-for="type in courtTypes"
              :key="type.courtTypeId"
              :active="selectedCourtType?.courtTypeId === type.courtTypeId"
              @click="selectCourtType(type)"
            >
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-2">
                  <v-icon>mdi-stadium-variant</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">{{ type.courtTypeName }}</v-list-item-title>
              <v-list-item-subtitle>{{ type.description }} (ลำดับ: {{ type.sequence }})</v-list-item-subtitle>

              <template v-slot:append>
                <v-btn icon="mdi-pencil" variant="text" color="blue" @click.stop="openDialog(type)"></v-btn>
                <v-btn icon="mdi-delete" variant="text" color="red" @click.stop="deleteCourtType(type.courtTypeId!)"></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" min-height="200">
          <v-card-title>
            สนามภายใน: {{ selectedCourtType ? selectedCourtType.courtTypeName : 'กรุณาเลือกประเภทสนาม' }}
          </v-card-title>
          
          <v-text-if-empty v-if="courts.length === 0" class="text-center pa-8 text-grey">
            ไม่มีข้อมูลสนาม หรือยังไม่ได้เลือกประเภทสนาม
          </v-text-if-empty>

          <v-row v-else class="mt-2">
            <v-col v-for="court in courts" :key="court.courtId" cols="12" sm="6">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-1 font-weight-bold color-primary">{{ court.courtName }}</div>
                <div class="text-caption text-grey">เวลาให้บริการ: {{ court.startReserveTime.slice(0,5) }} - {{ court.endReserveTime.slice(0,5) }} น.</div>
                <div class="text-caption text-grey">สล็อตละ: {{ court.slotTime }} นาที | ราคา: {{ court.slotPrice }} บาท</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ isEdit ? 'แก้ไขประเภทสนามกีฬา' : 'เพิ่มประเภทสนามกีฬา' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="form.courtTypeName" label="ชื่อประเภทสนาม*" variant="outlined" required></v-text-field>
          <v-text-field v-model="form.description" label="คำอธิบายสั้นๆ" variant="outlined"></v-text-field>
          <v-text-field v-model.number="form.sequence" label="ลำดับการแสดงผล" type="number" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4 justify-end">
          <v-btn variant="text" @click="dialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!form.courtTypeName" @click="saveCourtType">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>