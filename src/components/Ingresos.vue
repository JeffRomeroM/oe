<template>
  <div class="page-ingresos">


    <!-- HEADER -->
    <div class="top-card">

      <div class="top-info">

        <div class="icon-box">
          <Icon icon="mdi:cash-plus" />
        </div>

        <div>
          <h2>Ingresos</h2>
          <p>Control de ganancias agrícolas</p>
        </div>

      </div>

      <div class="total-card">
        <small>Total ingresos</small>
        <h3>C$ {{ totalIngresos.toLocaleString() }}</h3>
      </div>

    </div>

    <!-- BOTONES -->
    <div class="acciones-top">

      <button
        class="btn-agregar"
        @click="abrirModal()"
      >
        <Icon icon="mdi:plus" />
        Agregar
      </button>

      <button
        class="btn-exportar"
        @click="exportarPDF"
      >
        <Icon icon="mdi:file-pdf-box" />
        PDF
      </button>

    </div>

    <!-- FILTROS -->
    <div class="filtros-card">

      <div class="chips">

        <button
          class="chip"
          :class="{ activo: filtroCultivo.length === 0 }"
          @click="seleccionarCultivo('TODOS')"
        >
          Todos
        </button>

        <button
          v-for="c in cultivosUnicos"
          :key="c"
          class="chip"
          :class="{ activo: filtroCultivo.includes(c) }"
          @click="seleccionarCultivo(c)"
        >
          {{ c }}
        </button>

      </div>

    </div>

    <!-- LISTA -->
    <div class="lista-ingresos">

      <div
        v-for="item in ingresosFiltrados"
        :key="item.id"
        class="ingreso-card"
      >

        <div class="card-header">

          <div class="cultivo-section">

            <div class="cultivo-icon">
              <Icon icon="mdi:sprout" />
            </div>

            <div class="cultivo-text">
              <h3>{{ item.cultivo }}</h3>

              <div class="fecha">
                <Icon icon="mdi:calendar-month-outline" />
                {{ item.fecha }}
              </div>
            </div>

          </div>

          <div class="monto">
            + C$ {{ Number(item.ingresos).toLocaleString() }}
          </div>

        </div>

        <div class="concepto-box">

          <Icon icon="mdi:text-box-outline" />

          <span>{{ item.concepto }}</span>

        </div>

        <div class="acciones-card">

          <button
            class="btn-card editar"
            @click="editar(item)"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>

          <button
            class="btn-card eliminar"
            @click="abrirModalEliminar(item.id)"
          >
            <Icon icon="mdi:trash-can-outline" />
          </button>

        </div>

      </div>

    </div>

    <!-- MODAL -->
    <div
      v-if="modalVisible"
      class="modal-overlay"
      @click.self="cerrarModal"
    >

      <div class="modal">

        <div class="modal-header">

          <h3>
            {{ editando ? 'Editar ingreso' : 'Nuevo ingreso' }}
          </h3>

          <button
            class="btn-close"
            @click="cerrarModal"
          >
            <Icon icon="mdi:close" />
          </button>

        </div>

        <form
          @submit.prevent="guardarIngreso"
          class="formulario"
        >

          <div class="input-group">

            <label>Cultivo</label>

            <select v-model="form.cultivo" required>

              <option value="" disabled>
                Seleccione cultivo
              </option>

              <option
                v-for="c in cultivos"
                :key="c"
                :value="c"
              >
                {{ c }}
              </option>

            </select>

          </div>

          <div class="input-group">

            <label>Monto</label>

            <input
              v-model.number="form.ingresos"
              type="number"
              placeholder="0"
              required
            />

          </div>

          <div class="input-group">

            <label>Concepto</label>

            <input
              v-model="form.concepto"
              type="text"
              placeholder="Ej: Venta de piñas"
              required
            />

          </div>

          <div class="input-group">

            <label>Fecha</label>

            <input
              v-model="form.fecha"
              type="date"
              required
            />

          </div>

          <div class="modal-actions">

            <button
              type="button"
              class="btn-cancelar"
              @click="cerrarModal"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="btn-guardar"
            >
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </button>

          </div>

        </form>

      </div>

    </div>

    <!-- MODAL ELIMINAR -->
    <div
      v-if="modalEliminarVisible"
      class="modal-overlay"
      @click.self="cerrarModalEliminar"
    >

      <div class="modal confirmacion">

        <div class="icon-warning">
          <Icon icon="mdi:alert-circle-outline" />
        </div>

        <h3>Eliminar ingreso</h3>

        <p>
          Esta acción no se puede deshacer.
        </p>

        <div class="modal-actions">

          <button
            class="btn-cancelar"
            @click="cerrarModalEliminar"
          >
            Cancelar
          </button>

          <button
            class="btn-danger"
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
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../supabase'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import Header from '../components/Header.vue'
import MenuAbajo from '../components/MenuAbajo.vue'

