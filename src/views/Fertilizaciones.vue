<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { supabase } from '../supabase'
import { Icon } from '@iconify/vue'

/* =========================
   ESTADOS
========================= */

const vista = ref('clima')

const cultivos = ref([])
const cultivoSeleccionado = ref(null)

const fertilizaciones = ref([])

const climaActual = ref(null)
const horas = ref([])
const dias = ref([])

const mensajeRecomendacion = ref('')

const modal = ref(false)
const modalEliminar = ref(false)

const editando = ref(false)

const eliminarId = ref(null)

let editId = null
let userId = null

const nuevo = ref({
  cultivo: '',
  fertilizante: '',
  fecha: '',
  proxima_fecha: '',
  observacion: ''
})

const API_KEY =
'1a795806fc52f7b5b901dc0dd43a038f'

/* =========================
   USUARIO
========================= */

const obtenerUsuario = async () => {

  const { data } =
    await supabase.auth.getUser()

  userId =
    data.user?.id || null
}

/* =========================
   CULTIVOS
========================= */

const cargarCultivos = async () => {

  const { data } =
    await supabase
      .from('cultivos')
      .select('*')
      .eq('user_id', userId)

  cultivos.value = data || []

  if (
    cultivos.value.length > 0
  ) {

    seleccionarCultivo(
      cultivos.value[0]
    )
  }
}

const seleccionarCultivo = async (
  cultivo
) => {

  cultivoSeleccionado.value =
    cultivo

  await obtenerClima()
}

/* =========================
   CLIMA
========================= */

