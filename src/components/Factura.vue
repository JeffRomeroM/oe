<template>
  <div class="facturas-container">
    <h2>Facturas de Piñas</h2>

    <div class="filtros">
      <input type="date" v-model="filtroDesde" />
      <input type="date" v-model="filtroHasta" />
      <button @click="cargarFacturas">Filtrar</button>
      <button @click="abrirModal()">Nueva Factura</button>
    </div>

    <div v-if="facturas.length === 0" class="sin-datos">No hay facturas.</div>

    <div class="lista-facturas">
      <div v-for="factura in facturas" :key="factura.id" class="card-factura">
        <header>
          <h3>{{ factura.nombre }}</h3>
          <small>{{ factura.fecha }}</small>
        </header>
        <div class="detalle-pinas">
          <div><strong>Primera:</strong> {{ factura.primera }}* 38 <strong>(C$ {{ factura.primera * 38 }})</strong></div>
          <div><strong>Segunda:</strong> {{ factura.segunda }}* 35 <strong>(C$ {{ factura.segunda * 35 }})</strong></div>
          <div><strong>Tercera:</strong> {{ factura.tercera }}* 30 (C$ {{ factura.tercera * 30 }})</div>
          <div><strong>Cuarta:</strong> {{ factura.cuarta }}* 25 (C$ {{ factura.cuarta * 25 }})</div>
          <div><strong>Quinta:</strong> {{ factura.quinta }}* 19 (C$ {{ factura.quinta * 19 }})</div>
          <div><strong>Sexta:</strong> {{ factura.sexta }}* 15 (C$ {{ factura.sexta * 15 }})</div>
          <div><strong>Séptima:</strong> {{ factura.septima }}* 10 (C$ {{ factura.septima * 10 }})</div>
          <div><strong>Octava:</strong> {{ factura.octava }}* 6 (C$ {{ factura.octava * 6 }})</div>
          <div><strong>Novena:</strong> {{ factura.novena }}* 4 (C$ {{ factura.novena * 4 }})</div>
        </div>
        <div class="resumen"> 
          <div><strong>Total Piñas:</strong> {{ totalPinas(factura) }}</div>
          <div><strong>Total: C$</strong> {{ totalDinero(factura) }}</div>
          <div><strong>Promedio: C$</strong> {{ promedioValor(factura) }}</div>
        </div>
        <div class="acciones">
          <button @click="editar(factura)">Editar</button>
          <button @click="confirmarEliminar(factura.id)" class="eliminar">Eliminar</button>
          <button @click="compartirWhatsApp(factura)">Compartir WhatsApp</button>
        </div>
      </div>
    </div>

    <!-- Modal Insertar/Editar -->
    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <h3>{{ editando ? 'Editar Factura' : 'Nueva Factura' }}</h3>
        <form @submit.prevent="guardar">
          <div class="input-grid">
            <input
              type="date"
              v-model="nueva.fecha"
              required
              placeholder="Fecha"
            />
            <input
              type="text"
              v-model="nueva.nombre"
              required
              placeholder="Nombre"
            />
            <input
              type="tel"
              v-model="nueva.celular"
              required
              placeholder="Celular"
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
            <button type="submit" class="btn-confirmar">
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </button>
            <button type="button" class="btn-cancelar" @click="cerrarModal">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar eliminar -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="cancelarEliminar">
      <div class="modal">
        <h3>Confirmar eliminación</h3>
        <p>¿Seguro que deseas eliminar esta factura?</p>
        <div class="acciones-modal">
          <button class="btn-cancelar" @click="cancelarEliminar">Cancelar</button>
          <button class="btn-confirmar" @click="eliminar">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const facturas = ref([])
const filtroDesde = ref('')
const filtroHasta = ref('')
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

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId = data.user?.id
}

const cargarFacturas = async () => {
  let query = supabase
    .from('facturaPiñas')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })

  if (filtroDesde.value) query = query.gte('fecha', filtroDesde.value)
  if (filtroHasta.value) query = query.lte('fecha', filtroHasta.value)

  const { data, error } = await query

  if (error) {
    alert('Error cargando facturas: ' + error.message)
  } else {
    facturas.value = data || []
  }
}

const totalPinas = (f) =>
  Object.keys(piñasKeys).reduce((acc, key) => acc + (f[key] || 0), 0)

const totalDinero = (f) =>
  (f.primera || 0) * 38 +
  (f.segunda || 0) * 35 +
  (f.tercera || 0) * 30 +
  (f.cuarta || 0) * 25 +
  (f.quinta || 0) * 19 +
  (f.sexta || 0) * 15 +
  (f.septima || 0) * 10 +
  (f.octava || 0) * 6 +
  (f.novena || 0) * 4