const ingresos = ref([])
const ingresosFiltrados = ref([])
const filtroCultivo = ref([])
const cultivos = ref([])

const form = ref({
  cultivo: '',
  ingresos: 0,
  concepto: '',
  fecha: ''
})

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

const seleccionarCultivo = (cultivo) => {

  if (cultivo === 'TODOS') {

    filtroCultivo.value = []

  } else {

    if (filtroCultivo.value.includes(cultivo)) {

      filtroCultivo.value =
        filtroCultivo.value.filter(c => c !== cultivo)

    } else {

      filtroCultivo.value.push(cultivo)

    }

  }

  filtrarIngresos()

}

const cargarCultivos = async () => {

  if (!userId) return

  const { data } = await supabase
    .from('cultivos')
    .select('nombre')
    .eq('user_id', userId)

  if (data) {
    cultivos.value = data.map(c => c.nombre)
  }

}

const cargarIngresos = async () => {

  if (!userId) return

  const { data } = await supabase
    .from('ingresos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  ingresos.value = data || []

  filtrarIngresos()

}

const guardarIngreso = async () => {

  if (!userId) return

  if (editando.value) {

    await supabase
      .from('ingresos')
      .update({
        ...form.value,
        user_id: userId
      })
      .eq('id', idActual)

  } else {

    await supabase
      .from('ingresos')
      .insert([
        {
          ...form.value,
          user_id: userId
        }
      ])

  }

  form.value = {
    cultivo: '',
    ingresos: 0,
    concepto: '',
    fecha: ''
  }

  editando.value = false
  idActual = null

  cerrarModal()

  await cargarIngresos()

}

const editar = (item) => {

  form.value = { ...item }

  idActual = item.id

  editando.value = true

  abrirModal(true)

}

const abrirModal = (editar = false) => {

  if (!editar) {

    form.value = {
      cultivo: '',
      ingresos: 0,
      concepto: '',
      fecha: ''
    }

    editando.value = false
    idActual = null

  }

  modalVisible.value = true

}

const cerrarModal = () => {

  modalVisible.value = false

}

const abrirModalEliminar = (id) => {

  idEliminar = id

  modalEliminarVisible.value = true

}

const cerrarModalEliminar = () => {

  modalEliminarVisible.value = false

}

const confirmarEliminar = async () => {

  await supabase
    .from('ingresos')
    .delete()
    .eq('id', idEliminar)

  cerrarModalEliminar()

  await cargarIngresos()

}

const filtrarIngresos = () => {

  if (filtroCultivo.value.length === 0) {

    ingresosFiltrados.value = [...ingresos.value]

  } else {

    ingresosFiltrados.value =
      ingresos.value.filter(i =>
        filtroCultivo.value.includes(i.cultivo)
      )

  }

}

const totalIngresos = computed(() =>
  ingresosFiltrados.value.reduce(
    (acc, curr) => acc + Number(curr.ingresos),
    0
  )
)

const cultivosUnicos = computed(() => {

  const nombres =
    ingresos.value.map(i => i.cultivo)

  return [...new Set(nombres)]

})

const exportarPDF = () => {

  const doc = new jsPDF()

  doc.setFontSize(18)

  doc.text('Reporte de Ingresos', 14, 20)

  const filas =
    ingresosFiltrados.value.map(e => [
      e.cultivo,
      `C$ ${e.ingresos}`,
      e.concepto,
      e.fecha
    ])

  autoTable(doc, {
    startY: 30,
    head: [['Cultivo', 'Monto', 'Concepto', 'Fecha']],
    body: filas,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94]
    }
  })

  doc.text(
    `Total: C$ ${totalIngresos.value}`,
    14,
    doc.lastAutoTable.finalY + 10
  )

  doc.save('ingresos.pdf')

}

onMounted(async () => {

  await obtenerUsuario()

  await cargarCultivos()

  await cargarIngresos()

})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.page-ingresos{
  min-height:100vh;
  background:#f5f7fb;
  padding:1rem;
  padding-bottom:110px;
}

/* HEADER */

