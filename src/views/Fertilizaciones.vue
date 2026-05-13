<template>
  <div class="fertilizacion">

    <!-- HEADER -->

    <div class="topbar">

      <div>
        <h2>Fertilizaciones</h2>
        <p>
          Control y alertas inteligentes
        </p>
      </div>

      <button
        class="btn-agregar"
        @click="abrirModal"
      >
        + Nueva
      </button>

    </div>

    <!-- RESUMEN -->

    <div class="cards">

      <div class="mini-card">
        <span>Total</span>
        <h3>{{ fertilizaciones.length }}</h3>
      </div>

      <div class="mini-card alerta">
        <span>Próximas</span>
        <h3>{{ proximas }}</h3>
      </div>

      <div class="mini-card clima">
        <span>Clima</span>
        <h3>{{ climaTexto }}</h3>
      </div>

    </div>

    <!-- CULTIVOS -->

    <div
      v-if="cultivos.length"
      class="cultivos-clima"
    >

      <button
        v-for="cultivo in cultivos"
        :key="cultivo.id"
        class="btn-cultivo"
        :class="{
          activo:
          cultivoActivo?.id === cultivo.id
        }"
        @click="seleccionarCultivo(cultivo)"
      >
        <Icon icon="mdi:leaf" />
        {{ cultivo.nombre }}
      </button>

    </div>

    <!-- CLIMA -->

    <div
      v-if="cultivoActivo"
      class="clima-box"
    >

      <div class="clima-header">

        <div>
          <h3>
            {{ cultivoActivo.nombre }}
          </h3>

          <small>
            Clima del cultivo seleccionado
          </small>
        </div>

        <div class="estado-clima">
          {{ climaTexto }}
        </div>

      </div>

      <div class="alerta-clima">

        <Icon icon="mdi:weather-partly-rainy" />

        <div>

          <strong>
            Recomendación
          </strong>

          <p>
            {{ alertaClima }}
          </p>

        </div>

      </div>

    </div>

    <!-- LISTA -->

    <div class="lista">

      <div
        v-for="item in fertilizaciones"
        :key="item.id"
        class="card"
      >

        <div class="header-card">

          <div>
            <h3>{{ item.cultivo }}</h3>

            <small>
              {{ item.fertilizante }}
            </small>
          </div>

          <span
            class="estado"
            :class="{
              vencido:
              diasRestantes(item.proxima_fecha) <= 3
            }"
          >
            {{
              diasRestantes(item.proxima_fecha) <= 0
              ? 'Hoy'
              : diasRestantes(item.proxima_fecha) + ' días'
            }}
          </span>

        </div>

        <div class="contenido">

          <p>
            <strong>Aplicado:</strong>
            {{ item.fecha }}
          </p>

          <p>
            <strong>Próxima:</strong>
            {{ item.proxima_fecha }}
          </p>

          <p v-if="item.observacion">
            <strong>Obs:</strong>
            {{ item.observacion }}
          </p>

        </div>

        <div class="acciones">

          <button
            class="editar"
            @click="editar(item)"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>

          <button
            class="eliminar"
            @click="abrirEliminar(item.id)"
          >
            <Icon icon="mdi:delete-outline" />
          </button>

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

        <div class="modal-header">

          <h3>
            {{
              editando
              ? 'Editar'
              : 'Nueva fertilización'
            }}
          </h3>

          <button
            class="cerrar"
            @click="cerrarModal"
          >
            ✕
          </button>

        </div>

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
          />

          <div class="grid">

            <div>

              <label>
                Fecha aplicación
              </label>

              <input
                v-model="nuevo.fecha"
                type="date"
                required
              />

            </div>

            <div>

              <label>
                Próxima fecha
              </label>

              <input
                v-model="nuevo.proxima_fecha"
                type="date"
                required
              />

            </div>

          </div>

          <textarea
            v-model="nuevo.observacion"
            placeholder="Observación"
          ></textarea>

          <div class="acciones-modal">

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
              {{
                editando
                ? 'Actualizar'
                : 'Guardar'
              }}
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

      <div class="modal modal-eliminar">

        <div class="icono-eliminar">
          <Icon icon="mdi:alert-circle-outline" />
        </div>

        <h3>
          Eliminar registro
        </h3>

        <p>
          ¿Deseas eliminar esta fertilización?
        </p>

        <div class="acciones-modal">

          <button
            class="cancelar"
            @click="cerrarEliminar"
          >
            Cancelar
          </button>

          <button
            class="btn-eliminar"
            @click="confirmarEliminar"
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { supabase } from '../supabase'

import { Icon } from '@iconify/vue'

