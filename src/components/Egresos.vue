<template>
  <div class="page-egresos">

    <!-- HEADER -->
    <div class="top-card">

      <div class="top-info">

        <div class="icon-box">
          <Icon icon="mdi:cash-remove" />
        </div>

        <div>
          <h2>Egresos</h2>
          <p>Control de gastos agrícolas</p>
        </div>

      </div>

      <div class="total-card">
        <small>Total egresos</small>
        <h3>C$ {{ totalEgresos.toLocaleString() }}</h3>
      </div>

    </div>

    <!-- ACCIONES -->
    <div class="acciones-top">

      <button
        class="btn-action btn-agregar"
        @click="abrirModal()"
      >
        <Icon icon="mdi:plus" />
        <span>Agregar</span>
      </button>

      <button
        class="btn-action btn-exportar"
        @click="exportarPDF"
      >
        <Icon icon="mdi:file-pdf-box" />
        <span>PDF</span>
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
    <div class="lista-egresos">

      <div
        v-for="item in egresosFiltrados"
        :key="item.id"
        class="egreso-card"
      >

        <!-- TOP -->
        <div class="card-top">

          <div class="cultivo-info">

            <div class="cultivo-icon">
              <Icon icon="mdi:fruit-pineapple" />
            </div>

            <div class="cultivo-text">
              <h3>{{ item.cultivo }}</h3>
            </div>

          </div>

          <div class="monto">
            
            <Icon icon="mdi:calendar-month-outline" />
            <span>{{ item.fecha }}</span>
          </div>

        </div>

        <!-- INFO -->
        <div class="info-line">

          <div class="info-item">
            <Icon icon="mdi:text-box-outline" />
            <span>{{ item.concepto }}</span>
          </div>

          <div class="info-item">
            <Icon icon="mdi:cash" />
            <span>
            C$ {{ Number(item.monto).toLocaleString() }}</span>
            
          </div>

        </div>

        <!-- BOTONES -->
        <div class="acciones-card">

          <button
            class="btn-card editar"
            @click="editar(item)"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>

          <button
            class="btn-card eliminar"
            @click="confirmarEliminacion(item.id)"
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
            {{ editando ? 'Editar egreso' : 'Nuevo egreso' }}
          </h3>

          <button
            class="btn-close"
            @click="cerrarModal"
          >
            <Icon icon="mdi:close" />
          </button>

        </div>

        <form
          @submit.prevent="guardarEgreso"
          class="formulario"
        >

          <div class="input-group">

            <label>Cultivo</label>

            <select
              v-model="form.cultivo"
              required
            >
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
              v-model.number="form.monto"
              type="number"
              required
            />

          </div>

          <div class="input-group">

            <label>Concepto</label>

            <input
              v-model="form.concepto"
              type="text"
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

    <!-- CONFIRMACION -->
    <div
      v-if="confirmacionVisible"
      class="modal-overlay"
      @click.self="cancelarEliminacion"
    >

      <div class="modal confirmacion">

        <div class="icon-warning">
          <Icon icon="mdi:alert-circle-outline" />
        </div>

        <h3>Eliminar egreso</h3>

        <p>Esta acción no se puede deshacer.</p>

        <div class="modal-actions">

          <button
            class="btn-cancelar"
            @click="cancelarEliminacion"
          >
            Cancelar
          </button>

          <button
            class="btn-danger"
            @click="eliminarConfirmado"
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

const egresos = ref([])
const egresosFiltrados = ref([])
const filtroCultivo = ref([])
const cultivos = ref([])

const form = ref({
  cultivo: '',
  monto: 0,
  concepto: '',
  fecha: ''
})

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

  filtrarEgresos()

}

const cargarCultivos = async () => {

  const { data } = await supabase
    .from('cultivos')
    .select('nombre')
    .eq('user_id', userId)

  cultivos.value =
    data?.map(c => c.nombre) || []

}

