<template>
  <div class="container">
    

    <!-- HERO -->
    <section class="hero">
      <div class="hero-content">
        
      
        <h2>Mis Cultivos</h2>

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
          <Icon icon="mdi:fruit-pineapple" />
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
        <!-- TOP -->
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

        

        <!-- BOTONES -->
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
    <div v-if="cultivosFiltrados.length === 0" class="empty">
      <Icon icon="mdi:fruit-pineapple" />
      <p>No hay cultivos registrados</p>
    </div>

    <!-- MODAL -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <Icon icon="mdi:fruit-pineapple" />
            {{ modoEditar ? 'Editar Cultivo' : 'Nuevo Cultivo' }}
          </h3>

          <button class="close-btn" @click="cerrarFormulario">
            <Icon icon="mdi:close" />
          </button>
        </div>

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

        <div class="input-group">
          <label>Cantidad de plantas</label>

          <div class="input-box">
            <Icon icon="mdi:pine-tree" />

            <input
              v-model.number="cantPlantas"
              type="number"
              placeholder="Ej: 5000"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn-save" @click="guardarCultivo">
            <Icon icon="mdi:content-save-outline" />
            {{ modoEditar ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="mostrarConfirmacion" class="modal">
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
          <button class="btn-cancel" @click="cerrarModalConfirmacion">
            Cancelar
          </button>

          <button class="btn-danger" @click="eliminarCultivo">
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

import Header from '../components/Header.vue'
import MenuAbajo from '../components/MenuAbajo.vue'

const cultivos = ref([])
const mostrarFormulario = ref(false)
const mostrarConfirmacion = ref(false)

const nuevoCultivo = ref('')
const cantPlantas = ref(0)

const cultivoSeleccionado = ref(null)
const modoEditar = ref(false)

const userId = ref(null)
const busqueda = ref('')

const totalPlantas = computed(() => {
  return cultivos.value.reduce(
    (acc, item) => acc + (Number(item.cantPlantas) || 0),
    0
  )
})

const cultivosFiltrados = computed(() => {
  return cultivos.value.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data.user?.id || null
}

const cargarCultivos = async () => {
  if (!userId.value) return

  const { data } = await supabase
    .from('cultivos')
    .select('*')
    .eq('user_id', userId.value)
    .order('created_at', { ascending: false })

  cultivos.value = data || []
}

const abrirFormulario = () => {
  mostrarFormulario.value = true
  nuevoCultivo.value = ''
  cantPlantas.value = 0
  modoEditar.value = false
}

const abrirModalEditar = (cultivo) => {
  modoEditar.value = true

  cultivoSeleccionado.value = cultivo
  nuevoCultivo.value = cultivo.nombre
  cantPlantas.value = cultivo.cantPlantas || 0

  mostrarFormulario.value = true
}

const guardarCultivo = async () => {
  if (!nuevoCultivo.value.trim()) return

  const datos = {
    nombre: nuevoCultivo.value,
    cantPlantas: Number(cantPlantas.value) || 0
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
* {
  box-sizing: border-box;
}

.container {
  min-height: 100vh;
  background:
    linear-gradient(to bottom, #f3fff4, #f7f8fc);
  padding: 1rem;
  padding-bottom: 110px;
  width: 90%;
  max-width: 1200px;
  margin: auto!important;
}

/* HERO */

.hero {
  background:
    linear-gradient(135deg, #22c55e, #15803d);
  border-radius: 30px;
  padding: 1.5rem;
  color: white;
  margin: 1rem 0;
  box-shadow: 0 10px 30px rgba(34,197,94,0.25);
}

.hero-content {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}
.hero-content h2 {
  font-size: 1.8rem;
  margin: 0;
  text-align: 
  center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.18);
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 13px;
  margin-bottom: 1rem;
}

.hero h2 {
  margin: 0;
  font-size: 2rem;
}

.hero p {
  margin-top: 8px;
  opacity: 0.9;
}

.hero-content .btn-add {
  background: white;
  color: #15803d;
  border: none;
  padding: 10px !important;
  border-radius: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  border-bottom: 2px solid #15803d;
}

/* RESUMEN */

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1rem;
  margin: 1.3rem 0!important;
}

.resumen-card {
  background: white;
  border-radius: 24px;
  padding: 1rem;
  display: flex;
  gap: 14px;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.resumen-icon {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: #dcfce7;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resumen-icon svg {
  font-size: 2rem;
}

.resumen-card span {
  color: #6b7280;
  font-size: 13px;
}

.resumen-card h3 {
  margin: 5px 0 0;
  font-size: 1.5rem;
  color: #111827;
}

/* SEARCH */

.search-box {
  background: white;
  border-radius: 20px;
  padding: 0.95rem 1rem !important;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1.5rem!important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.search-box svg {
  color: #9ca3af;
  font-size: 1.2rem;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
}

/* GRID */

.cultivo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem !important;
  margin-bottom: 4rem!important;
}

.cultivo-card {
  background: white;
  border-radius: 28px;
  padding: 1rem;
  box-shadow: 0 6px 25px rgba(0,0,0,0.05);
  transition: 0.25s;
  position: relative;
  overflow: hidden;
}

.cultivo-card:hover {
  transform: translateY(-5px);
}

.cultivo-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: #dcfce7;
  border-radius: 50%;
}

/* HEADER CARD */

.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.pineapple-box {
  width: 65px;
  height: 65px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, #22c55e, #16a34a);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.pineapple-box svg {
  color: white;
  font-size: 2rem;
}

.cultivo-info h3 {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
}

.plantas {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
}

/* BODY */

.card-body {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 2;
  
}

.info-item {
  background: #f9fafb;
  border-radius: 14px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
}

/* ACTIONS */

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
  margin-right: 1rem!important;
  position: relative;
  z-index: 2;
}

.btn-edit,
.btn-delete {
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #eef2ff;
  color: #4f46e5;
}

.btn-delete {
  background: #fee2e2;
  color: #dc2626;
}

/* EMPTY */

.empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty svg {
  font-size: 4rem;
  margin-bottom: 10px;
  color: #22c55e;
}

/* MODAL */

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 999;
}

.modal-content,
.delete-modal {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 30px;
  padding: 1.5rem !important;
  animation: modal 0.2s ease;
}

@keyframes modal {
  from {
    opacity: 0;
    transform: scale(.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.close-btn {
  border: none;
  background: #f3f4f6;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
}

/* INPUTS */

.input-group {
  margin-top: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 0 14px;
}

.input-box svg {
  color: #6b7280;
}

.input-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 1rem 0;
}

/* BUTTON SAVE */

.modal-actions {
  margin-top: 1.5rem;
}

.btn-save {
  width: 100%;
  border: none;
  background:
    linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 1rem;
  border-radius: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
}

/* DELETE */

.delete-modal {
  text-align: center;
}

.delete-circle {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.delete-circle svg {
  font-size: 2.3rem;
}

.delete-actions {
  display: flex;
  gap: 10px;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-danger {
  flex: 1;
  border: none;
  padding: 0.95rem;
  border-radius: 16px;
  cursor: pointer;
  font-weight: bold;
}

.btn-cancel {
  background: #f3f4f6;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .cultivo-grid {
    grid-template-columns: 1fr;
  }

  .delete-actions {
    flex-direction: column;
  }
}
</style>