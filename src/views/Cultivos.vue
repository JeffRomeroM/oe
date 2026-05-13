<template>
  <div class="container">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">

        <div>
          <h2>Mis Cultivos</h2>
          <p>Gestión agrícola inteligente</p>
        </div>

        <button @click="abrirFormulario" class="btn-add">
          <Icon icon="mdi:plus" />
          Nuevo Cultivo
        </button>

      </div>
    </section>

    <!-- RESUMEN -->
    <section class="resumen-grid">

      <div class="resumen-card">
        <div class="resumen-icon">
          <Icon icon="mdi:leaf" />
        </div>

        <div>
          <span>Cultivos</span>
          <h3>{{ cultivos.length }}</h3>
        </div>
      </div>

      <div class="resumen-card">
        <div class="resumen-icon">
          <Icon icon="mdi:sprout" />
        </div>

        <div>
          <span>Plantas</span>
          <h3>{{ totalPlantas }}</h3>
        </div>
      </div>

    </section>

    <!-- BUSCADOR -->
    <div class="search-box">

      <Icon icon="mdi:magnify" />

      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar cultivo..."
      />

    </div>

    <!-- GRID -->
    <div class="cultivo-grid">

      <div
        v-for="cultivo in cultivosFiltrados"
        :key="cultivo.id"
        class="cultivo-card"
      >

        <div class="card-header">

          <div class="pineapple-box">
            <Icon icon="mdi:fruit-pineapple" />
          </div>

          <div class="cultivo-info">

            <h3>{{ cultivo.nombre }}</h3>

            <div class="plantas">
              <Icon icon="mdi:sprout" />
              {{ cultivo.cantPlantas || 0 }} plantas
            </div>

          </div>

        </div>

        <div class="card-body">

          <div
            class="info-item"
            v-if="cultivo.lat"
          >
            <Icon icon="mdi:map-marker" />

            {{ cultivo.lat.toFixed(4) }},
            {{ cultivo.lng.toFixed(4) }}
          </div>

        </div>

        <div class="acciones">

          <button
            class="btn-edit"
            @click="abrirModalEditar(cultivo)"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>

          <button
            class="btn-delete"
            @click="abrirModalEliminar(cultivo)"
          >
            <Icon icon="mdi:trash-can-outline" />
          </button>

        </div>

      </div>

    </div>

    <!-- VACIO -->
    <div
      v-if="cultivosFiltrados.length === 0"
      class="empty"
    >
      <Icon icon="mdi:fruit-pineapple" />
      <p>No hay cultivos registrados</p>
    </div>

    <!-- MODAL -->
    <div
      v-if="mostrarFormulario"
      class="modal"
    >

      <div class="modal-content">

        <div class="modal-header">

          <h3>
            <Icon icon="mdi:fruit-pineapple" />
            {{ modoEditar ? 'Editar Cultivo' : 'Nuevo Cultivo' }}
          </h3>

          <button
            class="close-btn"
            @click="cerrarFormulario"
          >
            <Icon icon="mdi:close" />
          </button>

        </div>

        <!-- NOMBRE -->
        <div class="input-group">

          <label>Nombre del cultivo</label>

          <div class="input-box">

            <Icon icon="mdi:leaf" />

            <input
              v-model="nuevoCultivo"
              placeholder="Ej: Piña MD2"
            />

          </div>

        </div>

        <!-- PLANTAS -->
        <div class="input-group">

          <label>Cantidad de plantas</label>

          <div class="input-box">

            <Icon icon="mdi:sprout" />

            <input
              v-model.number="cantPlantas"
              type="number"
              placeholder="Ej: 5000"
            />

          </div>

        </div>

        <!-- MAPA -->
        <div class="input-group">

          <label>Ubicación del cultivo</label>

          <div class="map-container">

            <LMap
              v-model:zoom="zoom"
              :center="[lat, lng]"
              style="height:300px;width:100%;"
              @click="seleccionarUbicacion"
            >

              <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <LMarker :lat-lng="[lat, lng]" />

            </LMap>

          </div>

          <small class="coords">
            Lat: {{ lat.toFixed(6) }}
            |
            Lng: {{ lng.toFixed(6) }}
          </small>

        </div>

        <!-- BOTON -->
        <div class="modal-actions">

          <button
            class="btn-save"
            @click="guardarCultivo"
          >
            <Icon icon="mdi:content-save-outline" />

            {{ modoEditar ? 'Actualizar' : 'Guardar' }}
          </button>

        </div>

      </div>

    </div>

    <!-- MODAL ELIMINAR -->
    <div
      v-if="mostrarConfirmacion"
      class="modal"
    >

      <div class="delete-modal">

        <div class="delete-circle">
          <Icon icon="mdi:trash-can-outline" />
        </div>

        <h3>Eliminar cultivo</h3>

        <p>
          ¿Deseas eliminar
          <b>{{ cultivoSeleccionado?.nombre }}</b>?
        </p>

        <div class="delete-actions">

          <button
            class="btn-cancel"
            @click="cerrarModalConfirmacion"
          >
            Cancelar
          </button>

          <button
            class="btn-danger"
            @click="eliminarCultivo"
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../supabase'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