const promedioValor = (f) => {
  const total = totalPinas(f)
  if (total === 0) return 0
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
  modalAbierto.value = true
  editId = null
}

const guardar = async () => {
  if (
    !nueva.value.fecha ||
    !nueva.value.nombre ||
    !nueva.value.celular
  ) {
    alert('Llena los campos obligatorios')
    return
  }

  const facturaGuardar = { ...nueva.value, user_id: userId }
  if (editando.value) {
    const { error } = await supabase
      .from('facturaPiñas')
      .update(facturaGuardar)
      .eq('id', editId)
    if (error) alert('Error al actualizar: ' + error.message)
  } else {
    const { error } = await supabase.from('facturaPiñas').insert([facturaGuardar])
    if (error) alert('Error al guardar: ' + error.message)
  }

  modalAbierto.value = false
  cargarFacturas()
}

const editar = (factura) => {
  nueva.value = { ...factura }
  editId = factura.id
  editando.value = true
  modalAbierto.value = true
}

const confirmarEliminar = (id) => {
  idEliminar.value = id
  modalEliminar.value = true
}

const cancelarEliminar = () => {
  modalEliminar.value = false
  idEliminar.value = null
}

const eliminar = async () => {
  if (!idEliminar.value) return
  const { error } = await supabase.from('facturaPiñas').delete().eq('id', idEliminar.value)
  if (error) alert('Error al eliminar: ' + error.message)
  else {
    modalEliminar.value = false
    cargarFacturas()
  }
}
const precios = {
  primera: 38,
  segunda: 35,
  tercera: 30,
  cuarta: 25,
  quinta: 19,
  sexta: 15,
  septima: 10,
  octava: 6,
  novena: 4,
}

const compartirWhatsApp = (factura) => {
  const texto =
    `Factura Piñas\n` +
    `Fecha: ${factura.fecha}\n` +
    `Nombre: ${factura.nombre}\n` +
    `Detalle:\n` +
    Object.entries(piñasKeys)
      .map(([key, label]) => {
        const cantidad = factura[key] || 0;
        const precio = precios[key] || 0;
        const subtotal = cantidad * precio;
        return `  ${label}: ${cantidad} x C$ ${precio} = C$ ${subtotal}`;
      })
      .join('\n') +
    `\nTotal piñas: ${totalPinas(factura)}` +
    `\nTotal C$: ${totalDinero(factura)}` +
    `\nPromedio: ${promedioValor(factura)}`;

  const numero = factura.celular.replace(/\D/g, ''); // solo números
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
};

onMounted(async () => {
  await obtenerUsuario()
  await cargarFacturas()
})
</script>

<style>
.facturas-container {
  width: 90%;
  margin: auto;
  padding: 1px;
  font-family: Arial, sans-serif;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: center;
}

.filtros input[type='date'] {
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
}

.filtros button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
}

.filtros button:hover {
  background-color: #388e3c;
}

.sin-datos {
  text-align: center;
  color: #666;
  margin-top: 2rem;
}

.lista-facturas {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  width: 100%;
}

.card-factura {
  border: 1px solid #4caf50;
  border-radius: 8px;
  width: 90%;
  padding: 1rem;
  background: #f1f7f2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
}

.card-factura header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.detalle-pinas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.3rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.detalle-pinas div {
    width: 100%;
    border-bottom: 1px solid;
    
}
.detalle-pinas div strong{
    padding: 10px;
    
}

.resumen {
  display: flex;
  justify-content: space-around;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.acciones {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.acciones button {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}
.acciones .eliminar {
  background-color: #da0808;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
}


.acciones button:hover {
  background-color: #388e3c;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #4caf50;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.8rem;
}

.input-grid input[type='date'],
.input-grid input[type='text'],
.input-grid input[type='tel'],
.input-grid input[type='number'] {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  color: #333;
}

.input-grid input::placeholder {
  color: #aaa;
}

.acciones-modal {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.btn-confirmar {
  background-color: #4caf50;
  border: none;
  padding: 0.6rem 1.2rem;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

.btn-confirmar:hover {
  background-color: #388e3c;
}

.btn-cancelar {
  background-color: #ccc;
  border: none;
  padding: 0.6rem 1.2rem;
  color: #333;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #aaa;
}

/* Responsive */
@media (max-width: 600px) {
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .resumen {
    flex-direction: column;
    gap: 0.2rem;
  }
  
}
</style>
