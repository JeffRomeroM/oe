<template>
  <div class="facturas-container">
    <h2>Facturas de Piñas</h2>

    <div class="filtros">
      <input type="date" v-model="filtroDesde" />
      <button @click="cargarFacturas">Filtrar</button>
      <button @click="abrirModal()">Nueva Factura</button>
      <PreciosPiña />
    </div>

    <div v-if="facturas.length === 0" class="sin-datos">No hay facturas.</div>

    <div class="lista-facturas">
      <div
        v-for="factura in facturas"
        :key="factura.id"
        class="card-factura"
      >
        <header>
          <h3>{{ factura.nombre }}</h3>
          <small>{{ factura.fecha }}</small>
        </header>
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
            <tr v-if="factura.primera">
              <td>Primera</td>
              <td>{{ factura.primera }}</td>
              <td>C$ {{ precios.primera }}</td>
              <td>C$ {{ factura.primera * precios.primera }}</td>
            </tr>
            <tr v-if="factura.segunda">
              <td>Segunda</td>
              <td>{{ factura.segunda }}</td>
              <td>C$ {{ precios.segunda }}</td>
              <td>C$ {{ factura.segunda * precios.segunda }}</td>
            </tr>
            <tr v-if="factura.tercera">
              <td>Tercera</td>
              <td>{{ factura.tercera }}</td>
              <td>C$ {{ precios.tercera }}</td>
              <td>C$ {{ factura.tercera * precios.tercera }}</td>
            </tr>
            <tr v-if="factura.cuarta">
              <td>Cuarta</td>
              <td>{{ factura.cuarta }}</td>
              <td>C$ {{ precios.cuarta }}</td>
              <td>C$ {{ factura.cuarta * precios.cuarta }}</td>
            </tr>
            <tr v-if="factura.quinta">
              <td>Quinta</td>
              <td>{{ factura.quinta }}</td>
              <td>C$ {{ precios.quinta }}</td>
              <td>C$ {{ factura.quinta * precios.quinta }}</td>
            </tr>
            <tr v-if="factura.sexta">
              <td>Sexta</td>
              <td>{{ factura.sexta }}</td>
              <td>C$ {{ precios.sexta }}</td>
              <td>C$ {{ factura.sexta * precios.sexta }}</td>
            </tr>
            <tr v-if="factura.septima">
              <td>Séptima</td>
              <td>{{ factura.septima }}</td>
              <td>C$ {{ precios.septima }}</td>
              <td>C$ {{ factura.septima * precios.septima }}</td>
            </tr>
            <tr v-if="factura.octava">
              <td>Octava</td>
              <td>{{ factura.octava }}</td>
              <td>C$ {{ precios.octava }}</td>
              <td>C$ {{ factura.octava * precios.octava }}</td>
            </tr>
            <tr v-if="factura.novena">
              <td>Novena</td>
              <td>{{ factura.novena }}</td>
              <td>C$ {{ precios.novena }}</td>
              <td>C$ {{ factura.novena * precios.novena }}</td>
            </tr>
          </tbody>
        </table>

        <div class="resumen">
          <div><strong>Total Piñas:</strong> {{ totalPinas(factura) }}</div>
          <div><strong>Total: C$</strong> {{ totalDinero(factura) }}</div>
          <div><strong>Promedio: C$</strong> {{ promedioValor(factura) }}</div>
        </div>
        <div class="acciones">
          <button @click="editar(factura)">Editar</button>
          <button @click="confirmarEliminar(factura.id)" class="eliminar">
            Eliminar
          </button>
          <button @click="compartirWhatsApp(factura)">Compartir WhatsApp</button>
          <button @click="imprimirFactura(factura)">Imprimir / PDF</button>
        </div>
      </div>
    </div>

    <!-- Modal Insertar/Editar -->
    <div
      v-if="modalAbierto"
      class="modal-overlay"
      @click.self="cerrarModal"
    >
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
    <div
      v-if="modalEliminar"
      class="modal-overlay"
      @click.self="cancelarEliminar"
    >
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
import PreciosPiña from './PreciosPiña.vue'

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
  const { data, error } = await supabase
    .from('preciosPiña')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!error && data) {
    precios.value = {
      primera: data.primera,
      segunda: data.segunda,
      tercera: data.tercera,
      cuarta: data.cuarta,
      quinta: data.quinta,
      sexta: data.sexta,
      septima: data.septima,
      octava: data.octava,
      novena: data.novena,
    }
  } else {
    console.warn(
      'No se encontraron precios personalizados, usa valores por defecto.'
    )
  }
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
  Object.keys(piñasKeys).reduce(
    (acc, key) => acc + (f[key] || 0) * (precios.value[key] || 0),
    0
  )

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

