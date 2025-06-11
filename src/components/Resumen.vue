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
  </div>
  <Inducciones />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'
import Inducciones from './Inducciones.vue'

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
</script>

<style scoped>
.resumen-container {
  max-width: 500px;
  margin: 20px auto;
  font-family: Arial, sans-serif;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;
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
</style>