const fertilizaciones = ref([])
const cultivos = ref([])

const modal = ref(false)
const modalEliminar = ref(false)

const editando = ref(false)

const climaTexto = ref('Sin datos')
const alertaClima = ref('')

const cultivoActivo = ref(null)

let userId = null
let editId = null

const eliminarId = ref(null)

const nuevo = ref({
  cultivo: '',
  fertilizante: '',
  fecha: '',
  proxima_fecha: '',
  observacion: ''
})

const obtenerUsuario = async () => {

  const { data } =
    await supabase.auth.getUser()

  userId = data.user?.id || null
}

const cargarCultivos = async () => {

  if (!userId) return

  const { data } = await supabase
    .from('cultivos')
    .select('*')
    .eq('user_id', userId)

  cultivos.value = data || []
}

const cargarDatos = async () => {

  if (!userId) return

  const { data } = await supabase
    .from('fertilizaciones')
    .select('*')
    .eq('user_id', userId)
    .order('proxima_fecha', {
      ascending: true
    })

  fertilizaciones.value = data || []
}

const seleccionarCultivo = async (cultivo) => {

  cultivoActivo.value = cultivo

  if (
    !cultivo.lat ||
    !cultivo.lng
  ) {

    climaTexto.value = 'Sin ubicación'

    alertaClima.value =
      'Este cultivo no tiene coordenadas.'

    return
  }

  await obtenerClima(
    cultivo.lat,
    cultivo.lng
  )
}