const obtenerClima = async () => {

  try {

    if (
      !cultivoSeleccionado.value
    ) return

    const lat =
      cultivoSeleccionado.value.lat

    const lng =
      cultivoSeleccionado.value.lng

    const url =
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric&lang=es`

    const res =
      await fetch(url)

    const data =
      await res.json()

    if (data.cod !== '200') {

      mensajeRecomendacion.value =
        'No se pudo obtener el clima.'

      return
    }

    const actual =
      data.list[0]

    climaActual.value = {

      temp:
        actual.main.temp,

      humidity:
        actual.main.humidity,

      weather:
        actual.weather,

      wind_speed:
        actual.wind.speed,

      rain: {
        '1h':
          actual.rain?.['3h'] || 0
      }
    }

    horas.value =
      data.list.slice(0, 8)

    dias.value =
      data.list.filter(
        (_, index) =>
          index % 8 === 0
      )

    generarRecomendacion()

  } catch (error) {

    console.log(error)

    mensajeRecomendacion.value =
      'Error al consultar clima.'
  }
}

const generarRecomendacion = () => {

  const lluvia =
    climaActual.value?.rain?.['1h']
    || 0

  const humedad =
    climaActual.value?.humidity
    || 0

  if (
    lluvia >= 1 &&
    lluvia <= 6 &&
    humedad >= 60
  ) {

    mensajeRecomendacion.value =
      'Buen momento para fertilizar. Lluvia moderada y humedad favorable.'

    enviarNotificacion(
      'Buen clima para fertilizar'
    )

  } else if (lluvia > 10) {

    mensajeRecomendacion.value =
      'Demasiada lluvia. No se recomienda fertilizar.'

    enviarNotificacion(
      'Lluvia fuerte en el cultivo'
    )

  } else {

    mensajeRecomendacion.value =
      'Condiciones moderadas.'
  }
}

/* =========================
   NOTIFICACIONES
========================= */

const activarNotificaciones =
async () => {

  if (
    !('Notification' in window)
  ) {

    alert(
      'Tu navegador no soporta notificaciones'
    )

    return
  }

  const permiso =
    await Notification.requestPermission()

  if (
    permiso === 'granted'
  ) {

    new Notification(
      'Notificaciones activadas',
      {
        body:
          'Recibirás alertas del clima y fertilizaciones.'
      }
    )

    verificarNotificaciones()
  }
}

const enviarNotificacion = (
  mensaje
) => {

  if (
    Notification.permission ===
    'granted'
  ) {

    new Notification(
      'Alerta agrícola',
      {
        body:
          `${cultivoSeleccionado.value?.nombre}: ${mensaje}`
      }
    )
  }
}

const verificarNotificaciones = () => {

  fertilizaciones.value.forEach(
    item => {

      const dias =
        diasRestantes(
          item.proxima_fecha
        )

      if (
        dias <= 3 &&
        Notification.permission ===
        'granted'
      ) {

        new Notification(
          'Fertilización próxima',
          {
            body:
              `${item.cultivo} necesita fertilización en ${dias} días`
          }
        )
      }
    }
  )
}

/* =========================
   CRUD
========================= */

const cargarFertilizaciones =
async () => {

  const { data } =
    await supabase
      .from('fertilizaciones')
      .select('*')
      .eq('user_id', userId)
      .order('proxima_fecha', {
        ascending: true
      })

  fertilizaciones.value =
    data || []
}

const abrirModal = () => {

  nuevo.value = {
    cultivo: '',
    fertilizante: '',
    fecha: '',
    proxima_fecha: '',
    observacion: ''
  }

  editando.value = false

  modal.value = true
}

const cerrarModal = () => {

  modal.value = false
}

const guardar = async () => {

  const datos = {
    ...nuevo.value,
    user_id: userId
  }

  if (editando.value) {

    await supabase
      .from('fertilizaciones')
      .update(datos)
      .eq('id', editId)

  } else {

    await supabase
      .from('fertilizaciones')
      .insert([datos])
  }

  cerrarModal()

  cargarFertilizaciones()
}

const editar = (item) => {

  nuevo.value = { ...item }

  editId = item.id

  editando.value = true

  modal.value = true
}

const abrirEliminar = (id) => {

  eliminarId.value = id

  modalEliminar.value = true
}

const cerrarEliminar = () => {

  modalEliminar.value = false
}

const confirmarEliminar =
async () => {

  await supabase
    .from('fertilizaciones')
    .delete()
    .eq('id', eliminarId.value)

  cerrarEliminar()

  cargarFertilizaciones()
}

/* =========================
   UTILS
========================= */

const diasRestantes = (
  fecha
) => {

  const hoy =
    new Date()

  const futura =
    new Date(fecha)

  const diff =
    futura - hoy

  return Math.ceil(
    diff /
    (1000 * 60 * 60 * 24)
  )
}

const iconoClima = (
  icono
) => {

  return `https://openweathermap.org/img/wn/${icono}@2x.png`
}

const formatearHora = (
  timestamp
) => {

  return new Date(
    timestamp * 1000
  ).toLocaleTimeString(
    'es-NI',
    {
      hour: 'numeric'
    }
  )
}

const formatearDia = (
  timestamp
) => {

  return new Date(
    timestamp * 1000
  ).toLocaleDateString(
    'es-NI',
    {
      weekday: 'short'
    }
  )
}

const proximas = computed(() => {

  return fertilizaciones.value.filter(
    item =>
      diasRestantes(
        item.proxima_fecha
      ) <= 3
  ).length
})

/* =========================
   INIT
========================= */

onMounted(async () => {

  await obtenerUsuario()

  if (!userId) return

  await cargarCultivos()

  await cargarFertilizaciones()
})
</script>

<template>
  <div class="clima-page">

    <!-- HEADER -->

    <div class="topbar">

      <div>
        <h2>
          Clima Agrícola
        </h2>

        <p>
          Pronóstico y fertilizaciones
        </p>
      </div>

      <div class="top-actions">

        <button
          class="btn-notificaciones"
          @click="activarNotificaciones"
        >
          <Icon icon="mdi:bell-outline" />
          Activar Notificaciones
        </button>

        <button
          class="btn-refresh"
          @click="obtenerClima"
        >
          <Icon icon="mdi:refresh" />
          Actualizar
        </button>

      </div>

    </div>

    <!-- SUBVISTAS -->

    <div class="tabs">

      <button
        :class="{ active: vista === 'clima' }"
        @click="vista = 'clima'"
      >
        Clima
      </button>

      <button
        :class="{ active: vista === 'fertilizaciones' }"
        @click="vista = 'fertilizaciones'"
      >
        Fertilizaciones
      </button>

    </div>

    <!-- CLIMA -->

    <div v-if="vista === 'clima'">

      <!-- CULTIVOS -->

      <div class="cultivos-scroll">

        <button
          v-for="cultivo in cultivos"
          :key="cultivo.id"
          class="cultivo-btn"
          :class="{
            activo:
            cultivoSeleccionado?.id === cultivo.id
          }"
          @click="seleccionarCultivo(cultivo)"
        >
          {{ cultivo.nombre }}
        </button>

      </div>

      <!-- CLIMA ACTUAL -->

      <div
        v-if="climaActual"
        class="clima-actual"
      >

        <div class="temp-box">

          <img
            :src="iconoClima(climaActual.weather[0].icon)"
          >

          <div>

            <h1>
              {{ Math.round(climaActual.temp) }}°
            </h1>

            <span>
              {{ climaActual.weather[0].description }}
            </span>

          </div>

        </div>

        <div class="detalle-clima">

          <div class="item">
            <strong>Humedad</strong>
            <p>
              {{ climaActual.humidity }}%
            </p>
          </div>

          <div class="item">
            <strong>Lluvia</strong>
            <p>
              {{
                climaActual.rain?.['1h']
                || 0
              }} mm
            </p>
          </div>

          <div class="item">
            <strong>Viento</strong>
            <p>
              {{ climaActual.wind_speed }} km/h
            </p>
          </div>

        </div>

      </div>

      <!-- ALERTA -->

      <div
        v-if="mensajeRecomendacion"
        class="alerta"
      >

        <Icon
          icon="mdi:weather-cloudy-alert"
        />

        <div >

          <strong>
            Recomendación agrícola
          </strong>

          <p>
            {{ mensajeRecomendacion }}
          </p>

        </div>

      </div>

    </div>

    <!-- FERTILIZACIONES -->

    <div
      v-if="
        vista ===
        'fertilizaciones'
      "
    >

      <div class="resumen">

        <div class="card-mini">

          <span>Total</span>

          <h3>
            {{
              fertilizaciones.length
            }}
          </h3>

        </div>

        <div class="card-mini">

          <span>Próximas</span>

          <h3>
            {{ proximas }}
          </h3>

        </div>

      </div>

      <div class="acciones-top">

        <button
          class="btn-fertilizar"
          @click="abrirModal"
        >
          + Nueva fertilización
        </button>

      </div>

      <div class="fert-grid">

        <div
          v-for="item in fertilizaciones"
          :key="item.id"
          class="fert-card"
        >

          <div class="fert-header">

            <div>

              <h3>
                {{ item.cultivo }}
              </h3>

              <span>
                {{ item.fertilizante }}
              </span>

            </div>

            <div
              class="estado"
              :class="{
                urgente:
                diasRestantes(
                  item.proxima_fecha
                ) <= 3
              }"
            >
              {{
                diasRestantes(
                  item.proxima_fecha
                )
              }} días
            </div>

          </div>

          <div class="fert-body">

            <p>
              <strong>Aplicado:</strong>
              {{ item.fecha }}
            </p>

            <p>
              <strong>Próxima:</strong>
              {{ item.proxima_fecha }}
            </p>

          </div>

          <div class="fert-actions">

            <button
              class="btn-edit"
              @click="editar(item)"
            >
              <Icon
                icon="mdi:pencil-outline"
              />
            </button>

            <button
              class="btn-delete"
              @click="abrirEliminar(item.id)"
            >
              <Icon
                icon="mdi:delete-outline"
              />
            </button>

          </div>

        </div>

      </div>

    </div>

    <!-- MODAL -->

    <div
      v-if="modal"
      class="modal-overlay"
      @click.self="cerrarModal"
    >

      <div class="modal">

        <h3>
          {{
            editando
            ? 'Editar fertilización'
            : 'Nueva fertilización'
          }}
        </h3>

        <form @submit.prevent="guardar">

          <select
            v-model="nuevo.cultivo"
            required
          >

            <option value="">
              Seleccionar cultivo
            </option>

            <option
              v-for="cultivo in cultivos"
              :key="cultivo.id"
              :value="cultivo.nombre"
            >
              {{ cultivo.nombre }}
            </option>

          </select>

          <input
            v-model="nuevo.fertilizante"
            type="text"
            placeholder="Fertilizante"
            required
          >

          <div class="grid-form">

            <input
              v-model="nuevo.fecha"
              type="date"
              required
            >

            <input
              v-model="nuevo.proxima_fecha"
              type="date"
              required
            >

          </div>

          <textarea
            v-model="nuevo.observacion"
            placeholder="Observación"
          ></textarea>

          <div class="modal-actions">

            <button
              type="button"
              class="cancelar"
              @click="cerrarModal"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="guardar"
            >
              Guardar
            </button>

          </div>

        </form>

      </div>

    </div>

    <!-- MODAL ELIMINAR -->

    <div
      v-if="modalEliminar"
      class="modal-overlay"
      @click.self="cerrarEliminar"
    >

      <div class="modal delete-modal">

        <div class="delete-icon">

          <Icon
            icon="mdi:alert-circle-outline"
          />

        </div>

        <h3>
          Eliminar fertilización
        </h3>

        <p>
          ¿Deseas eliminar este registro?
        </p>

        <div class="modal-actions">

          <button
            class="cancelar"
            @click="cerrarEliminar"
          >
            Cancelar
          </button>

          <button
            class="btn-delete-confirm"
            @click="confirmarEliminar"
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>
.clima-page{
  width:90%;
  max-width:1400px;
  margin:auto;
  padding:1rem;
  padding-bottom:7rem;
}

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;
  flex-wrap:wrap;
  margin-bottom:1rem;
}

