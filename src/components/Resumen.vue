<template>
  <div class="resumen-container">
    <h2>Balance</h2>
    
    <select v-model="filtroCultivo" @change="filtrar">
      <option value="">Todos los cultivos</option>
      <option v-for="c in cultivosUnicos" :key="c" :value="c">{{ c }}</option>
    </select>

    <div class="totales">
      <p>Total Ingresos: <strong>C$ {{ totalIngresos }}</strong></p>
      <p>Total Egresos: <strong>C$ {{ totalEgresos }}</strong></p>
      <p>Balance: <strong :class="{ positivo: balance >= 0, negativo: balance < 0 }">C$ {{ balance }}</strong></p>
    </div>

    <nav class="submenu">
      <button :class="{ activo: vista === 'inducciones' }" @click="vista = 'inducciones'">Inducciones</button>
      <button :class="{ activo: vista === 'factura' }" @click="vista = 'factura'">Factura</button>
    </nav>
    <div class="contenido">
      <Inducciones v-if="vista === 'inducciones'" />
      <Factura v-else-if="vista === 'factura'" />
    </div>

  </div>

  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import Inducciones from './Inducciones.vue'
import Factura from './Factura.vue'

const ingresos = ref([])
const egresos = ref([])
const filtroCultivo = ref('')
let userId = null

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id || null
}

const cargarDatos = async () => {
  if (!userId) return

  const { data: ingresosData, error: errIngresos } = await supabase
    .from('ingresos')
    .select('*')
    .eq('user_id', userId)
  if (!errIngresos) ingresos.value = ingresosData || []

  const { data: egresosData, error: errEgresos } = await supabase
    .from('egresos')
    .select('*')
    .eq('user_id', userId)
  if (!errEgresos) egresos.value = egresosData || []
}

const cultivosUnicos = computed(() => {
  const nombres = [...ingresos.value, ...egresos.value].map(i => i.cultivo)
  return [...new Set(nombres)].filter(Boolean)
})

const ingresosFiltrados = computed(() => {
  if (!filtroCultivo.value) return ingresos.value
  return ingresos.value.filter(i => i.cultivo === filtroCultivo.value)
})

const egresosFiltrados = computed(() => {
  if (!filtroCultivo.value) return egresos.value
  return egresos.value.filter(e => e.cultivo === filtroCultivo.value)
})

const totalIngresos = computed(() =>
  ingresosFiltrados.value.reduce((acc, i) => acc + Number(i.ingresos || 0), 0)
)


const totalEgresos = computed(() =>
  egresosFiltrados.value.reduce((acc, e) => acc + Number(e.monto), 0)
)

const balance = computed(() => totalIngresos.value - totalEgresos.value)

const filtrar = () => {
  // Solo dispara recomputación, no hace nada explícito
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarDatos()
})


const vista = ref('inducciones')
</script>

<style >
.resumen-container {
  width: 90%;
  margin: auto;
  font-family: Arial, sans-serif;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px; 
}
.resumen-container h2 {
  text-align: center;
  margin-bottom: 15px;
}

select {
  padding: 8px;
  font-size: 16px;
  margin-bottom: 15px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #bbb;
}

.totales p {
  font-size: 18px;
  margin: 8px 0;
}

.positivo {
  color: green;
}

.negativo {
  color: red;
}

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