const cargarEgresos = async () => {

  const { data } = await supabase
    .from('egresos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  egresos.value = data || []

  filtrarEgresos()

}

const guardarEgreso = async () => {

  if (editando.value) {

    await supabase
      .from('egresos')
      .update({
        ...form.value,
        user_id: userId
      })
      .eq('id', idActual)

  } else {

    await supabase
      .from('egresos')
      .insert([
        {
          ...form.value,
          user_id: userId
        }
      ])

  }

  cerrarModal()

  await cargarEgresos()

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

}

const eliminarConfirmado = async () => {

  await supabase
    .from('egresos')
    .delete()
    .eq('id', idParaEliminar)

  confirmacionVisible.value = false

  await cargarEgresos()

}

const abrirModal = (editar = false) => {

  if (!editar) {

    form.value = {
      cultivo: '',
      monto: 0,
      concepto: '',
      fecha: ''
    }

    editando.value = false

  }

  modalVisible.value = true

}

const cerrarModal = () => {
  modalVisible.value = false
}

const filtrarEgresos = () => {

  if (filtroCultivo.value.length === 0) {

    egresosFiltrados.value = [...egresos.value]

  } else {

    egresosFiltrados.value =
      egresos.value.filter(i =>
        filtroCultivo.value.includes(i.cultivo)
      )

  }

}

const totalEgresos = computed(() =>
  egresosFiltrados.value.reduce(
    (acc, curr) =>
      acc + Number(curr.monto),
    0
  )
)

const cultivosUnicos = computed(() => {

  const nombres =
    egresos.value.map(i => i.cultivo)

  return [...new Set(nombres)]

})

const exportarPDF = () => {

  const doc = new jsPDF()

  doc.text('Reporte de Egresos', 14, 20)

  const filas =
    egresosFiltrados.value.map(e => [
      e.cultivo,
      e.monto,
      e.concepto,
      e.fecha
    ])

  autoTable(doc, {
    startY: 30,
    head: [['Cultivo', 'Monto', 'Concepto', 'Fecha']],
    body: filas
  })

  doc.save('egresos.pdf')

}

onMounted(async () => {

  await obtenerUsuario()

  await cargarCultivos()

  await cargarEgresos()

})
</script>

<style scoped>

.page-egresos{
  min-height:100vh;
  background:#f5f7fb;
  padding:1rem;
  padding-bottom:100px;
}

/* HEADER */

.top-card{
  background:linear-gradient(135deg,#ef4444,#dc2626);
  border-radius:22px;
  padding:1rem;
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
  width:54px;
  height:54px;
  border-radius:16px;
  background:rgba(255,255,255,.14);
  display:flex;
  align-items:center;
  justify-content:center;
}

.icon-box svg{
  font-size:1.7rem;
}

.top-card h2{
  margin:0;
  font-size:1.2rem;
}

.top-card p{
  margin-top:3px;
  opacity:.9;
  font-size:13px;
}

.total-card{
  background:rgba(255,255,255,.12);
  padding:.7rem .9rem;
  border-radius:16px;
}

.total-card small{
  font-size:12px;
}

.total-card h3{
  margin:4px 0 0;
  font-size:1.1rem;
}

/* BOTONES */

.acciones-top{
  display:flex;
  gap:.6rem;
  margin-bottom:1rem;
}

.btn-action{
  border:none;
  border-radius:12px;
  padding:.75rem .9rem;
  display:flex;
  align-items:center;
  gap:6px;
  cursor:pointer;
  color:white;
  font-size:13px;
  font-weight:600;
  width:fit-content;
}

.btn-action svg{
  font-size:1rem;
}

.btn-agregar{
  background:#22c55e;
  padding:.75rem .9rem;
  
}

.btn-exportar{
  background:#2563eb;
}

/* FILTROS */

.filtros-card{
  background:white;
  border-radius:18px;
  padding:.8rem;
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
  padding:.55rem .9rem;
  border-radius:999px;
  cursor:pointer;
  font-size:12px;
  font-weight:600;
  color:#374151;
}

.chip.activo{
  background:#ef4444;
  color:white;
}

/* LISTA */

.lista-egresos{
  display:grid;
  gap:.7rem;
}

/* CARD */

.egreso-card{
  background:white;
  border-radius:18px;
  padding:.8rem;
  border:1px solid #eef2f7;
  box-shadow:0 4px 12px rgba(15,23,42,.04);
}

.card-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:.7rem;
}

.cultivo-info{
  display:flex;
  align-items:center;
  gap:.7rem;
}

.cultivo-icon{
  width:42px;
  height:42px;
  min-width:42px;
  border-radius:14px;
  background:#fee2e2;
  color:#dc2626;
  display:flex;
  align-items:center;
  justify-content:center;
}

.cultivo-icon svg{
  font-size:1.2rem;
}

.cultivo-text h3{
  margin:0;
  font-size:.92rem;
  color:#111827;
}

.cultivo-text small{
  color:#6b7280;
  font-size:.72rem;
}

.monto{
  background:#fef2f2;
  color:#dc2626;
  padding:.4rem .7rem;
  border-radius:12px;
  font-size:.8rem;
  font-weight:700;
  white-space:nowrap;
}

/* INFO */

.info-line{
  display:flex;
  align-items:center;
  gap:1rem;
  flex-wrap:wrap;
  margin-top:.7rem;
}

.info-item{
  display:flex;
  align-items:center;
  gap:6px;
  color:#4b5563;
  font-size:.78rem;
}

.info-item svg{
  font-size:.95rem;
  color:#ef4444;
}

/* ACCIONES */

.acciones-card{
  display:flex;
  justify-content:flex-end;
  gap:.45rem;
  margin-top:.7rem;
}

.btn-card{
  width:34px;
  height:34px;
  border:none;
  border-radius:10px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
}

.btn-card svg{
  font-size:1rem;
}

.editar{
  background:#eff6ff;
  color:#2563eb;
}

.eliminar{
  background:#fef2f2;
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
  max-width:400px;
  background:white;
  border-radius:22px;
  padding:1rem;
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
  gap:.35rem;
}

.input-group label{
  font-size:13px;
  color:#374151;
  font-weight:600;
}

.input-group input,
.input-group select{
  border:1px solid #e5e7eb;
  border-radius:12px;
  padding:.8rem .9rem;
  outline:none;
}

.modal-actions{
  display:flex;
  gap:.6rem;
  margin-top:.4rem;
}

.btn-cancelar,
.btn-guardar,
.btn-danger{
  flex:1;
  border:none;
  border-radius:12px;
  padding:.8rem;
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

/* ALERTA */

.confirmacion{
  text-align:center;
}

.icon-warning{
  width:64px;
  height:64px;
  border-radius:50%;
  background:#fee2e2;
  color:#dc2626;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:auto;
  margin-bottom:1rem;
}

.icon-warning svg{
  font-size:1.8rem;
}

/* RESPONSIVE */

@media(max-width:768px){

  .acciones-top{
    justify-content:flex-start;
  }

}

@media(max-width:480px){

  .page-egresos{
    padding:.7rem;
    padding-bottom:90px;
  }

  .card-top{
    align-items:flex-start;
  }

  .monto{
    font-size:.75rem;
  }

  .info-line{
    flex-direction:column;
    align-items:flex-start;
    gap:.4rem;
  }

}
</style>