.top-actions{
  display:flex;
  gap:1rem;
  flex-wrap:wrap;
  width: 90%!important;


}

.tabs{
  display:flex;
  gap:1rem;
  margin-bottom:1rem;
}

.tabs button{
  border:none;
  padding:.9rem 1.2rem;
  border-radius:14px;
  background:#f3f4f6;
  cursor:pointer;
}

.tabs .active{
  background:#22c55e;
  color:white;
}

.btn-refresh,
.btn-notificaciones,
.btn-fertilizar{
  border:none;
  background:#22c55e;
  color:white;
  padding:.9rem 1.2rem;
  border-radius:14px;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:.5rem;
}

.cultivos-scroll{
  display:flex;
  gap:.8rem;
  overflow:auto;
  padding-bottom:.5rem;
  margin-bottom:1rem;
}

.cultivo-btn{
  border:none;
  background:white;
  padding:.8rem 1rem;
  border-radius:999px;
  cursor:pointer;
  white-space:nowrap;
}

.cultivo-btn.activo{
  background:#22c55e;
  color:white;
}

.clima-actual{
  background:
  linear-gradient(135deg,#6feb9d,#098637);
  color:white;
  border-radius:30px;
  padding:1.5rem;
}

.temp-box{
  display:flex;
  align-items:center;
  gap:1rem;
}

.detalle-clima{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(120px,1fr));
  gap:1rem;
  margin-top:1rem;
}