import {
  LMap,
  LTileLayer,
  LMarker
} from '@vue-leaflet/vue-leaflet'

const cultivos = ref([])

const mostrarFormulario = ref(false)
const mostrarConfirmacion = ref(false)

const nuevoCultivo = ref('')
const cantPlantas = ref(0)

const cultivoSeleccionado = ref(null)

const modoEditar = ref(false)

const userId = ref(null)

const busqueda = ref('')

const zoom = ref(10 )

const lat = ref(11.6876)
const lng = ref( -84.4567)

const totalPlantas = computed(() => {

  return cultivos.value.reduce(
    (acc, item) =>
      acc + (Number(item.cantPlantas) || 0),
    0
  )
})

const cultivosFiltrados = computed(() => {

  return cultivos.value.filter(c =>
    c.nombre
      ?.toLowerCase()
      .includes(busqueda.value.toLowerCase())
  )
})

const obtenerUsuario = async () => {

  const { data } =
    await supabase.auth.getUser()

  userId.value = data.user?.id || null
}

const cargarCultivos = async () => {

  if (!userId.value) return

  const { data } = await supabase
    .from('cultivos')
    .select('*')
    .eq('user_id', userId.value)
    .order('created_at', {
      ascending: false
    })

  cultivos.value = data || []
}

const seleccionarUbicacion = (e) => {

  lat.value = e.latlng.lat
  lng.value = e.latlng.lng
}

const abrirFormulario = () => {

  mostrarFormulario.value = true

  nuevoCultivo.value = ''

  cantPlantas.value = 0

  lat.value = 12.1364
  lng.value = -86.2514

  modoEditar.value = false
}

const abrirModalEditar = (cultivo) => {

  modoEditar.value = true

  cultivoSeleccionado.value = cultivo

  nuevoCultivo.value = cultivo.nombre

  cantPlantas.value =
    cultivo.cantPlantas || 0

  lat.value = cultivo.lat || 12.1364
  lng.value = cultivo.lng || -86.2514

  mostrarFormulario.value = true
}

const guardarCultivo = async () => {

  if (!nuevoCultivo.value.trim())
    return

  const datos = {

    nombre: nuevoCultivo.value,

    cantPlantas:
      Number(cantPlantas.value) || 0,

    lat: lat.value,

    lng: lng.value
  }

  if (modoEditar.value) {

    await supabase
      .from('cultivos')
      .update(datos)
      .eq('id', cultivoSeleccionado.value.id)

  } else {

    await supabase
      .from('cultivos')
      .insert([
        {
          ...datos,
          user_id: userId.value
        }
      ])
  }

  cerrarFormulario()

  cargarCultivos()
}

const abrirModalEliminar = (cultivo) => {

  cultivoSeleccionado.value = cultivo

  mostrarConfirmacion.value = true
}

const eliminarCultivo = async () => {

  await supabase
    .from('cultivos')
    .delete()
    .eq('id', cultivoSeleccionado.value.id)

  cerrarModalConfirmacion()

  cargarCultivos()
}

const cerrarFormulario = () => {

  mostrarFormulario.value = false

  nuevoCultivo.value = ''

  cantPlantas.value = 0

  cultivoSeleccionado.value = null

  modoEditar.value = false
}

const cerrarModalConfirmacion = () => {

  mostrarConfirmacion.value = false

  cultivoSeleccionado.value = null
}

onMounted(async () => {

  await obtenerUsuario()

  await cargarCultivos()
})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.container{
  min-height:100vh;
  background:
  linear-gradient(to bottom,#f3fff4,#f7f8fc);
  padding:1rem;
  padding-bottom:110px;
  width:90%;
  max-width:1200px;
  margin:auto;
}

.hero{
  background:
  linear-gradient(135deg,#22c55e,#15803d);
  border-radius:30px;
  padding:1.5rem;
  color:white;
  margin:1rem 0;
  box-shadow:0 10px 30px rgba(34,197,94,.25);
}

.hero-content{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;
  flex-wrap:wrap;
}

.hero-content h2{
  margin:0;
  font-size:2rem;
}

.hero-content p{
  margin-top:.4rem;
  opacity:.9;
}

.btn-add{
  background:white;
  color:#15803d;
  border:none;
  padding:.9rem 1rem;
  border-radius:18px;
  font-weight:bold;
  display:flex;
  gap:8px;
  align-items:center;
  cursor:pointer;
}

.resumen-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(180px,1fr));
  gap:1rem;
  margin:1rem 0;
}

