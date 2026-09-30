<template>
  <div class="dashboard">

    <header class="topbar">
      <div>
        <h2>Dashboard Agrícola</h2>
        <p>Resumen financiero y productivo de cultivos</p>
      </div>
    </header>

    <!-- FILTROS MULTIPLES -->
    <div class="filtros-container">
      <div class="filtros-header">
        <span>Filtrar por cultivos:</span>
        <button v-if="filtrosCultivo.length > 0" class="limpiar-filtros" @click="filtrosCultivo = []">
          Limpiar filtros
        </button>
      </div>
      <div class="filtros">
        <button
          v-for="cultivo in cultivosUnicos"
          :key="cultivo"
          class="filtro-btn"
          :class="{ activo: filtrosCultivo.includes(cultivo) }"
          @click="toggleFiltro(cultivo)"
        >
          {{ cultivo }}
        </button>
      </div>
    </div>

    <!-- CARDS -->
    <div class="cards">

      <div class="card ingreso">
        <span>Ingresos</span>
        <h3>C$ {{ totalIngresos.toFixed(2) }}</h3>
      </div>

      <div class="card egreso">
        <span>Egresos</span>
        <h3>C$ {{ totalEgresos.toFixed(2) }}</h3>
      </div>

      <div class="card balance" :class="{ 'negativo': balance < 0 }">
        <span>Ganancia Neta</span>
        <h3 :style="{ color: balance >= 0 ? '#22c55e' : '#ef4444' }">
          C$ {{ balance.toFixed(2) }}
        </h3>
      </div>

      <div class="card roi" :class="{ 'negativo': margenRentabilidad < 0 }">
        <span>Rentabilidad (ROI)</span>
        <h3>{{ margenRentabilidad }}%</h3>
      </div>

      <div class="card plantas">
        <span>Plantas Útiles (90%)</span>
        <h3>{{ totalPlantasEfectivas }} <small>({{ totalPlantas }} iniciales)</small></h3>
      </div>

      <div class="card promedio">
        <span>Costo Real / Planta</span>
        <h3>C$ {{ precioPorPlanta }}</h3>
      </div>

    </div>

    <!-- SUGERENCIA -->
    <div class="sugerencia">
      <h3>Sugerencia de Venta</h3>

      <p>
        Para ganar un <strong>100%</strong> sobre inversión (ajustado por 10% de pérdidas):
      </p>

      <div class="precio-recomendado">
        C$ {{ (precioPorPlanta * 2).toFixed(2) }}
      </div>

      <small>
        Precio recomendado por unidad considerando la merma en campo.
      </small>
    </div>

    <!-- GRAFICAS -->
    <div class="graficas">

      <div class="grafica-card">
        <h3>Ingresos vs Egresos</h3>
        <div class="chart-container">
          <Bar
            :data="barData"
            :options="chartOptions"
          />
        </div>
      </div>

      <div class="grafica-card">
        <h3>Ganancias por Cultivo</h3>
        <div class="chart-container">
          <Pie
            :data="pieData"
            :options="chartOptions"
          />
        </div>
      </div>

      <div class="grafica-card span-full">
        <h3>Distribución de Egresos por Categoría</h3>
        <div class="chart-container doughnut-container">
          <Doughnut
            v-if="egresosPorCategoriaData.datasets[0].data.length > 0"
            :data="egresosPorCategoriaData"
            :options="chartOptions"
          />
          <p v-else class="text-muted">No hay categorías registradas en los egresos.</p>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import { Bar, Pie, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale
)

const ingresos = ref([])
const egresos = ref([])
const cultivos = ref([])

// Cambiado a arreglo para selección múltiple
const filtrosCultivo = ref([])

let userId = null

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id
}

const cargarDatos = async () => {
  const { data: ingresosData } = await supabase
    .from('ingresos')
    .select('*')
    .eq('user_id', userId)

  ingresos.value = ingresosData || []

  const { data: egresosData } = await supabase
    .from('egresos')
    .select('*')
    .eq('user_id', userId)

  egresos.value = egresosData || []

  const { data: cultivosData } = await supabase
    .from('cultivos')
    .select('*')
    .eq('user_id', userId)

  cultivos.value = cultivosData || []
}

const cultivosUnicos = computed(() => {
  const nombres = [
    ...ingresos.value.map(i => i.cultivo),
    ...egresos.value.map(e => e.cultivo),
    ...cultivos.value.map(c => c.nombre)
  ]

  return [...new Set(nombres)].filter(Boolean)
})