.item{
  background:
  rgba(255,255,255,.15);
  padding:1rem;
  border-radius:18px;
}

.alerta{
  display:flex;
  gap:1rem;
  background:#ecfccb;
  margin-top:1rem;
  padding:1rem;
  border-radius:18px;
}

.resumen{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(160px,1fr));
  gap:1rem;
  margin-bottom:1rem;
}

.card-mini{
  background:white;
  padding:1rem;
  border-radius:20px;
}

.acciones-top{
  display:flex;
  justify-content:flex-end;
  margin-bottom:1rem;
}

.fert-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(280px,1fr));
  gap:1rem;
}

.fert-card{
  background:white;
  padding:1rem;
  border-radius:24px;
}

.fert-header{
  display:flex;
  justify-content:space-between;
  gap:1rem;
}

.estado{
  background:#dcfce7;
  color:#166534;
  padding:.4rem .8rem;
  border-radius:999px;
}

.estado.urgente{
  background:#fee2e2;
  color:#b91c1c;
}

.fert-actions{
  display:flex;
  justify-content:flex-end;
  gap:.7rem;
  margin-top:1rem;
}

.btn-edit,
.btn-delete{
  width:44px;
  height:44px;
  border:none;
  border-radius:14px;
  cursor:pointer;
}

.btn-edit{
  background:#e0e7ff;
}

.btn-delete{
  background:#fee2e2;
}

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  padding:1rem;
  z-index:999;
}

.modal{
  background:white;
  width:100%;
  max-width:500px;
  border-radius:28px;
  padding:1.4rem;
}

.modal form{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.modal input,
.modal select,
.modal textarea{
  width:100%;
  padding:.9rem;
  border-radius:14px;
  border:1px solid #e5e7eb;
}

.grid-form{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:.8rem;
}

.modal-actions{
  display:flex;
  gap:.8rem;
}

.modal-actions button{
  flex:1;
  border:none;
  padding:.9rem;
  border-radius:14px;
  cursor:pointer;
}

.cancelar{
  background:#ef4444;
  color:white;
}

.guardar{
  background:#22c55e;
  color:white;
}

.delete-icon{
  width:80px;
  height:80px;
  background:#fee2e2;
  color:#dc2626;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:auto;
  margin-bottom:1rem;
}

.btn-delete-confirm{
  background:#dc2626;
  color:white;
}

@media(max-width:768px){

  .clima-page{
    padding:.8rem;
  }

  .topbar{
    flex-direction:column;
    align-items:stretch;
  }

  .top-actions{
    width:100%;
    flex-direction:row;
  }

  .btn-refresh,
  .btn-notificaciones,
  .btn-fertilizar{
    width:40%;
    justify-content:center;
  }

  .tabs{
    overflow:auto;
  }
  .temp-box{
    flex-direction:column;
    text-align:center;
  }

  .grid-form{
    grid-template-columns:1fr;
  }

  .modal-actions{
    flex-direction:column;
  }

  .fert-grid{
    grid-template-columns:1fr;
  }
  .fert-card{
    padding: 1rem !important;
    border: 1px solid #9df3ab !important;
  }
 
  .alerta{
    margin-bottom:60px;
  }
  
  .modal input, textarea{
    width: 90%!important;
  }

}
</style>