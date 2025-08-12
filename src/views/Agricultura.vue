<template>
  <Header />
    <Cultivos />
  <div>
    <nav class="submenu">
      <button :class="{ activo: vista === 'resumen' }" @click="vista = 'resumen'">Resumen</button>
      <button :class="{ activo: vista === 'ingresos' }" @click="vista = 'ingresos'">Ingresos</button>
      <button :class="{ activo: vista === 'egresos' }" @click="vista = 'egresos'">Egresos</button>
    </nav>
    
    <div class="contenido">
      <Resumen v-if="vista === 'resumen'" />
      <Ingresos v-else-if="vista === 'ingresos'" />
      <Egresos v-else-if="vista === 'egresos'" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Resumen from '../components/Resumen.vue'
import Ingresos from '../components/Ingresos.vue'
import Egresos from '../components/Egresos.vue'
import Header from '../components/Header.vue'

import { RouterLink } from 'vue-router'
import Cultivos from '../components/Cultivos.vue'

const vista = ref('resumen')
</script>

<style scoped>
.submenu {
  display: flex;
  justify-content: space-around;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  padding: 10px;
  flex-wrap: wrap;
}

.submenu button {
  background: none;
  border: none;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}
.regresar{
    text-decoration: none;
    color: #4caf50;
    font-weight: 900;
    margin-left: 20px;
}
.submenu button.activo {
  border-bottom: 2px solid #4caf50;
  color: #4caf50;
}

.submenu button:hover {
  color: #4caf50;
}

.contenido {
  padding: 20px;
}

/* Responsive */
@media (max-width: 600px) {
  

  .submenu button {
    text-align: center;
    padding: 12px;
    font-size: 18px;
  }
}
</style>