const cerrarModal = () => {
  modalAbierto.value = false
}

const guardar = async () => {
  if (!nueva.value.fecha || !nueva.value.nombre || !nueva.value.celular) {
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

const compartirWhatsApp = (factura) => {
  const texto =
    `Factura Piñas\n` +
    `Fecha: ${factura.fecha}\n` +
    `Nombre: ${factura.nombre}\n` +
    `Detalle:\n` +
    Object.entries(piñasKeys)
      .map(([key, label]) => {
        const cantidad = factura[key] || 0
        const precio = precios.value[key] || 0
        const subtotal = cantidad * precio
        return `  ${label}: ${cantidad} x C$ ${precio} = C$ ${subtotal}`
      })
      .join('\n') +
    `\nTotal piñas: ${totalPinas(factura)}` +
    `\nTotal C$: ${totalDinero(factura)}` +
    `\nPromedio: ${promedioValor(factura)}`

  const numero = factura.celular.replace(/\D/g, '')
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
  window.open(url, '_blank')
}

const imprimirFactura = (factura) => {
  const contenido = `
    <html>
      <head>
        <title>Factura de Piñas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 10px;}
          th, td { border: 1px solid #4caf50; padding: 8px; text-align: left;}
          h1, h2, h3, p { margin: 0; padding: 0; 
          
          }
          .resumen { margin-top: 20px; font-weight: bold; 
          }
          
        </style>
      </head>
      <body>
       
          <h2>Factura de Piñas</h2>
        <p><strong>Fecha:</strong> ${factura.fecha}</p>
        <p><strong>Nombre:</strong> ${factura.nombre}</p>
        <p><strong>Celular:</strong> ${factura.celular}</p>

        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(piñasKeys)
              .map(([key, label]) => {
                const cant = factura[key] || 0
                if (cant === 0) return ''
                const precio = precios.value[key] || 0
                const subtotal = cant * precio
                return `
                  <tr>
                    <td>${label}</td>
                    <td>${cant}</td>
                    <td>C$ ${precio}</td>
                    <td>C$ ${subtotal}</td>
                  </tr>
                `
              })
              .join('')}
          </tbody>
        </table>

        <div class="resumen">
          <p>Total Piñas: ${totalPinas(factura)}</p>
          <p>Total C$: ${totalDinero(factura)}</p>
          <p>Promedio C$: ${promedioValor(factura)}</p>
        </div>

      </body>
    </html>
  `
  const ventana = window.open('', '', 'width=600,height=700')
  ventana.document.write(contenido)
  ventana.document.close()
  ventana.focus()
  ventana.print()
  ventana.close()
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarPrecios()
  await cargarFacturas()
})
</script>


<style>
.facturas-container {
  width: 95%;
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
  width: 80%;
  padding: 10px;
  margin: auto;
  background: #f1f7f2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  
}

.card-factura header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.tabla-factura{
  width: 95%;
  margin: auto;
}

.tabla-factura th,
.tabla-factura td {
  border: 1px solid #4caf50; /* color de las líneas */
  padding: 8px;
  text-align: left;
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
  .facturas-container {
  width: 100%;
  margin: auto;
  padding: 1px;
  font-family: Arial, sans-serif;
}
  .input-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .card-factura {
  border: 1px solid #4caf50;
  border-radius: 8px;
  width: 100%;
  padding: 10px;
  margin: auto;
  background: #f1f7f2;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
}
  .resumen {
    flex-direction: column;
    gap: 0.2rem;
  }

  .tabla-factura{
    width: 100%;
    
    margin: auto;
  }
  .tabla-factura th,
  .tabla-factura td {
    border: 1px solid #4caf50; /* color de las líneas */
    padding: 0px;
    text-align: left;
  }

  
}
</style>
