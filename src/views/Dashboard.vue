<template>
  <div class="dashboard">

    <header class="topbar">
      <div>
        <h2>Dashboard Agrícola</h2>
        <p>Resumen financiero de cultivos</p>
      </div>
    </header>

    <!-- FILTROS -->
    <div class="filtros">
      <button
        class="filtro-btn"
        :class="{ activo: filtroCultivo === '' }"
        @click="filtroCultivo = ''"
      >
        Todos
      </button>

      <button
        v-for="cultivo in cultivosUnicos"
        :key="cultivo"
        class="filtro-btn"
        :class="{ activo: filtroCultivo === cultivo }"
        @click="filtroCultivo = cultivo"
      >
        {{ cultivo }}
      </button>
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

      <div class="card balance">
        <span>Ganancia</span>
        <h3>C$ {{ balance.toFixed(2) }}</h3>
      </div>

      <div class="card plantas">
        <span>Plantas</span>
        <h3>{{ totalPlantas }}</h3>
      </div>

      <div class="card promedio">
        <span>Costo Planta</span>
        <h3>C$ {{ precioPorPlanta }}</h3>
      </div>

    </div>

    <!-- SUGERENCIA -->
    <div class="sugerencia">
      <h3>Sugerencia de Venta</h3>

      <p>
        Para ganar un <strong>100%</strong> sobre inversión:
      </p>

      <div class="precio-recomendado">
        C$ {{ (precioPorPlanta * 2).toFixed(2) }}
      </div>

      <small>
        Precio recomendado por planta/piña.
      </small>
    </div>

    <!-- GRAFICAS -->
    <div class="graficas">

      <div class="grafica-card">
        <h3>Ingresos vs Egresos</h3>

        <Bar
          :data="barData"
          :options="chartOptions"
        />
      </div>

      <div class="grafica-card">
        <h3>Ganancias por Cultivo</h3>

        <Pie
          :data="pieData"
          :options="chartOptions"
        />
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

import { Bar, Pie } from 'vue-chartjs'

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

const filtroCultivo = ref('')

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

const ingresosFiltrados = computed(() => {
  if (!filtroCultivo.value) return ingresos.value

  return ingresos.value.filter(
    i => i.cultivo === filtroCultivo.value
  )
})

const egresosFiltrados = computed(() => {
  if (!filtroCultivo.value) return egresos.value

  return egresos.value.filter(
    e => e.cultivo === filtroCultivo.value
  )
})

const cultivosFiltradosData = computed(() => {
  if (!filtroCultivo.value) return cultivos.value

  return cultivos.value.filter(
    c => c.nombre === filtroCultivo.value
  )
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

const totalPlantas = computed(() =>
  cultivosFiltradosData.value.reduce(
    (acc, item) => acc + Number(item.cantPlantas || 0),
    0
  )
)

const precioPorPlanta = computed(() => {

  if (totalPlantas.value <= 0) return 0

  return (
    totalEgresos.value / totalPlantas.value
  ).toFixed(2)
})

const ingresosPorCultivo = computed(() =>
  cultivosUnicos.value.map(cultivo => {

    return ingresos.value
      .filter(i => i.cultivo === cultivo)
      .reduce((acc, item) =>
        acc + Number(item.ingresos || 0), 0)
  })
)

const egresosPorCultivo = computed(() =>
  cultivosUnicos.value.map(cultivo => {

    return egresos.value
      .filter(e => e.cultivo === cultivo)
      .reduce((acc, item) =>
        acc + Number(item.monto || 0), 0)
  })
)

const gananciasPorCultivo = computed(() =>
  cultivosUnicos.value.map((_, index) =>
    ingresosPorCultivo.value[index] -
    egresosPorCultivo.value[index]
  )
)

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

  plugins: {
    legend: {
      labels: {
        color: '#374151'
      }
    }
  },

  scales: {
    x: {
      ticks: {
        color: '#374151'
      }
    },

    y: {
      ticks: {
        color: '#374151'
      }
    }
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
  padding:1rem;
  box-sizing:border-box;
  font-family:Arial, sans-serif;
}

/* HEADER */

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1.2rem;
  gap:1rem;
}

.topbar h2{
  margin:0;
  font-size:1.7rem;
  color:#111827;
  font-weight:700;
}

.topbar p{
  margin-top:.25rem;
  color:#6b7280;
  font-size:.95rem;
}

/* FILTROS */

.filtros{
  display:flex;
  gap:.6rem;
  flex-wrap:wrap;
  margin-bottom:1.2rem;
}

.filtro-btn{
  border:none;
  padding:.55rem 1rem;
  border-radius:999px;
  background:#f3f4f6;
  cursor:pointer;
  font-weight:600;
  transition:.25s;
  font-size:.82rem;
  color:#374151;
}

.filtro-btn:hover{
  background:#dcfce7;
  color:#15803d;
}

.filtro-btn.activo{
  background:#22c55e;
  color:white;
  box-shadow:0 4px 12px rgba(34,197,94,.25);
}

/* CARDS */

.cards{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(170px,1fr));
  gap:1rem;
  margin-bottom:1.2rem;
}

