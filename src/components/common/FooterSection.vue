<template>
  <footer>
    <div class="wave-container">
      <svg viewBox="0 0 1440 63" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d="M0,20 C360,80 1080,0 1440,20 L1440,80 L0,80 Z"
          fill="#1b5e20"
        />
      </svg>
    </div>

    <div class="footer-content">
      <div class="footer-logos">
        <img src="../../assets/logo-hrmed.png" alt="HR MED" class="footer-logo" />
      </div>

      <div class="footer-info">
        <p>คณะแพทยศาสตร์ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่</p>
        <p>อาคารบินหลา 3 ตำบล คอหงส์ อำเภอหาดใหญ่ สงขลา 90110</p>
        <p class="contact-row">
          <!-- ✅ ใช้ Lucide icon แทน emoji -->
          <span><Phone :size="14" /> 074-455000 ต่อ 553799</span>
          <span><Mail :size="14" /> medical.fitness63@gmail.com</span>
          <span><Facebook :size="14" /> งานสร้างเสริมสุขภาพ คณะแพทยศาสตร์</span>
        </p>
        <p>2026 Faculty of Medicine, Prince of Songkla University</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// ✅ เพิ่ม script สำหรับ Lucide icons
import { Phone, Mail, Facebook } from 'lucide-vue-next'
</script>

<style scoped>
footer {
  position: relative;
  margin-top: 0;
}

.wave-container {
  line-height: 0;
  overflow: hidden;
  margin-top: 0;
}

.wave-container svg {
  display: block;
  width: 100%;
  height: 104px;
}

.footer-content {
  background: #1b5e20;
  display: flex;
  align-items: center;
  gap: 24px 30px;
  padding: 1px 32px 25px;
}

.footer-logos {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.footer-logo {
  height: 80px;
  object-fit: contain;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 15px;
  line-height: 1.6;
  border-left: 1px solid rgba(255,255,255,0.3);
  padding-left: 24px;
}

.footer-info p {
  color: rgba(255, 255, 255, 0.9);
}

/* ✅ จัด icon กับข้อความให้อยู่แนวเดียวกัน */
.contact-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.contact-row span {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>