.resumen-card{
  background:white;
  border-radius:24px;
  padding:1rem;
  display:flex;
  gap:14px;
  align-items:center;
  box-shadow:0 4px 20px rgba(0,0,0,.05);
}

.resumen-icon{
  width:60px;
  height:60px;
  border-radius:18px;
  background:#dcfce7;
  color:#16a34a;
  display:flex;
  justify-content:center;
  align-items:center;
}

.resumen-icon svg{
  font-size:2rem;
}

.search-box{
  background:white;
  border-radius:20px;
  padding:1rem;
  display:flex;
  gap:10px;
  align-items:center;
  margin-bottom:1.5rem;
  box-shadow:0 4px 20px rgba(0,0,0,.05);
}

.search-box input{
  width:100%;
  border:none;
  outline:none;
  background:transparent;
}

.cultivo-grid{
  display:grid;
  grid-template-columns:
  repeat(auto-fill,minmax(280px,1fr));
  gap:1rem;
}

.cultivo-card{
  background:white;
  border-radius:28px;
  padding:1rem;
  box-shadow:0 6px 25px rgba(0,0,0,.05);
  position:relative;
}

.card-header{
  display:flex;
  gap:12px;
  align-items:center;
}

.pineapple-box{
  width:65px;
  height:65px;
  border-radius:20px;
  background:
  linear-gradient(135deg,#22c55e,#16a34a);
  display:flex;
  justify-content:center;
  align-items:center;
}

.pineapple-box svg{
  color:white;
  font-size:2rem;
}

.plantas{
  display:flex;
  align-items:center;
  gap:6px;
  margin-top:8px;
  color:#6b7280;
}

.card-body{
  margin-top:1rem;
}

.info-item{
  background:#f9fafb;
  padding:.8rem;
  border-radius:14px;
  display:flex;
  gap:8px;
  align-items:center;
  font-size:14px;
}

.acciones{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:1rem;
}

.btn-edit,
.btn-delete{
  width:45px;
  height:45px;
  border:none;
  border-radius:14px;
  display:flex;
  justify-content:center;
  align-items:center;
  cursor:pointer;
}

.btn-edit{
  background:#eef2ff;
  color:#4f46e5;
}

.btn-delete{
  background:#fee2e2;
  color:#dc2626;
}

.empty{
  text-align:center;
  padding:3rem 1rem;
  color:#6b7280;
}

.modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  padding:1rem;
  z-index:999;
}

.modal-content,
.delete-modal{
  width:100%;
  max-width:450px;
  background:white;
  border-radius:30px;
  padding:1.5rem;
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.close-btn{
  border:none;
  background:#f3f4f6;
  width:38px;
  height:38px;
  border-radius:12px;
  cursor:pointer;
}

.input-group{
  margin-top:1rem;
}

.input-group label{
  display:block;
  margin-bottom:8px;
}

.input-box{
  display:flex;
  align-items:center;
  gap:10px;
  background:#f9fafb;
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:0 14px;
}

.input-box input{
  width:100%;
  border:none;
  outline:none;
  background:transparent;
  padding:1rem 0;
}

.map-container{
  overflow:hidden;
  border-radius:20px;
  border:1px solid #e5e7eb;
}

.coords{
  display:block;
  margin-top:.5rem;
  color:#6b7280;
}

.modal-actions{
  margin-top:1.5rem;
}

.btn-save{
  width:100%;
  border:none;
  background:
  linear-gradient(135deg,#22c55e,#16a34a);
  color:white;
  padding:1rem;
  border-radius:18px;
  font-weight:bold;
  cursor:pointer;
}

.delete-modal{
  text-align:center;
}

.delete-circle{
  width:85px;
  height:85px;
  border-radius:50%;
  background:#fee2e2;
  color:#dc2626;
  display:flex;
  justify-content:center;
  align-items:center;
  margin:auto;
}

.delete-actions{
  display:flex;
  gap:10px;
  margin-top:1.5rem;
}

.btn-cancel,
.btn-danger{
  flex:1;
  border:none;
  padding:1rem;
  border-radius:16px;
  cursor:pointer;
  font-weight:bold;
}

.btn-cancel{
  background:#f3f4f6;
}

.btn-danger{
  background:#dc2626;
  color:white;
}

@media(max-width:768px){

  .container{
    width:100%;
    padding:.8rem;
  }

  .hero-content{
    flex-direction:column;
    align-items:stretch;
  }

  .btn-add{
    width:100%;
    justify-content:center;
  }

  .cultivo-grid{
    grid-template-columns:1fr;
  }

  .delete-actions{
    flex-direction:column;
  }
}
</style>