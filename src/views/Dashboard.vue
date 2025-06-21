<template>
  <Header />
  <Usuarios />
  <div class="opciones-container">
    
    <img src="/public/agro.png" alt="">
    
    <Chats class="chats"/>
  </div>
  
  
</template>

<script setup>
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import Chats from '../components/Chats.vue'
import Usuarios from '../components/Usuarios.vue'
const router = useRouter()


</script>

<style scoped>
.opciones-container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}
.opciones-container img{
  width: 50%;
  
}
h2 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
}

.chats{
  position: fixed;
  bottom: 0;
  margin: auto;
  width: 100vw;
  z-index: 100;
  height: 50vh;
  margin-top: 50vh;
}



@media (min-width: 640px) {
  .opciones-container img{
    width: 18%;
  }
  .chats{
    position: fixed;
    bottom: 0;
    margin: auto;
    width: 90vw;
    z-index: 100;
    height: 50vh;
    margin-top: 50vh;
  }
}
</style>
