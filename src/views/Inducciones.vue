<template>
  <div class="inducciones-page">

    <!-- HEADER -->
    <div class="top-card">

      <div class="top-info">

        <div class="icon-box">
          <span class="material-icons">
            agriculture
          </span>
        </div>

        <div>
          <h2>Inducciones</h2>
          <p>Control de plantas inducidas</p>
        </div>

      </div>

      <button
        @click="abrirModal"
        class="btn-agregar"
      >
        <span class="material-icons">
          add
        </span>

        Nueva
      </button>

    </div>

    <!-- LISTA -->
    <div class="cards">

      <div
        v-for="n in inducciones"
        :key="n.id"
        class="card"
      >

        <div class="card-top">

          <div class="fecha-box">
            <span class="material-icons">
              calendar_month
            </span>

            <small>{{ n.fecha }}</small>
          </div>

          <div class="acciones-card">

            <button
              class="btn-icon editar"
              @click="editar(n)"
            >
              <span class="material-icons">
                edit
              </span>
            </button>

            <button
              class="btn-icon eliminar"
              @click="confirmarEliminar(n.id)"
            >
              <span class="material-icons">
                delete
              </span>
            </button>

          </div>

        </div>

        <div class="info-grid">

          <div class="info-item">
            <span class="material-icons icon-green">
              grass
            </span>

            <div>
              <small>Plantas</small>
              <strong>{{ n.cantidad }}</strong>
            </div>
          </div>

          <div class="info-item">
            <span class="material-icons icon-blue">
              location_on
            </span>

            <div>
              <small>Parcela</small>
              <strong>{{ n.parcela }}</strong>
            </div>
          </div>

        </div>

        <div class="contador">

          <span class="material-icons">
            schedule
          </span>

          <p>
            {{ calcularTiempoRestante(n.fecha) }}
          </p>

        </div>

      </div>

    </div>

    <!-- MODAL -->
    <div
      v-if="modalAbierto"
      class="modal-overlay"
      @click.self="cerrarModal"
    >

      <div class="modal">

        <div class="modal-header">

          <h3>
            {{ editando ? 'Editar inducción' : 'Nueva inducción' }}
          </h3>

          <button
            class="btn-close"
            @click="cerrarModal"
          >
            <span class="material-icons">
              close
            </span>
          </button>

        </div>

        <form @submit.prevent="guardar">

          <div class="input-group">

            <label>Cantidad</label>

            <input
              type="number"
              v-model="nueva.cantidad"
              placeholder="Cantidad de plantas"
              required
            />

          </div>

          <div class="input-group">

            <label>Fecha</label>

            <input
              type="date"
              v-model="nueva.fecha"
              required
            />

          </div>

          <div class="input-group">

            <label>Parcela</label>

            <input
              type="text"
              v-model="nueva.parcela"
              placeholder="Ej: Lote 3"
              required
            />

          </div>

          <div class="acciones-modal">

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
      v-if="modalEliminar"
      class="modal-overlay"
      @click.self="cerrarModalEliminar"
    >

      <div class="modal eliminar-modal">

        <div class="warning-icon">
          <span class="material-icons">
            warning
          </span>
        </div>

        <h3>Eliminar inducción</h3>

        <p>
          Esta acción no se puede deshacer.
        </p>

        <div class="acciones-modal">

          <button
            class="btn-cancelar"
            @click="cerrarModalEliminar"
          >
            Cancelar
          </button>

          <button
            class="btn-eliminar"
            @click="eliminar"
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const inducciones = ref([])

const nueva = ref({
  cantidad: '',
  fecha: '',
  parcela: ''
})

const editando = ref(false)
const modalAbierto = ref(false)
const modalEliminar = ref(false)

let editId = null
let eliminarId = null
let userId = null

const obtenerUsuario = async () => {

  const { data } =
    await supabase.auth.getUser()

  userId = data.user?.id
}

const cargarInducciones = async () => {

  const { data } =
    await supabase
      .from('inducciones')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', {
        ascending: false
      })

  if (data)
    inducciones.value = data
}

const guardar = async () => {

  if (
    !nueva.value.cantidad ||
    !nueva.value.fecha ||
    !nueva.value.parcela
  ) return

  if (editando.value) {

    await supabase
      .from('inducciones')
      .update({
        ...nueva.value
      })
      .eq('id', editId)

  } else {

    await supabase
      .from('inducciones')
      .insert([
        {
          ...nueva.value,
          user_id: userId
        }
      ])

  }

  cerrarModal()
  cargarInducciones()
}

const editar = (nota) => {

  nueva.value = {
    cantidad: nota.cantidad,
    fecha: nota.fecha,
    parcela: nota.parcela
  }

  editId = nota.id
  editando.value = true
  modalAbierto.value = true
}

const confirmarEliminar = (id) => {
  eliminarId = id
  modalEliminar.value = true
}

const eliminar = async () => {

  await supabase
    .from('inducciones')
    .delete()
    .eq('id', eliminarId)

  cerrarModalEliminar()
  cargarInducciones()
}

