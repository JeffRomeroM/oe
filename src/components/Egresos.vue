<template>
  <div class="crud-container">
    <h2>Egresos</h2>
    <div class="total-ingresos">
      Total egresos: <strong> C$ {{ totalEgresos }}</strong>
    </div>
    <div class="filtros">
      <select v-model="filtroCultivo" @change="filtrarEgresos">
        <option value="">Todos los cultivos</option>
        <option v-for="c in cultivosUnicos" :key="c" :value="c">{{ c }}</option>
      </select>
      <button @click="abrirModal()">Agregar Egreso</button>
    </div>

    <div v-if="modalVisible" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <form @submit.prevent="guardarEgreso" class="formulario">
          <select v-model="form.cultivo" required>
            <option value="" disabled>Seleccione un cultivo</option>
            <option v-for="c in cultivos" :key="c" :value="c">{{ c }}</option>
          </select>

          <input v-model.number="form.monto" placeholder="Monto" type="number" min="0" required />
          <input v-model="form.concepto" placeholder="Concepto" required />
          <input v-model="form.fecha" type="date" required />
          <div class="botones-modal">
            <button type="submit">{{ editando ? 'Actualizar' : 'Guardar' }}</button>
            <button type="button" @click="cerrarModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmación -->
    <div v-if="confirmacionVisible" class="modal-overlay" @click.self="cancelarEliminacion">
      <div class="modal confirmacion">
        <p>¿Estás seguro que deseas eliminar este egreso?</p>
        <div class="botones-modal">
          <button @click="eliminarConfirmado" class="btn-eliminar">Eliminar</button>
          <button @click="cancelarEliminacion" class="btn-cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <ul class="lista-ingresos">
      <li v-for="item in egresosFiltrados" :key="item.id" class="item-ingreso">
        <span><strong>Cultivo: </strong>{{ item.cultivo }} - <strong>Monto: C$ </strong>{{ item.monto }} - <strong>Concepto: </strong>{{ item.concepto }} - <strong>Fecha: </strong>{{ item.fecha }}</span>
        <div>
          <button @click="editar(item)" class="btn-editar">Editar</button>
          <button @click="confirmarEliminacion(item.id)" class="btn-eliminar">Eliminar</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'

const egresos = ref([])
const egresosFiltrados = ref([])
const filtroCultivo = ref('')
const cultivos = ref([])

const form = ref({ cultivo: '', monto: 0, concepto: '', fecha: '' })
const editando = ref(false)
const modalVisible = ref(false)
const confirmacionVisible = ref(false)

let idActual = null
let idParaEliminar = null
let userId = null

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id || null
}


const cargarCultivos= async () => {
  if (!userId) return
  const { data, error } = await supabase
    .from('cultivos')
    .select('nombre')
    .eq('user_id', userId)
  if (!error && data) {
    cultivos.value = data.map(c => c.nombre)
  }
}

const cargarEgresos = async () => {
  if (!userId) return
  const { data, error } = await supabase
    .from('egresos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
  if (!error) {
    egresos.value = data
    filtrarEgresos()
  }
}


const guardarEgreso = async () => {
  if (!userId) return alert('Usuario no autenticado')

  if (editando.value) {
    await supabase
      .from('egresos')
      .update({ ...form.value, user_id: userId })
      .eq('id', idActual)
  } else {
    await supabase
      .from('egresos')
      .insert([{ ...form.value, user_id: userId }])
  }

  form.value = { cultivo: '', monto: 0, concepto: '', fecha: '' }
  editando.value = false
  idActual = null
  cerrarModal()
  cargarEgresos()
}

const editar = (item) => {
  form.value = { ...item }
  idActual = item.id
  editando.value = true
  abrirModal(true)
}

const confirmarEliminacion = (id) => {
  idParaEliminar = id
  confirmacionVisible.value = true
}

const cancelarEliminacion = () => {
  confirmacionVisible.value = false
  idParaEliminar = null
}

const eliminarConfirmado = async () => {
  if (!idParaEliminar || !userId) return
  await supabase.from('egresos').delete().eq('id', idParaEliminar).eq('user_id', userId)
  confirmacionVisible.value = false
  idParaEliminar = null
  cargarEgresos()
}

const abrirModal = (editar = false) => {
  if (!editar) {
    form.value = { cultivo: '', monto: 0, concepto: '', fecha: '' }
    editando.value = false
    idActual = null
  }
  modalVisible.value = true
}

const cerrarModal = () => {
  modalVisible.value = false
}

const filtrarEgresos = () => {
  if (!filtroCultivo.value) {
    egresosFiltrados.value = [...egresos.value]
  } else {
    egresosFiltrados.value = egresos.value.filter(i => i.cultivo === filtroCultivo.value)
  }
}

const totalEgresos = computed(() =>
  egresosFiltrados.value.reduce((acc, curr) => acc + Number(curr.monto), 0)
)

const cultivosUnicos = computed(() => {
  const nombres = egresos.value.map(i => i.cultivo)
  return [...new Set(nombres)]
})

onMounted(async () => {
  await obtenerUsuario()
  await cargarCultivos()
  await cargarEgresos()
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
}

.total-ingresos strong {
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
  background-color: rgba(0, 0, 0, 0.5);
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

.modal.confirmacion p {
  font-size: 16px;
  margin-bottom: 20px;
  text-align: center;
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

.formulario button[type="submit"],
.btn-confirmar {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}
.btn-eliminar {
  background-color: #f44336;
}

.formulario button[type="submit"]:hover,
.btn-confirmar:hover {
  background-color: #45a049;
}

.botones-modal {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.botones-modal button[type="button"],
.btn-cancelar {
  background-color: #777;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.botones-modal .btn-cancelar:hover {
  background-color: #555;
}

@media (max-width: 480px) {
  .filtros,
  .item-ingreso {
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
