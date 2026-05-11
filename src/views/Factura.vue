<template>
  <div class="facturas-container">

    <!-- HEADER -->
    <div class="topbar">
      <div>
        <h2>Facturas de Piñas</h2>
        <p>Control y gestión de ventas</p>
      </div>

      <button class="btn-principal" @click="abrirModal">
        + Nueva Factura
      </button>
    </div>

    <!-- FILTROS -->
    <div class="filtros-card">

      <div class="filtro-item">
        <label>Fecha</label>
        <input type="date" v-model="filtroDesde" />
      </div>

      <button class="btn-filtrar" @click="cargarFacturas">
        Filtrar
      </button>

      <PreciosPiña />

    </div>

    <!-- SIN DATOS -->
    <div v-if="facturas.length === 0" class="sin-datos">
      <span class="material-icons">receipt_long</span>
      <p>No hay facturas registradas</p>
    </div>

    <!-- LISTA -->
    <div class="lista-facturas">

      <div
        v-for="factura in facturas"
        :key="factura.id"
        class="card-factura"
      >

        <!-- HEADER CARD -->
        <div class="card-header">

          <div>
            <h3>{{ factura.nombre }}</h3>
            <small>{{ factura.fecha }}</small>
          </div>

          <div class="total-badge">
            C$ {{ totalDinero(factura) }}
          </div>

        </div>

        <!-- TABLA -->
        <div class="tabla-wrapper">

          <table class="tabla-factura">

            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="(label, key) in piñasKeys"
                :key="key"
                v-show="factura[key]"
              >
                <td>{{ label }}</td>
                <td>{{ factura[key] }}</td>
                <td>C$ {{ precios[key] }}</td>
                <td>
                  C$ {{ factura[key] * precios[key] }}
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        <!-- RESUMEN -->
        <div class="resumen">

          <div class="resumen-item">
            <span>Total Piñas</span>
            <strong>{{ totalPinas(factura) }}</strong>
          </div>

          <div class="resumen-item">
            <span>Total</span>
            <strong>C$ {{ totalDinero(factura) }}</strong>
          </div>

          <div class="resumen-item">
            <span>Promedio</span>
            <strong>C$ {{ promedioValor(factura) }}</strong>
          </div>

        </div>

        <!-- ACCIONES -->
        <div class="acciones">

          <button class="btn-editar" @click="editar(factura)">
            Editar
          </button>

          <button
            class="btn-whatsapp"
            @click="compartirWhatsApp(factura)"
          >
            WhatsApp
          </button>

          <button
            class="btn-pdf"
            @click="imprimirFactura(factura)"
          >
            PDF
          </button>

          <button
            class="btn-eliminar"
            @click="confirmarEliminar(factura.id)"
          >
            Eliminar
          </button>

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
            {{ editando ? 'Editar Factura' : 'Nueva Factura' }}
          </h3>

          <button class="cerrar" @click="cerrarModal">
            ✕
          </button>
        </div>

        <form @submit.prevent="guardar">

          <div class="input-grid">

            <input
              type="date"
              v-model="nueva.fecha"
              required
            />

            <input
              type="text"
              v-model="nueva.nombre"
              placeholder="Nombre"
              required
            />

            <input
              type="tel"
              v-model="nueva.celular"
              placeholder="Celular"
              required
            />

            <input
              v-for="(label, key) in piñasKeys"
              :key="key"
              type="number"
              min="0"
              :placeholder="label"
              v-model.number="nueva[key]"
            />

          </div>

          <div class="acciones-modal">

            <button type="button" class="btn-cancelar" @click="cerrarModal">
              Cancelar
            </button>

            <button type="submit" class="btn-guardar">
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
      @click.self="cancelarEliminar"
    >

      <div class="modal modal-small">

        <h3>¿Eliminar factura?</h3>

        <p>Esta acción no se puede deshacer.</p>

        <div class="acciones-modal">

          <button class="btn-cancelar" @click="cancelarEliminar">
            Cancelar
          </button>

          <button class="btn-eliminar" @click="eliminar">
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
import PreciosPiña from '../components/PreciosPiña.vue'

const facturas = ref([])
const filtroDesde = ref('')
const modalAbierto = ref(false)
const modalEliminar = ref(false)
const editando = ref(false)
const idEliminar = ref(null)

