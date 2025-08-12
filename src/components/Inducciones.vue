<template>
  <div class="inducciones-container">
    <h2>Inducciones</h2>

    <button @click="abrirModal" class="btn-agregar">Nueva Inducción</button>

    <ul class="lista">
      <li v-for="n in inducciones" :key="n.id">
        <span><strong>Cantidad:</strong> {{ n.cantidad }}</span>
        <span><strong>Fecha:</strong> {{ n.fecha }}</span>
        <span><strong>Parcela:</strong> {{ n.parcela }}</span>
        <div>
          <button class="btn" @click="editar(n)">Editar</button>
          <button class="btn btn-rojo" @click="confirmarEliminar(n.id)">Eliminar</button>
        </div>
      </li>
    </ul>

    <!-- Modal crear/editar -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <h3>{{ editando ? 'Editar inducción' : 'Nueva inducción' }}</h3>
        <form @submit.prevent="guardar">
          <input type="number" v-model="nueva.cantidad" placeholder="Cantidad" required />
          <input type="date" v-model="nueva.fecha" required />
          <input type="text" v-model="nueva.parcela" placeholder="Parcela" required />
          <div class="acciones">
            <button type="submit" class="btn-confirmar">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
            <button type="button" class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal confirmar eliminación -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="cerrarModalEliminar">
      <div class="modal">
        <h3>¿Estás seguro de eliminar esta inducción?</h3>
        <div class="acciones">
          <button class="btn-confirmar" @click="eliminar">Eliminar</button>
          <button class="btn-cancelar" @click="cerrarModalEliminar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const inducciones = ref([])
const nueva = ref({ cantidad: '', fecha: '', parcela: '' })
const editando = ref(false)
const modalAbierto = ref(false)
const modalEliminar = ref(false)
let editId = null
let eliminarId = null
let userId = null

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id
}

const cargarInducciones = async () => {
  const { data } = await supabase
    .from('inducciones')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  if (data) inducciones.value = data
}

const guardar = async () => {
  if (!nueva.value.cantidad || !nueva.value.fecha || !nueva.value.parcela) return

  if (editando.value) {
    await supabase.from('inducciones').update({ ...nueva.value }).eq('id', editId)
  } else {
    await supabase.from('inducciones').insert([{ ...nueva.value, user_id: userId }])
  }

  cerrarModal()
  cargarInducciones()
}

const editar = (nota) => {
  nueva.value = { cantidad: nota.cantidad, fecha: nota.fecha, parcela: nota.parcela }
  editId = nota.id
  editando.value = true
  modalAbierto.value = true
}

const confirmarEliminar = (id) => {
  eliminarId = id
  modalEliminar.value = true
}

const eliminar = async () => {
  await supabase.from('inducciones').delete().eq('id', eliminarId)
  cerrarModalEliminar()
  cargarInducciones()
}

const abrirModal = () => {
  nueva.value = { cantidad: '', fecha: '', parcela: '' }
  editId = null
  editando.value = false
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const cerrarModalEliminar = () => {
  modalEliminar.value = false
  eliminarId = null
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarInducciones()
})
</script>

<style>
.inducciones-container {
  max-width: 700px;
  margin: auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
}
.inducciones-container h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.btn-agregar {
  background-color: #4caf50;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: block;
  margin: 10px auto 1rem auto;
  width: 80%;
}

.lista {
  list-style: none;
  padding: 0;
}

.lista li {
  background: white;
  padding: 1rem;
  margin-bottom: 0.8rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.lista li span {
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.lista li div {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.4rem 0.9rem;
  font-size: 0.95rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100px;
}

.btn-rojo {
  background-color: #ef4444;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.modal input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.acciones {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-confirmar,
.btn-cancelar {
  flex: 1 1 auto;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  color: white;
  cursor: pointer;
}

.btn-confirmar {
  background-color: #10b981;
}

.btn-cancelar {
  background-color: #ef4444;
}

@media (max-width: 768px) {
  .btn-agregar {
    width: 100%;
    font-size: 1rem;
  }

  .lista li {
    padding: 0.8rem;
  }

  .btn {
    font-size: 0.9rem;
  }

  .modal {
    width: 95%;
    margin-right: 10%;
    
    padding: 1rem;
  }
    .modal input {
        width: 94%
    }
}
</style>