const abrirModal = () => {

  nueva.value = {
    cantidad: '',
    fecha: '',
    parcela: ''
  }

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

const calcularTiempoRestante = (fechaInduccion) => {

  const inicio =
    new Date(fechaInduccion)

  const objetivo =
    new Date(inicio)

  objetivo.setMonth(
    inicio.getMonth() + 5
  )

  const ahora = new Date()

  let diff =
    objetivo - ahora

  if (diff <= 0)
    return 'Cosecha lista'

  const diasTotales =
    Math.floor(
      diff / (
        1000 * 60 * 60 * 24
      )
    )

  const meses =
    Math.floor(
      diasTotales / 30
    )

  const dias =
    diasTotales % 30

  return `${meses} meses y ${dias} días`
}

onMounted(async () => {

  await obtenerUsuario()
  await cargarInducciones()

})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.inducciones-page{
  min-height:100vh;
  padding:1rem;
  background:#f5f7fb;
  padding-bottom:90px;
}

/* HEADER */

.top-card{
  background:
    linear-gradient(
      135deg,
      #22c55e,
      #16a34a
    );

  border-radius:24px;

  padding:1rem;

  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:1rem;

  margin-bottom:1rem;

  color:white;
}

.top-info{
  display:flex;
  align-items:center;
  gap:12px;
}

.icon-box{
  width:58px;
  height:58px;

  border-radius:18px;

  background:
    rgba(255,255,255,.14);

  display:flex;
  align-items:center;
  justify-content:center;
}

.icon-box .material-icons{
  font-size:30px;
}

.top-card h2{
  margin:0;
}

.top-card p{
  margin:4px 0 0;
  opacity:.9;
  font-size:14px;
}

.btn-agregar{
  border:none;
  background:white;
  color:#16a34a;

  padding:.8rem 1rem;

  border-radius:14px;

  font-weight:700;

  display:flex;
  align-items:center;
  gap:6px;

  cursor:pointer;
}

/* CARDS */

.cards{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.card{
  background:white;
  border-radius:22px;
  padding:1rem;

  box-shadow:
    0 4px 18px rgba(0,0,0,.05);
}

.card-top{
  display:flex;
  justify-content:space-between;
  align-items:center;

  margin-bottom:1rem;
}

.fecha-box{
  display:flex;
  align-items:center;
  gap:6px;

  color:#16a34a;
  font-weight:700;
}

.fecha-box small{
  font-size:13px;
}

.acciones-card{
  display:flex;
  gap:.5rem;
}

.btn-icon{
  width:38px;
  height:38px;

  border:none;
  border-radius:12px;

  display:flex;
  align-items:center;
  justify-content:center;

  cursor:pointer;
}

.editar{
  background:
    rgba(59,130,246,.12);

  color:#2563eb;
}

.eliminar{
  background:
    rgba(239,68,68,.12);

  color:#dc2626;
}

/* GRID */

.info-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:.8rem;

  margin-bottom:1rem;
}

.info-item{
  background:#f8fafc;

  border-radius:16px;

  padding:.8rem;

  display:flex;
  align-items:center;
  gap:10px;
}

.info-item small{
  display:block;
  color:#6b7280;
  font-size:12px;
}

.info-item strong{
  font-size:15px;
  color:#111827;
}

.icon-green{
  color:#16a34a;
}

.icon-blue{
  color:#2563eb;
}

/* CONTADOR */

.contador{
  background:
    rgba(34,197,94,.08);

  border-radius:16px;

  padding:.9rem;

  display:flex;
  align-items:center;
  gap:10px;

  color:#15803d;
}

.contador .material-icons{
  font-size:22px;
}

.contador p{
  margin:0;
  font-size:14px;
  font-weight:600;
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;

  background:
    rgba(0,0,0,.45);

  display:flex;
  align-items:center;
  justify-content:center;

  z-index:5000;

  padding:1rem;
}

.modal{
  width:100%;
  max-width:420px;

  background:white;

  border-radius:24px;

  padding:1.2rem;
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;

  margin-bottom:1rem;
}

.btn-close{
  width:36px;
  height:36px;

  border:none;
  border-radius:10px;

  background:#f3f4f6;

  cursor:pointer;
}

.input-group{
  display:flex;
  flex-direction:column;
  gap:.5rem;

  margin-bottom:1rem;
}

.input-group label{
  font-size:14px;
  font-weight:600;
  color:#374151;
}

.input-group input{
  border:1px solid #e5e7eb;

  border-radius:14px;

  padding:.9rem 1rem;

  outline:none;
}

.input-group input:focus{
  border-color:#22c55e;
}

.acciones-modal{
  display:flex;
  gap:.7rem;
  margin-top:1rem;
}

.btn-cancelar,
.btn-guardar,
.btn-eliminar{
  flex:1;

  border:none;

  border-radius:14px;

  padding:.9rem;

  font-weight:700;

  cursor:pointer;
}

.btn-cancelar{
  background:#e5e7eb;
}

.btn-guardar{
  background:#22c55e;
  color:white;
}

.btn-eliminar{
  background:#ef4444;
  color:white;
}

/* ELIMINAR */

.eliminar-modal{
  text-align:center;
}

.warning-icon{
  width:70px;
  height:70px;

  border-radius:50%;

  background:#fee2e2;

  color:#dc2626;

  display:flex;
  align-items:center;
  justify-content:center;

  margin:0 auto 1rem;
}

.warning-icon .material-icons{
  font-size:34px;
}

/* RESPONSIVE */

@media (max-width:640px){

  .top-card{
    flex-direction:column;
    align-items:flex-start;
  }

  .btn-agregar{
    width:100%;
    justify-content:center;
  }

  .info-grid{
    grid-template-columns:1fr;
  }

}
</style>