const nueva = ref({
  fecha: '',
  nombre: '',
  celular: '',
  primera: null,
  segunda: null,
  tercera: null,
  cuarta: null,
  quinta: null,
  sexta: null,
  septima: null,
  octava: null,
  novena: null,
})

const piñasKeys = {
  primera: 'Primera',
  segunda: 'Segunda',
  tercera: 'Tercera',
  cuarta: 'Cuarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  septima: 'Séptima',
  octava: 'Octava',
  novena: 'Novena',
}

let editId = null
let userId = null

const precios = ref({
  primera: 0,
  segunda: 0,
  tercera: 0,
  cuarta: 0,
  quinta: 0,
  sexta: 0,
  septima: 0,
  octava: 0,
  novena: 0,
})

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id
}

const cargarPrecios = async () => {
  const { data } = await supabase
    .from('preciosPiña')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (data) {
    precios.value = data
  }
}

const cargarFacturas = async () => {
  let query = supabase
    .from('facturaPiñas')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  if (filtroDesde.value) {
    query = query.gte('fecha', filtroDesde.value)
  }

  const { data } = await query

  facturas.value = data || []
}

const totalPinas = (f) =>
  Object.keys(piñasKeys).reduce(
    (acc, key) => acc + (f[key] || 0),
    0
  )

const totalDinero = (f) =>
  Object.keys(piñasKeys).reduce(
    (acc, key) =>
      acc + (f[key] || 0) * (precios.value[key] || 0),
    0
  )

const promedioValor = (f) => {
  const total = totalPinas(f)
  if (!total) return 0
  return (totalDinero(f) / total).toFixed(2)
}

const abrirModal = () => {
  nueva.value = {
    fecha: '',
    nombre: '',
    celular: '',
    primera: null,
    segunda: null,
    tercera: null,
    cuarta: null,
    quinta: null,
    sexta: null,
    septima: null,
    octava: null,
    novena: null,
  }

  editando.value = false
  editId = null
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardar = async () => {

  const facturaGuardar = {
    ...nueva.value,
    user_id: userId,
  }

  if (editando.value) {

    await supabase
      .from('facturaPiñas')
      .update(facturaGuardar)
      .eq('id', editId)

  } else {

    await supabase
      .from('facturaPiñas')
      .insert([facturaGuardar])

  }

  cerrarModal()
  cargarFacturas()
}

const editar = (factura) => {
  nueva.value = { ...factura }
  editando.value = true
  editId = factura.id
  modalAbierto.value = true
}

const confirmarEliminar = (id) => {
  idEliminar.value = id
  modalEliminar.value = true
}

const cancelarEliminar = () => {
  modalEliminar.value = false
}

const eliminar = async () => {

  await supabase
    .from('facturaPiñas')
    .delete()
    .eq('id', idEliminar.value)

  modalEliminar.value = false
  cargarFacturas()
}

const compartirWhatsApp = (factura) => {

  const texto =
`🍍 FACTURA DE PIÑAS

👤 Cliente: ${factura.nombre}
📅 Fecha: ${factura.fecha}

${Object.entries(piñasKeys)
.map(([key, label]) => {
const cantidad = factura[key] || 0
if (!cantidad) return ''

return `• ${label}: ${cantidad}`
})
.join('\n')}

💰 Total: C$ ${totalDinero(factura)}
`

  const numero = factura.celular.replace(/\D/g, '')
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

  window.open(url, '_blank')
}

const imprimirFactura = (factura) => {
  window.print()
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarPrecios()
  await cargarFacturas()
})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.facturas-container{
  width:100%;
  max-width:1200px;
  margin:auto;
  padding:1rem;
}

/* TOPBAR */

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
  gap:1rem;
  flex-wrap:wrap;
}

.topbar h2{
  margin:0;
  font-size:2rem;
  color:#111827;
}

.topbar p{
  margin-top:.3rem;
  color:#6b7280;
}

.btn-principal{
  background:#16a34a;
  color:white;
  border:none;
  padding:.9rem 1.2rem;
  border-radius:14px;
  font-weight:600;
  cursor:pointer;
}

/* FILTROS */

