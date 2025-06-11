<template>
  <Header />
  <div class="opciones-container">
    
  <img src="/public/agro.png" alt="">
    <h2>Selecciona una opción</h2>
    <div class="botones">
      <button @click="irARuta('agricultura')">Agricultura</button>
      <button @click="irARuta('ganaderia')">Ganadería</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Header from '../components/Header.vue'
const router = useRouter()

const irARuta = (ruta) => {
  router.push(`/${ruta}`)
}
</script>

<style scoped>
.opciones-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  min-height: 100vh;
  text-align: center;
}
.opciones-container img{
  width: 20%;
}
h2 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.5rem;
}

.botones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 0.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  width: 100%;
}

button:hover {
  background-color: #43a047;
}

@media (min-width: 640px) {
  .botones {
    flex-direction: row;
    justify-content: center;
  }

  button {
    width: 140px;
  }
}
</style>
