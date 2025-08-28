<template>
  <div class="container">
    <button @click="mostrarModal = true" class="btn-primary">Gestionar Cultivos</button>

    <!-- Modal Principal -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-contenido">
        <h2>Cultivos</h2>
        
        <ul class="cultivo-lista">
          <li v-for="cultivo in cultivos" :key="cultivo.id" class="cultivo-item">
            <span>{{ cultivo.nombre }}</span>
            <div>
              <button @click="abrirModalEditar(cultivo)" class="btn-secundario">Editar</button>
              <button @click="abrirModalEliminar(cultivo)" class="btn-peligro">Eliminar</button>
            </div>
          </li>
        </ul>

        <input v-model="nuevoCultivo" placeholder="Nombre del cultivo" />
        <div class="modal-acciones">
          <button @click="guardarCultivo" class="btn-primary">{{ modoEditar ? 'Actualizar' : 'Agregar' }}</button>
          <button @click="cerrarModal" class="btn-secundario">Cerrar</button>
        </div>

        <!-- Confirmación Eliminar -->
        <div v-if="mostrarConfirmacion" class="confirmacion">
          <p>¿Eliminar "{{ cultivoSeleccionado?.nombre }}"?</p>
          <div class="modal-acciones">
            <button @click="eliminarCultivo" class="btn-peligro">Sí</button>
            <button @click="cerrarModalConfirmacion" class="btn-secundario">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ...existing code...
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const cultivos = ref([])
const mostrarModal = ref(false)
const mostrarConfirmacion = ref(false)
const nuevoCultivo = ref('')
const cultivoSeleccionado = ref(null)
const modoEditar = ref(false)
const userId = ref(null) // Cambia a ref

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data.user?.id || null // Asigna a .value
}

const cargarCultivos = async () => {
  if (!userId.value) return // Usa .value
  const { data } = await supabase
    .from('cultivos')
    .select('*')
    .eq('user_id', userId.value) // Usa .value
    .order('created_at', { ascending: false })
  cultivos.value = data || []
}
// ...existing code...

const abrirModalEditar = (cultivo) => {
  modoEditar.value = true
  cultivoSeleccionado.value = cultivo
  nuevoCultivo.value = cultivo.nombre
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

const cerrarModal = () => {
  mostrarModal.value = false
  cultivoSeleccionado.value = null
  modoEditar.value = false
  nuevoCultivo.value = ''
  mostrarConfirmacion.value = false
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

.btn-primary,
.btn-secundario,
.btn-peligro {
  padding: 3px 8px;
  border: none;
  border-radius: 0.5rem;
  margin: 0.2rem;
  cursor: pointer;
}

.btn-primary {
  background: #4caf50;
  color: white;
  padding: 10px 16px;
}

.btn-secundario {
  background: #ccc;

}

.btn-peligro {
  background: #e63946;
  color: white;
}

.cultivo-lista {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}

.cultivo-item {
  border: 1px solid #ddd;
  padding: 0.5rem;
  margin: auto;
  margin-bottom: 0.5rem;
  width: 100%;
  
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  z-index: 1000;
}

.modal-contenido {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 400px;
  text-align: left;
}

.modal-contenido input {
  width: 100%;
  padding: 0.5rem;
  margin: 0.8rem 0;
  border: 1px solid #ccc;
  border-radius: 0.4rem;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 10px;
}

.confirmacion {
  margin-top: 1rem;
  padding: 1rem;
  background: #ffe6e6;
  border-radius: 0.5rem;
  text-align: center;
}
</style>