.filtros-card{
  background:white;
  border-radius:18px;
  padding:1rem;
  display:flex;
  flex-wrap:wrap;
  gap:1rem;
  align-items:end;
  margin-bottom:1.5rem;
  box-shadow:0 2px 10px rgba(0,0,0,.05);
}

.filtro-item{
  display:flex;
  flex-direction:column;
  gap:.4rem;
}

.filtro-item label{
  font-size:.9rem;
  color:#6b7280;
}

.filtro-item input{
  padding:.8rem;
  border:1px solid #d1d5db;
  border-radius:12px;
}

.btn-filtrar{
  background:#2563eb;
  color:white;
  border:none;
  padding:.85rem 1rem;
  border-radius:12px;
  cursor:pointer;
}

/* SIN DATOS */

.sin-datos{
  background:white;
  border-radius:18px;
  padding:3rem;
  text-align:center;
  color:#6b7280;
}

.sin-datos span{
  font-size:4rem;
}

/* LISTA */

.lista-facturas{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(350px,1fr));
  gap:1rem;
}

.card-factura{
  background:white;
  border-radius:22px;
  padding:1rem;
  box-shadow:0 5px 15px rgba(0,0,0,.05);
}

.card-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}

.card-header h3{
  margin:0;
  color:#111827;
}

.card-header small{
  color:#6b7280;
}

.total-badge{
  background:#dcfce7;
  color:#15803d;
  padding:.5rem .8rem;
  border-radius:12px;
  font-weight:700;
}

/* TABLA */

.tabla-wrapper{
  overflow:auto;
}

.tabla-factura{
  width:100%;
  border-collapse:collapse;
}

.tabla-factura th{
  background:#f0fdf4;
  color:#166534;
}

.tabla-factura th,
.tabla-factura td{
  padding:.7rem;
  border-bottom:1px solid #f3f4f6;
  text-align:left;
  font-size:.92rem;
}

/* RESUMEN */

.resumen{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:.7rem;
  margin-top:1rem;
}

.resumen-item{
  background:#f9fafb;
  padding:.8rem;
  border-radius:14px;
  text-align:center;
}

.resumen-item span{
  display:block;
  font-size:.85rem;
  color:#6b7280;
}

.resumen-item strong{
  color:#111827;
}

/* BOTONES */

.acciones{
  display:flex;
  flex-wrap:wrap;
  gap:.6rem;
  margin-top:1rem;
}

.acciones button{
  flex:1;
  border:none;
  border-radius:12px;
  padding:.75rem;
  color:white;
  font-weight:600;
  cursor:pointer;
}

.btn-editar{
  background:#2563eb;
}

.btn-whatsapp{
  background:#16a34a;
}

.btn-pdf{
  background:#7c3aed;
}

.btn-eliminar{
  background:#dc2626;
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:2000;
  padding:1rem;
}

.modal{
  width:100%;
  max-width:650px;
  background:white;
  border-radius:24px;
  padding:1.5rem;
  max-height:90vh;
  overflow:auto;
}

.modal-small{
  max-width:400px;
}

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}

.cerrar{
  border:none;
  background:#f3f4f6;
  width:38px;
  height:38px;
  border-radius:50%;
  cursor:pointer;
}

.input-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
  gap:1rem;
}

.input-grid input{
  padding:.9rem;
  border:1px solid #d1d5db;
  border-radius:14px;
  outline:none;
}

.input-grid input:focus{
  border-color:#16a34a;
}

/* MODAL BOTONES */

.acciones-modal{
  display:flex;
  justify-content:end;
  gap:.8rem;
  margin-top:1.3rem;
}

.btn-cancelar,
.btn-guardar{
  border:none;
  padding:.9rem 1.3rem;
  border-radius:14px;
  cursor:pointer;
  font-weight:600;
}

.btn-cancelar{
  background:#e5e7eb;
}

.btn-guardar{
  background:#16a34a;
  color:white;
}

/* RESPONSIVE */

@media(max-width:640px){

  .facturas-container{
    padding:.7rem;
  }

  .topbar{
    flex-direction:column;
    align-items:stretch;
  }

  .btn-principal{
    width:100%;
  }

  .lista-facturas{
    grid-template-columns:1fr;
  }

  .resumen{
    grid-template-columns:1fr;
  }

  .acciones{
    flex-direction:column;
  }

  .input-grid{
    grid-template-columns:1fr 1fr;
  }

}
</style>