.card{
  background:white;
  border-radius:18px;
  padding:1rem;
  box-shadow:
  0 4px 18px rgba(0,0,0,.05);
  transition:.25s;
  overflow:hidden;
  position:relative;
}

.card:hover{
  transform:translateY(-2px);
}

.card::before{
  content:'';
  position:absolute;
  left:0;
  top:0;
  width:5px;
  height:100%;
}

.ingreso::before{
  background:#22c55e;
}

.egreso::before{
  background:#ef4444;
}

.balance::before{
  background:#3b82f6;
}

.plantas::before{
  background:#f59e0b;
}

.promedio::before{
  background:#8b5cf6;
}

.card span{
  display:block;
  font-size:.78rem;
  color:#6b7280;
  margin-bottom:.4rem;
  font-weight:600;
}

.card h3{
  margin:0;
  font-size:1.15rem;
  color:#111827;
  font-weight:700;
  word-break:break-word;
}

/* SUGERENCIA */

.sugerencia{
  background:white;
  padding:1.2rem;
  border-radius:20px;
  margin-bottom:1.2rem;
  box-shadow:
  0 4px 18px rgba(0,0,0,.05);
}

.sugerencia h3{
  margin-top:0;
  margin-bottom:.6rem;
  color:#111827;
}

.sugerencia p{
  color:#4b5563;
  margin-bottom:.6rem;
}

.precio-recomendado{
  font-size:2rem;
  font-weight:800;
  color:#22c55e;
  margin-bottom:.3rem;
}

.sugerencia small{
  color:#6b7280;
}

/* GRAFICAS */

.graficas{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(320px,1fr));
  gap:1rem;
}

.grafica-card{
  background:white;
  padding:1rem;
  border-radius:20px;
  box-shadow:
  0 4px 18px rgba(0,0,0,.05);
  overflow:hidden;
}

.grafica-card h3{
  margin-top:0;
  margin-bottom:1rem;
  font-size:1rem;
  color:#111827;
}

/* TABLET */

@media(max-width:900px){

  .cards{
    grid-template-columns:
    repeat(2,1fr);
  }

  .graficas{
    grid-template-columns:1fr;
  }
}

/* MOBILE */

@media(max-width:640px){

  .dashboard{
    padding:.8rem;
    padding-bottom:6rem;
  }

  .topbar{
    flex-direction:column;
    align-items:flex-start;
  }

  .topbar h2{
    font-size:1.35rem;
  }

  .topbar p{
    font-size:.85rem;
  }

  .filtros{
    gap:.45rem;
  }

  .filtro-btn{
    padding:.45rem .85rem;
    font-size:.72rem;
  }

  .cards{
    grid-template-columns:
    repeat(2,1fr);
    gap:.7rem;
  }

  .card{
    padding:.8rem;
    border-radius:15px;
  }

  .card span{
    font-size:.68rem;
  }

  .card h3{
    font-size:.92rem;
  }

  .sugerencia{
    padding:1rem;
    border-radius:16px;
  }

  .precio-recomendado{
    font-size:1.5rem;
  }

  .grafica-card{
    padding:.8rem;
    border-radius:16px;
  }

  .grafica-card h3{
    font-size:.92rem;
  }
}

/* MOBILE PEQUEÑO */

@media(max-width:420px){

  .cards{
    grid-template-columns:
    repeat(2,1fr);
    gap:.7rem;
  }

  .card h3{
    font-size:1rem;
  }

  .precio-recomendado{
    font-size:1.3rem;
  }
}
</style>