// Lógica para alternar la selección múltiple
const toggleFiltro = (cultivo) => {
  const index = filtrosCultivo.value.indexOf(cultivo)
  if (index > -1) {
    filtrosCultivo.value.splice(index, 1)
  } else {
    filtrosCultivo.value.push(cultivo)
  }
}

const ingresosFiltrados = computed(() => {
  if (filtrosCultivo.value.length === 0) return ingresos.value
  return ingresos.value.filter(i => filtrosCultivo.value.includes(i.cultivo))
})

const egresosFiltrados = computed(() => {
  if (filtrosCultivo.value.length === 0) return egresos.value
  return egresos.value.filter(e => filtrosCultivo.value.includes(e.cultivo))
})

const cultivosFiltradosData = computed(() => {
  if (filtrosCultivo.value.length === 0) return cultivos.value
  return cultivos.value.filter(c => filtrosCultivo.value.includes(c.nombre))
})

const totalIngresos = computed(() =>
  ingresosFiltrados.value.reduce(
    (acc, item) => acc + Number(item.ingresos || 0),
    0
  )
)

const totalEgresos = computed(() =>
  egresosFiltrados.value.reduce(
    (acc, item) => acc + Number(item.monto || 0),
    0
  )
)

const balance = computed(() =>
  totalIngresos.value - totalEgresos.value
)

const margenRentabilidad = computed(() => {
  if (totalEgresos.value <= 0) return 0
  return ((balance.value / totalEgresos.value) * 100).toFixed(1)
})

const totalPlantas = computed(() =>
  cultivosFiltradosData.value.reduce(
    (acc, item) => acc + Number(item.cantPlantas || 0),
    0
  )
)

const totalPlantasEfectivas = computed(() => {
  return Math.floor(totalPlantas.value * 0.9)
})

const precioPorPlanta = computed(() => {
  if (totalPlantasEfectivas.value <= 0) return 0
  return (totalEgresos.value / totalPlantasEfectivas.value).toFixed(2)
})

const ingresosPorCultivo = computed(() =>
  cultivosUnicos.value.map(cultivo => {
    return ingresos.value
      .filter(i => i.cultivo === cultivo)
      .reduce((acc, item) => acc + Number(item.ingresos || 0), 0)
  })
)

const egresosPorCultivo = computed(() =>
  cultivosUnicos.value.map(cultivo => {
    return egresos.value
      .filter(e => e.cultivo === cultivo)
      .reduce((acc, item) => acc + Number(item.monto || 0), 0)
  })
)

const gananciasPorCultivo = computed(() =>
  cultivosUnicos.value.map((_, index) =>
    ingresosPorCultivo.value[index] - egresosPorCultivo.value[index]
  )
)

const categoriasEgresosUnicas = computed(() => {
  const categorias = egresosFiltrados.value.map(e => e.categoria || e.tipo || 'General')
  return [...new Set(categorias)]
})

const egresosPorCategoriaData = computed(() => {
  const dataMap = categoriasEgresosUnicas.value.map(cat => {
    return egresosFiltrados.value
      .filter(e => (e.categoria || e.tipo || 'General') === cat)
      .reduce((acc, item) => acc + Number(item.monto || 0), 0)
  })

  return {
    labels: categoriasEgresosUnicas.value,
    datasets: [
      {
        data: dataMap,
        backgroundColor: [
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#10b981'
        ]
      }
    ]
  }
})

const barData = computed(() => ({
  labels: cultivosUnicos.value,
  datasets: [
    {
      label: 'Ingresos',
      data: ingresosPorCultivo.value,
      backgroundColor: '#22c55e',
      borderRadius: 8
    },
    {
      label: 'Egresos',
      data: egresosPorCultivo.value,
      backgroundColor: '#ef4444',
      borderRadius: 8
    }
  ]
}))

const pieData = computed(() => ({
  labels: cultivosUnicos.value,
  datasets: [
    {
      data: gananciasPorCultivo.value,
      backgroundColor: [
        '#22c55e',
        '#3b82f6',
        '#f59e0b',
        '#8b5cf6',
        '#06b6d4',
        '#ef4444',
        '#84cc16'
      ]
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#374151',
        boxWidth: 12,
        font: { size: 11 }
      }
    }
  },
  scales: {
    x: { ticks: { color: '#374151', font: { size: 10 } } },
    y: { ticks: { color: '#374151', font: { size: 10 } } }
  }
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarDatos()
})
</script>