const guardar = async () => {

  const dataGuardar = {
    ...nuevo.value,
    user_id: userId
  }

  if (editando.value) {

    await supabase
      .from('fertilizaciones')
      .update(dataGuardar)
      .eq('id', editId)

  } else {

    await supabase
      .from('fertilizaciones')
      .insert([dataGuardar])
  }

  cerrarModal()

  cargarDatos()
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

const confirmarEliminar = async () => {

  await supabase
    .from('fertilizaciones')
    .delete()
    .eq('id', eliminarId.value)

  cerrarEliminar()

  cargarDatos()
}

const cerrarEliminar = () => {

  modalEliminar.value = false

  eliminarId.value = null
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

const diasRestantes = (fecha) => {

  const hoy = new Date()

  const futura = new Date(fecha)

  const diff = futura - hoy

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  )
}

const proximas = computed(() => {

  return fertilizaciones.value.filter(
    item =>
      diasRestantes(item.proxima_fecha) <= 3
  ).length
})

const obtenerClima = async (lat, lng) => {

  try {

    climaTexto.value = 'Consultando...'

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&timezone=auto`

    const res = await fetch(url)

    const data = await res.json()

    if (!data.current) {

      climaTexto.value = 'Sin datos'

      alertaClima.value =
        'No se pudo obtener clima.'

      return
    }

    const lluvia =
      data.current.precipitation || 0

    const temp =
      data.current.temperature_2m || 0

    if (lluvia > 5) {

      climaTexto.value = 'Lluvioso'

      alertaClima.value =
        'No se recomienda fertilizar por lluvia.'

    } else if (temp > 34) {

      climaTexto.value = 'Caluroso'

      alertaClima.value =
        'Fertiliza temprano o al final de la tarde.'

    } else {

      climaTexto.value = 'Bueno'

      alertaClima.value =
        'Buenas condiciones para fertilizar.'
    }

  } catch (error) {

    console.log(error)

    climaTexto.value = 'Error'

    alertaClima.value =
      'Error consultando clima.'
  }
}

const pedirPermiso = async () => {

  if ('Notification' in window) {

    await Notification.requestPermission()
  }
}

const verificarNotificaciones = () => {

  fertilizaciones.value.forEach(item => {

    const dias =
      diasRestantes(item.proxima_fecha)

    if (
      dias <= 3 &&
      Notification.permission === 'granted'
    ) {

      new Notification(
        'Fertilización próxima',
        {
          body:
            `${item.cultivo} necesita fertilización en ${dias} días`
        }
      )
    }
  })
}

onMounted(async () => {

  await obtenerUsuario()

  if (!userId) return

  await cargarCultivos()

  await cargarDatos()

  await pedirPermiso()

  verificarNotificaciones()

  if (cultivos.value.length) {

    seleccionarCultivo(
      cultivos.value[0]
    )
  }
})
</script>

<style scoped>
.fertilizacion{
  width:95%;
  margin:auto;
  padding:1rem;
  font-family:Arial,sans-serif;
}

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;
  margin-bottom:1rem;
}

.btn-agregar{
  border:none;
  background:#22c55e;
  color:white;
  padding:.9rem 1.2rem;
  border-radius:14px;
  cursor:pointer;
  font-weight:bold;
}

.cards{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
  gap:1rem;
  margin-bottom:1rem;
}

.mini-card{
  background:white;
  padding:1rem;
  border-radius:18px;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.alerta{
  border-left:5px solid #f59e0b;
}

.clima{
  border-left:5px solid #3b82f6;
}

/* CULTIVOS */

.cultivos-clima{
  display:flex;
  gap:.8rem;
  overflow-x:auto;
  padding-bottom:.5rem;
  margin-bottom:1rem;
}

.btn-cultivo{
  border:none;
  background:white;
  padding:.9rem 1rem;
  border-radius:16px;
  display:flex;
  align-items:center;
  gap:.5rem;
  cursor:pointer;
  white-space:nowrap;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
  font-weight:600;
}

.btn-cultivo svg{
  color:#22c55e;
}

.btn-cultivo.activo{
  background:#22c55e;
  color:white;
}

.btn-cultivo.activo svg{
  color:white;
}

/* CLIMA */

.clima-box{
  background:white;
  border-radius:24px;
  padding:1rem;
  margin-bottom:1rem;
  box-shadow:0 3px 12px rgba(0,0,0,.05);
}

.clima-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;
  margin-bottom:1rem;
}

.estado-clima{
  background:#dbeafe;
  color:#1d4ed8;
  padding:.5rem .9rem;
  border-radius:999px;
  font-size:.8rem;
  font-weight:bold;
}

.alerta-clima{
  display:flex;
  gap:1rem;
  background:#f0fdf4;
  border-radius:18px;
  padding:1rem;
}

.alerta-clima svg{
  font-size:2rem;
  color:#22c55e;
}

/* LISTA */

.lista{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(280px,1fr));
  gap:1rem;
}

.card{
  background:white;
  border-radius:20px;
  padding:1rem;
  box-shadow:0 3px 12px rgba(0,0,0,.05);
}

.header-card{
  display:flex;
  justify-content:space-between;
  gap:1rem;
}

.estado{
  background:#dcfce7;
  color:#166534;
  padding:.35rem .7rem;
  border-radius:999px;
  font-size:.75rem;
}

.estado.vencido{
  background:#fee2e2;
  color:#991b1b;
}

.acciones{
  display:flex;
  justify-content:flex-end;
  gap:.6rem;
  margin-top:1rem;
}

.acciones button{
  width:42px;
  height:42px;
  border:none;
  border-radius:12px;
  cursor:pointer;
}

.editar{
  background:#dcfce7;
}

.eliminar{
  background:#fee2e2;
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
  padding:1rem;
}

.modal{
  background:white;
  width:100%;
  max-width:500px;
  border-radius:24px;
  padding:1.2rem;
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}

.cerrar{
  border:none;
  background:#f3f4f6;
  width:35px;
  height:35px;
  border-radius:50%;
  cursor:pointer;
}

.modal form{
  display:flex;
  flex-direction:column;
  gap:.9rem;
}

.modal input,
.modal select,
.modal textarea{
  width:90%;
  padding:.9rem;
  border-radius:14px;
  border:1px solid #e5e7eb;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:.8rem;
}

textarea{
  min-height:90px;
  resize:none;
}

.acciones-modal{
  display:flex;
  gap:.8rem;
  margin-top:1rem;
}

.acciones-modal button{
  flex:1;
  border:none;
  padding:.9rem;
  border-radius:14px;
  cursor:pointer;
  font-weight:bold;
}

.cancelar{
  background:#ef4444;
  color:white;
}

.guardar{
  background:#22c55e;
  color:white;
}

.btn-eliminar{
  background:#ef4444;
  color:white;
}

.modal-eliminar{
  max-width:380px;
  text-align:center;
}

.icono-eliminar{
  width:75px;
  height:75px;
  margin:auto;
  margin-bottom:1rem;
  border-radius:50%;
  background:#fee2e2;
  display:flex;
  align-items:center;
  justify-content:center;
}

@media(max-width:768px){

  .fertilizacion{
    width:95%;
    padding:.8rem;
    padding-bottom:6rem;
  }

  .topbar{
    flex-direction:column;
    align-items:flex-start;
  }

  .btn-agregar{
    width:100%;
  }

  .lista{
    grid-template-columns:1fr;
  }

  .grid{
    grid-template-columns:1fr;
  }

  .acciones-modal{
    flex-direction:column;
  }

  .clima-header{
    flex-direction:column;
    align-items:flex-start;
  }

  .estado-clima{
    width:90%;
    text-align:center;
  }

  .alerta-clima{
    flex-direction:column;
  }


}
</style>