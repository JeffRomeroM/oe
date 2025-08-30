<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const egresos = ref([])
const egresosFiltrados = ref([])
const filtroCultivo = ref([]) // 🔹 array
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

// ✅ Selección múltiple de cultivos
const seleccionarCultivo = (cultivo) => {
  if (cultivo === 'TODOS') {
    filtroCultivo.value = [] // 🔹 vacío = todos
  } else {
    if (filtroCultivo.value.includes(cultivo)) {
      filtroCultivo.value = filtroCultivo.value.filter(c => c !== cultivo)
    } else {
      filtroCultivo.value.push(cultivo)
    }
  }
  filtrarEgresos()
}

const cargarCultivos = async () => {
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

// ✅ Filtro con múltiples checkboxes
const filtrarEgresos = () => {
  if (filtroCultivo.value.length === 0) {
    egresosFiltrados.value = [...egresos.value]
  } else {
    egresosFiltrados.value = egresos.value.filter(i =>
      filtroCultivo.value.includes(i.cultivo)
    )
  }
}

const totalEgresos = computed(() =>
  egresosFiltrados.value.reduce((acc, curr) => acc + Number(curr.monto), 0)
)

const cultivosUnicos = computed(() => {
  const nombres = egresos.value.map(i => i.cultivo)
  return [...new Set(nombres)]
})

// ✅ Exportar PDF mostrando todos los cultivos seleccionados
const exportarPDF = () => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text('Reporte de Egresos', 14, 20)

  // Título de filtro
  let tituloFiltro = ''
  if (filtroCultivo.value.length === 0) {
    tituloFiltro = 'Todos los cultivos'
  } else {
    tituloFiltro = `Cultivos: ${filtroCultivo.value.join(', ')}`
  }

  doc.setFontSize(12)
  doc.text(tituloFiltro, 14, 28)

  // Filas de la tabla
  const filas = egresosFiltrados.value.map(e => [
    e.cultivo,
    `C$ ${e.monto}`,
    e.concepto,
    e.fecha
  ])

  autoTable(doc, {
    startY: 35,
    head: [['Cultivo', 'Monto', 'Concepto', 'Fecha']],
    body: filas,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
  })

  doc.setFontSize(12)
  doc.text(`Total: C$ ${totalEgresos.value}`, 14, doc.lastAutoTable.finalY + 10)

  // Nombre del archivo: cultivos seleccionados + fecha
  const fechaHoy = new Date()
  const dia = fechaHoy.getDate().toString().padStart(2, '0')
  const mes = (fechaHoy.getMonth() + 1).toString().padStart(2, '0')
  const año = fechaHoy.getFullYear()
  const fechaStr = `${dia}-${mes}-${año}`

  let nombreCultivos = ''
  if (filtroCultivo.value.length === 0) {
    nombreCultivos = 'Todos'
  } else {
    // reemplazar espacios por guion bajo para el nombre del archivo
    nombreCultivos = filtroCultivo.value.map(c => c.replace(/\s+/g, '_')).join('-')
  }

  const nombreArchivo = `${nombreCultivos}-${fechaStr}.pdf`
  doc.save(nombreArchivo)
}


onMounted(async () => {
  await obtenerUsuario()
  await cargarCultivos()
  await cargarEgresos()
})
</script>

<template>
  <div class="crud-container">
    <h2>Egresos</h2>
    <div class="total-ingresos">
      Total egresos: <strong> C$ {{ totalEgresos }}</strong>
    </div>

    <button @click="abrirModal()" class="btn-agregar">Agregar Egreso</button>
    <button @click="exportarPDF" class="btn-agregar">Exportar PDF</button>

    <!-- ✅ Filtros múltiples con checkboxes -->
<div class="filtros-lateral">
  <label>
    <input
      type="checkbox"
      :checked="filtroCultivo.length === 0"
      @change="seleccionarCultivo('TODOS')"
    />
    <span>Todos</span>
  </label>

  <label v-for="c in cultivosUnicos" :key="c">
    <input
      type="checkbox"
      :checked="filtroCultivo.includes(c)"
      @change="seleccionarCultivo(c)"
    />
    <span>{{ c }}</span>
  </label>
</div>

    <!-- Lista de egresos -->
    <ul class="lista-ingresos">
      <li v-for="item in egresosFiltrados" :key="item.id" class="item-ingreso">
        <h4><strong>Cultivo: </strong>{{ item.cultivo }}</h4>
        <p><strong>Monto: C$ </strong>{{ item.monto }}</p>
        <p><strong>Concepto: </strong>{{ item.concepto }}</p>
        <p><strong>Fecha: </strong>{{ item.fecha }}</p>
        <div>
          <button @click="editar(item)" class="btn-editar">Editar</button>
          <button @click="confirmarEliminacion(item.id)" class="btn-eliminar">Eliminar</button>
        </div>
      </li>
    </ul>
  </div>
</template>

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


.filtros-lateral {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

/* Cada filtro es como un "pill" */
.filtros-lateral label {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 20px;
  padding: 0px 2px;
  background: #e0e0e0;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

/* Ocultamos el checkbox por defecto */
.filtros-lateral input[type="checkbox"] {
  display: none;
  padding: 9px 12px;
}

/* ✅ Cuando está seleccionado */
.filtros-lateral input[type="checkbox"]:checked + span {
  background: #4caf50;
  color: white;
  border-radius: 14px;
  padding: 6px 12px;
}

/* Hover */
.filtros-lateral label:hover {
  background: #d5d5d5;
}






.btn-cultivo {
  background: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin-right: 0;
  width: 100%;
  text-align: left;
}
.btn-agregar{
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-bottom: 10px;
}
.btn-cultivo.activo {
  background: #4caf50;
  color: #fff;
}

.btn-cultivo:hover {
  background: #81c784;
  color: #fff;
}

@media (max-width: 480px) {
  .filtros-lateral {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    justify-content: flex-start;
  }
  .btn-cultivo {
    padding: 8px 10px;
    font-size: 15px;
    border-radius: 14px;
    width: auto;
  }
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
