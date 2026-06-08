<template>
  <div class="hero-banner">
    <div class="hero-content">
      <div class="hero-text">
        <h1>ยินดีต้อนรับ</h1>
        <p><strong>ตำแหน่ง :</strong> Developer</p>
        <p><strong>แผนก :</strong> IT</p>
        <button class="reserve-btn" @click="goReserve">+ จองสนามใหม่ </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goReserve() {
  router.push('/reserve')
}
</script>

<style scoped>
.hero-banner {
  background-image: url('@/assets/hero-sports.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #d8efd8;
  margin: 10px 90px;
  border-radius: 12px;
  min-height: 220px;
  overflow: hidden;
  position: relative;
}

.hero-content {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 100%;
  min-height: 220px;
  background: linear-gradient(
    to right,
    rgba(255,255,255,0.85) 0%,
    rgba(255,255,255,0.6) 50%,
    rgba(255,255,255,0) 100%
  );
  padding: 32px 0px 32px 40px;
}

.hero-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-text h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.hero-text p {
  font-size: 14px;
  color: #444;
  margin-bottom: 4px;
}

.reserve-btn {
  margin-top: 20px;
  background: #1565c0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: fit-content;
  transition: background 0.2s;
}

.reserve-btn:hover {
  background: #0d47a1;
}

.hero-images {
  flex-shrink: 0;
  width: 45%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.img-sports {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  display: block;
}
</style>