.top-card{
  background:linear-gradient(135deg,#22c55e,#15803d);
  border-radius:22px;
  padding:1rem 1.1rem;
  color:white;
  display:flex;
  justify-content:space-between;
  gap:1rem;
  flex-wrap:wrap;
  margin-bottom:1rem;
}

.top-info{
  display:flex;
  align-items:center;
  gap:12px;
}

.icon-box{
  width:55px;
  height:55px;
  border-radius:16px;
  background:rgba(255,255,255,.14);
  display:flex;
  align-items:center;
  justify-content:center;
}

.icon-box svg{
  font-size:1.8rem;
}

.top-card h2{
  margin:0;
  font-size:1.3rem;
}

.top-card p{
  margin:3px 0 0;
  opacity:.9;
  font-size:13px;
}

.total-card{
  background:rgba(255,255,255,.12);
  padding:.8rem 1rem;
  border-radius:16px;
  min-width:150px;
}

.total-card small{
  opacity:.9;
  font-size:12px;
}

.total-card h3{
  margin:4px 0 0;
  font-size:1.3rem;
}

/* BOTONES */

.acciones-top{
  display:flex;
  gap:.6rem;
  margin-bottom:1rem;
}

.btn-agregar,
.btn-exportar{
  border:none;
  border-radius:12px;
  padding:.75rem .9rem;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap:6px;
  color:white;
}

.btn-agregar{
  background:#22c55e;
}

.btn-exportar{
  background:#2563eb;
}

/* FILTROS */

.filtros-card{
  background:white;
  padding:.9rem;
  border-radius:18px;
  margin-bottom:1rem;
}

.chips{
  display:flex;
  flex-wrap:wrap;
  gap:.5rem;
}

.chip{
  border:none;
  background:#eef2f7;
  color:#374151;
  padding:.55rem .9rem;
  border-radius:999px;
  cursor:pointer;
  font-size:13px;
  font-weight:600;
}

.chip.activo{
  background:#16a34a;
  color:white;
}

/* LISTA */

.lista-ingresos{
  display:flex;
  flex-direction:column;
  gap:.8rem;
}

.ingreso-card{
  background:white;
  border-radius:20px;
  padding:.9rem;
  box-shadow:0 3px 14px rgba(0,0,0,.04);
}

.card-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:.8rem;
}

.cultivo-section{
  display:flex;
  align-items:center;
  gap:10px;
}

.cultivo-icon{
  width:48px;
  height:48px;
  border-radius:14px;
  background:#dcfce7;
  color:#15803d;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.cultivo-icon svg{
  font-size:1.3rem;
}

.cultivo-text h3{
  margin:0;
  font-size:.95rem;
  color:#111827;
}

.fecha{
  margin-top:4px;
  display:flex;
  align-items:center;
  gap:5px;
  color:#6b7280;
  font-size:12px;
}

.monto{
  color:#16a34a;
  font-size:1rem;
  font-weight:700;
  white-space:nowrap;
}

.concepto-box{
  margin-top:.8rem;
  background:#f8fafc;
  border-radius:14px;
  padding:.7rem .8rem;
  display:flex;
  align-items:flex-start;
  gap:8px;
  color:#4b5563;
  font-size:13px;
}

.concepto-box svg{
  color:#16a34a;
  font-size:1rem;
  margin-top:1px;
}

/* ACCIONES */

.acciones-card{
  display:flex;
  justify-content:flex-end;
  gap:.45rem;
  margin-top:.8rem;
}

.btn-card{
  width:36px;
  height:36px;
  border:none;
  border-radius:10px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}

.editar{
  background:rgba(37,99,235,.12);
  color:#2563eb;
}

.eliminar{
  background:rgba(239,68,68,.12);
  color:#dc2626;
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:3000;
  padding:1rem;
}

.modal{
  width:100%;
  max-width:420px;
  background:white;
  border-radius:22px;
  padding:1.1rem;
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}

.btn-close{
  width:34px;
  height:34px;
  border:none;
  border-radius:10px;
  background:#f3f4f6;
}

.formulario{
  display:flex;
  flex-direction:column;
  gap:.9rem;
}

.input-group{
  display:flex;
  flex-direction:column;
  gap:.45rem;
}

.input-group label{
  font-size:13px;
  font-weight:600;
  color:#374151;
}

.input-group input,
.input-group select{
  width:100%;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:.85rem .9rem;
  outline:none;
  font-size:14px;
}

.input-group input:focus,
.input-group select:focus{
  border-color:#16a34a;
}

.modal-actions{
  display:flex;
  justify-content:flex-end;
  gap:.7rem;
  margin-top:.5rem;
}

.btn-cancelar,
.btn-guardar,
.btn-danger{
  border:none;
  border-radius:12px;
  padding:.8rem 1rem;
  font-weight:600;
  cursor:pointer;
}

.btn-cancelar{
  background:#e5e7eb;
}

.btn-guardar{
  background:#22c55e;
  color:white;
}

.btn-danger{
  background:#ef4444;
  color:white;
}

/* CONFIRMACION */

.confirmacion{
  text-align:center;
}

.icon-warning{
  width:65px;
  height:65px;
  border-radius:50%;
  background:#dcfce7;
  color:#16a34a;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:0 auto 1rem;
}

.icon-warning svg{
  font-size:1.9rem;
}

/* RESPONSIVE */

@media(max-width:768px){

  .acciones-top{
    flex-direction:row;
  }

  .btn-agregar,
  .btn-exportar{
    flex:1;
    justify-content:center;
  }

}

@media(max-width:480px){

  .page-ingresos{
    padding:.7rem;
    padding-bottom:95px;
  }

  .card-header{
    flex-direction:column;
    align-items:flex-start;
  }

  .monto{
    margin-left:58px;
  }

}
</style>