<template>
  <div class="crud-container">
    <h2>Ingresos</h2>
    <div class="total-ingresos">
      Total ingresos: <strong> C$ {{ totalIngresos }}</strong>
    </div>
    <div class="filtros">
      <select v-model="filtroCultivo" @change="filtrarIngresos">
        <option value="">Todos los cultivos</option>
        <option v-for="c in cultivosUnicos" :key="c" :value="c">{{ c }}</option>
      </select>
      <button @click="abrirModal()">Agregar Ingreso</button>
    </div>

    <!-- Modal Agregar/Editar -->
    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <form @submit.prevent="guardarIngreso" class="formulario">
          <input
            v-model="form.cultivo"
            list="cultivos-list"
            placeholder="Nombre del cultivo"
            required
          />
          <datalist id="cultivos-list">
            <option v-for="c in cultivosUnicos" :key="c" :value="c" />
          </datalist>

          <input v-model.number="form.ingresos" placeholder="Ingresos" type="number" min="0" required />
          <input v-model="form.concepto" placeholder="Concepto" required />
          <input v-model="form.fecha" type="date" required />
          <div class="botones-modal">
            <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
            <button type="button" @click="cerrarModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar eliminar -->
    <div v-if="modalEliminarVisible" class="modal-overlay" @click.self="cerrarModalEliminar">
      <div class="modal">
        <p>¿Confirmas eliminar este ingreso?</p>
        <div class="botones-modal">
          <button @click="confirmarEliminar">Sí, eliminar</button>
          <button @click="cerrarModalEliminar">Cancelar</button>
        </div>
      </div>
    </div>

    <ul class="lista-ingresos">
      <li v-for="item in ingresosFiltrados" :key="item.id" class="item-ingreso">
        <span><strong>Cultivo: </strong>{{ item.cultivo }} - <strong>Monto: C$ </strong>{{ item.ingresos }} - <strong>Concepto: </strong>{{ item.concepto }} - <strong>Fecha: </strong>{{ item.fecha }}</span>
        <div>
          <button @click="editar(item)" class="btn-editar">Editar</button>
          <button @click="abrirModalEliminar(item.id)" class="btn-eliminar">Eliminar</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'

const ingresos = ref([])
const ingresosFiltrados = ref([])
const filtroCultivo = ref('')
const form = ref({ cultivo: '', ingresos: 0, concepto: '', fecha: '' })
const editando = ref(false)
const modalVisible = ref(false)
const modalEliminarVisible = ref(false)
let idActual = null
let idEliminar = null
let userId = null

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id || null
}

const cargarIngresos = async () => {
  if (!userId) return
  const { data, error } = await supabase
    .from('ingresos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
  if (!error) {
    ingresos.value = data
    filtrarIngresos()
  }
}

const guardarIngreso = async () => {
  if (!userId) return alert('Usuario no autenticado')

  if (editando.value) {
    await supabase
      .from('ingresos')
      .update({ ...form.value, user_id: userId })
      .eq('id', idActual)
    idActual = null
    editando.value = false
  } else {
    const { data, error } = await supabase
      .from('ingresos')
      .insert([{ ...form.value, user_id: userId }])
      .select()
    if (!error && data?.length) {
      ingresos.value.unshift(data[0])
      filtrarIngresos()
    }
  }

  form.value = { cultivo: '', ingresos: 0, concepto: '', fecha: '' }
  cerrarModal()
}

const editar = (item) => {
  form.value = { ...item }
  idActual = item.id
  editando.value = true
  abrirModal(true)
}

const abrirModal = (editar = false) => {
  if (!editar) {
    form.value = { cultivo: '', ingresos: 0, concepto: '', fecha: '' }
    editando.value = false
    idActual = null
  }
  modalVisible.value = true
}

const cerrarModal = () => {
  modalVisible.value = false
}

const filtrarIngresos = () => {
  if (!filtroCultivo.value) {
    ingresosFiltrados.value = [...ingresos.value]
  } else {
    ingresosFiltrados.value = ingresos.value.filter(i => i.cultivo === filtroCultivo.value)
  }
}

const totalIngresos = computed(() =>
  ingresosFiltrados.value.reduce((acc, curr) => acc + Number(curr.ingresos), 0)
)

const cultivosUnicos = computed(() => {
  const nombres = ingresos.value.map(i => i.cultivo)
  return [...new Set(nombres)]
})

// Modal eliminar
const abrirModalEliminar = (id) => {
  idEliminar = id
  modalEliminarVisible.value = true
}
const cerrarModalEliminar = () => {
  modalEliminarVisible.value = false
  idEliminar = null
}
const confirmarEliminar = async () => {
  if (!userId || !idEliminar) return
  await supabase
    .from('ingresos')
    .delete()
    .eq('id', idEliminar)
    .eq('user_id', userId)
  ingresos.value = ingresos.value.filter(i => i.id !== idEliminar)
  filtrarIngresos()
  cerrarModalEliminar()
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarIngresos()
})
</script>

<style scoped>
.crud-container {
  max-width: 96%;
  margin: 30px auto;
  font-family: Arial, sans-serif;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
  height: auto;
}
.total-ingresos strong{
    color: #17a31c;
}
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filtros select {
  flex-grow: 1;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #bbb;
  border-radius: 4px;
}

.filtros button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.filtros button:hover {
  background-color: #45a049;
}

.lista-ingresos {
  list-style: none;
  padding: 0;
  overflow-y: auto;
  margin-bottom: 15px;
}

.item-ingreso {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-bottom: 8px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  flex-wrap: wrap;
}

.item-ingreso span {
  flex: 1 1 100%;
  margin-bottom: 5px;
}

.btn-editar,
.btn-eliminar {
  margin-left: 5px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: white;
}

.btn-editar {
  background-color: #2196f3;
}

.btn-editar:hover {
  background-color: #1976d2;
}

.btn-eliminar {
  background-color: #f44336;
}

.btn-eliminar:hover {
  background-color: #d32f2f;
}

.total-ingresos {
  font-weight: bold;
  font-size: 18px;
  text-align: right;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.formulario select,
.formulario input {
  padding: 8px;
  font-size: 16px;
  border: 1px solid #bbb;
  border-radius: 4px;
}

.formulario button[type="submit"] {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.formulario button[type="submit"]:hover {
  background-color: #45a049;
}

.botones-modal {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.botones-modal button[type="button"],
.botones-modal button {
  background-color: #777;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.botones-modal button[type="button"]:hover,
.botones-modal button:hover {
  background-color: #555;
}

.botones-modal button:first-child {
  background-color: #f44336;
}

.botones-modal button:first-child:hover {
  background-color: #d32f2f;
}

@media (max-width: 480px) {
  .filtros, .item-ingreso {
    flex-direction: column;
    align-items: stretch;
  }

  .item-ingreso div {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
  }
}
</style>