<style scoped>
.dashboard{
  width:100%;
  max-width:1400px;
  margin:auto;
  padding:0.75rem;
  box-sizing:border-box;
  font-family:Arial, sans-serif;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* HEADER */
.topbar{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:1rem;
  gap:0.5rem;
}

.topbar h2{
  margin:0;
  font-size:1.4rem;
  color:#111827;
  font-weight:700;
}

.topbar p{
  margin-top:.2rem;
  color:#6b7280;
  font-size:.85rem;
}

/* FILTROS MULTIPLES */
.filtros-container {
  background: white;
  padding: 0.8rem;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  margin-bottom: 1rem;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #4b5563;
  font-weight: 600;
}

.limpiar-filtros {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.limpiar-filtros:hover {
  text-decoration: underline;
}

.filtros{
  display:flex;
  gap:.4rem;
  flex-wrap:wrap;
}

.filtro-btn{
  border:none;
  padding:.4rem 0.8rem;
  border-radius:999px;
  background:#f3f4f6;
  cursor:pointer;
  font-weight:600;
  transition:.2s;
  font-size:.78rem;
  color:#374151;
}

.filtro-btn:hover{
  background:#dcfce7;
  color:#15803d;
}

.filtro-btn.activo{
  background:#22c55e;
  color:white;
  box-shadow:0 2px 8px rgba(34,197,94,0.3);
}

/* CARDS */
.cards{
  display:grid;
  grid-template-columns: repeat(2, 1fr);
  gap:0.75rem;
  margin-bottom:1rem;
}

.card{
  background:white;
  border-radius:14px;
  padding:0.85rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  transition:.2s;
  overflow:hidden;
  position:relative;
}

.card::before{
  content:'';
  position:absolute;
  left:0;
  top:0;
  width:4px;
  height:100%;
}

.ingreso::before{ background:#22c55e; }
.egreso::before{ background:#ef4444; }
.balance::before{ background:#3b82f6; }
.roi::before{ background:#06b6d4; }
.plantas::before{ background:#f59e0b; }
.promedio::before{ background:#8b5cf6; }

.card.negativo::before{ background:#ef4444; }

.card span{
  display:block;
  font-size:.72rem;
  color:#6b7280;
  margin-bottom:.3rem;
  font-weight:600;
}

.card h3{
  margin:0;
  font-size:1.05rem;
  color:#111827;
  font-weight:700;
  word-break:break-word;
}

.card h3 small {
  display: block;
  font-size: 0.68rem;
  color: #6b7280;
  font-weight: normal;
}

/* SUGERENCIA */
.sugerencia{
  background:white;
  padding:1rem;
  border-radius:14px;
  margin-bottom:1rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}

.sugerencia h3{
  margin-top:0;
  margin-bottom:.4rem;
  color:#111827;
  font-size: 1rem;
}

.sugerencia p{
  color:#4b5563;
  margin-bottom:.4rem;
  font-size: 0.85rem;
}

.precio-recomendado{
  font-size:1.6rem;
  font-weight:800;
  color:#22c55e;
  margin-bottom:.2rem;
}

.sugerencia small{
  color:#6b7280;
  font-size: 0.75rem;
}

/* GRAFICAS */
.graficas{
  display:grid;
  grid-template-columns: 1fr;
  gap:0.75rem;
}

.grafica-card{
  background:white;
  padding:0.85rem;
  border-radius:14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  overflow:hidden;
}

.grafica-card h3{
  margin-top:0;
  margin-bottom:0.75rem;
  font-size:0.9rem;
  color:#111827;
}

/* Contenedor estricto para evitar desbordes en Chart.js en móviles */
.chart-container {
  position: relative;
  width: 100%;
  height: 240px;
}

.doughnut-container {
  height: 220px;
  max-width: 320px;
  margin: 0 auto;
}

.span-full {
  grid-column: 1 / -1;
}

.text-muted {
  color: #6b7280;
  font-size: 0.8rem;
  text-align: center;
  padding: 3rem 0;
}

/* TABLET & DESKTOP BREAKPOINTS */
@media(min-width: 640px){
  .dashboard { padding: 1rem; }
  .cards { grid-template-columns: repeat(3, 1fr); }
  .topbar h2 { font-size: 1.6rem; }
  .chart-container { height: 280px; }
}

@media(min-width: 1024px){
  .cards { grid-template-columns: repeat(6, 1fr); }
  .graficas { grid-template-columns: repeat(2, 1fr); }
  .span-full { grid-column: span 2; }
  .chart-container { height: 300px; }
}
</style>