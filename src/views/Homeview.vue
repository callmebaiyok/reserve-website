<template>
  <!-- ✅ เพิ่ม class wrapper ให้จัดระยะ -->
  <div class="home-wrapper">
    <HeroBanner @reservepage="goToReserve" />
    <ReservationTable />
  </div>
</template>

<style scoped>
.home-wrapper {
  padding-bottom: 0; /* ✅ ไม่มี padding ล่าง */
  padding-bottom: 0;
  margin-bottom: 0;
}
</style>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import HeroBanner from '../components/home/HeroBanner.vue'
import ReservationTable from '../components/home/ReservationTable.vue'

const router = useRouter()

function goToReserve() {
  router.push('/reservepage')
}
</script>