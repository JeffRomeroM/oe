<template>
  <div class="container">
    <Header/>
    <h2>Cultivos</h2>

    <!-- Botón abrir modal -->
    <div class="acciones">
      <button @click="abrirFormulario" class="btn-primary">
        + Agregar Cultivo
      </button>
    </div>

    <!-- Lista de cultivos -->
    <div class="cultivo-grid">
      <div v-for="cultivo in cultivos" :key="cultivo.id" class="cultivo-card">
        <h3>{{ cultivo.nombre }}</h3>
        <div class="card-acciones">
          <button @click="abrirModalEditar(cultivo)" class="btn-secundario">Editar</button>
          <button @click="abrirModalEliminar(cultivo)" class="btn-peligro">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="modal-contenido">
        <h3>{{ modoEditar ? 'Editar Cultivo' : 'Agregar Cultivo' }}</h3>
        <input v-model="nuevoCultivo" placeholder="Nombre del cultivo" />
        <div class="acciones">
          <button @click="guardarCultivo" class="btn-primary">{{ modoEditar ? 'Actualizar' : 'Guardar' }}</button>
          <button @click="cerrarFormulario" class="btn-secundario">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Confirmación Eliminar -->
    <div v-if="mostrarConfirmacion" class="modal">
      <div class="modal-contenido confirmacion">
        <p>¿Eliminar <b>{{ cultivoSeleccionado?.nombre }}</b>?</p>
        <div class="acciones">
          <button @click="eliminarCultivo" class="btn-peligro">Sí</button>
          <button @click="cerrarModalConfirmacion" class="btn-secundario">No</button>
        </div>
      </div>
    </div>

    <MenuAbajo />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import MenuAbajo from '../components/MenuAbajo.vue'
import Header from '../components/Header.vue'

const cultivos = ref([])
const mostrarFormulario = ref(false)
const mostrarConfirmacion = ref(false)
const nuevoCultivo = ref('')
const cultivoSeleccionado = ref(null)
const modoEditar = ref(false)
const userId = ref(null)

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
  modoEditar.value = false
}

const abrirModalEditar = (cultivo) => {
  modoEditar.value = true
  cultivoSeleccionado.value = cultivo
  nuevoCultivo.value = cultivo.nombre
  mostrarFormulario.value = true
}

const guardarCultivo = async () => {
  if (!nuevoCultivo.value.trim()) return
  if (modoEditar.value && cultivoSeleccionado.value) {
    await supabase
      .from('cultivos')
      .update({ nombre: nuevoCultivo.value })
      .eq('id', cultivoSeleccionado.value.id)
  } else {
    await supabase
      .from('cultivos')
      .insert([{ nombre: nuevoCultivo.value, user_id: userId.value }])
  }
  nuevoCultivo.value = ''
  cultivoSeleccionado.value = null
  modoEditar.value = false
  mostrarFormulario.value = false
  cargarCultivos()
}

const abrirModalEliminar = (cultivo) => {
  cultivoSeleccionado.value = cultivo
  mostrarConfirmacion.value = true
}

const eliminarCultivo = async () => {
  if (!cultivoSeleccionado.value) return
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
.container {
  text-align: center;
  padding: 1rem;
  font-family: sans-serif;
}

h2 {
  margin: 1rem 0;
  font-size: 1.5rem;
  color: #333;
}

/* BOTONES */
.btn-primary,
.btn-secundario,
.btn-peligro {
  padding: 8px 14px;
  border: none;
  border-radius: 0.5rem;
  margin: 0.2rem;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secundario {
  background: #ccc;
}

.btn-secundario:hover {
  background: #bbb;
}

.btn-peligro {
  background: #e63946;
  color: white;
}

.btn-peligro:hover {
  background: #d62828;
}

/* GRID DE CULTIVOS */
.cultivo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem !important;
  width: 80%;
  margin-left: 10% !important;
  padding: 0 0.5rem;
}

.cultivo-card {
  background: #fff;
  border-radius: 0.8rem;
  padding: 10px !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s;
}

.cultivo-card:hover {
  transform: translateY(-4px);
}

.cultivo-card h3 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1rem;
}

.card-acciones {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

/* MODAL */
.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-contenido {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
  text-align: left;
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

.modal-contenido h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.modal-contenido input {
  width: 100%;
  padding: 0.6rem;
  margin: 0.8rem 0;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
  font-size: 14px;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 10px;
}

.confirmacion {
  text-align: center;
}
</style>
