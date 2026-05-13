<template>
  <div class="inventario">

    <div class="topbar">

      <div>
        <h2>Inventario</h2>
        <p>Control de bodega agrícola</p>
      </div>

      <button
        class="btn-agregar"
        @click="abrirModal"
      >
        + Nuevo
      </button>

    </div>

    <!-- RESUMEN -->

    <div class="cards-resumen">

      <div class="mini-card">
        <span>Productos</span>
        <h3>{{ inventario.length }}</h3>
      </div>

      <div class="mini-card alerta">
        <span>Stock Bajo</span>
        <h3>{{ stockBajo }}</h3>
      </div>

      <div class="mini-card total">
        <span>Total Unidades</span>
        <h3>{{ totalProductos }}</h3>
      </div>

    </div>

    <!-- FILTROS -->

    <div class="filtros">

      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar producto..."
      />

      <select v-model="categoriaFiltro">

        <option value="">
          Todas las categorías
        </option>

        <option
          v-for="cat in categorias"
          :key="cat"
          :value="cat"
        >
          {{ cat }}
        </option>

      </select>

    </div>

    <!-- LISTA -->

    <div class="lista">

      <div
        v-for="item in inventarioFiltrado"
        :key="item.id"
        class="card"
      >

        <div class="header-card">

          <div>
            <h3>{{ item.nombre }}</h3>

            <small>
              {{ item.categoria }}
            </small>
          </div>

          <span
            class="estado"
            :class="{
              bajo: item.cantidad <= item.stock_minimo
            }"
          >
            {{
              item.cantidad <= item.stock_minimo
              ? 'Stock Bajo'
              : 'Disponible'
            }}
          </span>

        </div>

        <div class="contenido">

          <p>
            <strong>Cantidad:</strong>
            {{ item.cantidad }} {{ item.unidad }}
          </p>

          <p>
            <strong>Stock mínimo:</strong>
            {{ item.stock_minimo }}
          </p>

          <p>
            <strong>Fecha:</strong>
            {{ item.fecha }}
          </p>

          <p v-if="item.observacion">
            <strong>Observación:</strong>
            {{ item.observacion }}
          </p>

        </div>

        <div class="acciones">

          <button
            class="btn-icon editar"
            @click="editar(item)"
          >
            <Icon icon="mdi:pencil-outline" />
          </button>

          <button
            class="btn-icon eliminar"
            @click="eliminar(item.id)"
          >
            <Icon icon="mdi:delete-outline" />
          </button>

        </div>

      </div>

    </div>

    <!-- MODAL CREAR / EDITAR -->

    <div
      v-if="modal"
      class="modal-overlay"
      @click.self="cerrarModal"
    >

      <div class="modal">

        <div class="modal-header">

          <h3>
            {{
              editando
              ? 'Editar producto'
              : 'Nuevo producto'
            }}
          </h3>

          <button
            class="cerrar"
            @click="cerrarModal"
          >
            ✕
          </button>

        </div>

        <form @submit.prevent="guardar">

          <input
            v-model="nuevo.nombre"
            type="text"
            placeholder="Nombre del producto"
            required
          />

          <select
            v-model="nuevo.categoria"
            required
          >
            <option value="">
              Seleccionar categoría
            </option>

            <option>Fertilizantes</option>
            <option>Herbicidas</option>
            <option>Fungicidas</option>
            <option>Herramientas</option>
            <option>Combustible</option>
            <option>Semillas</option>
            <option>Otros</option>
          </select>

          <div class="grid">

            <input
              v-model.number="nuevo.cantidad"
              type="number"
              placeholder="Cantidad"
              required
            />

            <select
              v-model="nuevo.unidad"
              required
            >
              <option value="">
                Unidad
              </option>

              <option value="kg">Kilogramos</option>
              <option value="lb">Libras</option>
              <option value="qq">Quintales</option>
              <option value="L">Litros</option>
              <option value="ml">Mililitros</option>
              <option value="galones">Galones</option>
              <option value="sacos">Sacos</option>
              <option value="bolsas">Bolsas</option>
              <option value="cajas">Cajas</option>
              <option value="plantas">Plantas</option>
              <option value="piñas">Piñas</option>
              <option value="unidades">Unidades</option>
              <option value="otros">Otros</option>
            </select>

          </div>

          <div class="grid">

            <input
              v-model.number="nuevo.stock_minimo"
              type="number"
              placeholder="Stock mínimo"
            />

            <input
              v-model="nuevo.fecha"
              type="date"
            />

          </div>

          <textarea
            v-model="nuevo.observacion"
            placeholder="Observación"
          ></textarea>

          <div class="acciones-modal">

            <button
              type="button"
              class="cancelar"
              @click="cerrarModal"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="guardar"
            >
              {{
                editando
                ? 'Actualizar'
                : 'Guardar'
              }}
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

      <div class="modal modal-eliminar">

        <div class="icono-eliminar">
          <Icon icon="mdi:alert-circle-outline" />
        </div>

        <h3>Eliminar producto</h3>

        <p>
          ¿Seguro que deseas eliminar este
          producto del inventario?
        </p>

        <div class="acciones-modal">

          <button
            class="cancelar"
            @click="cerrarModalEliminar"
          >
            Cancelar
          </button>

          <button
            class="btn-eliminar"
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
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { supabase } from '../supabase'

import { Icon } from '@iconify/vue'

const inventario = ref([])

const busqueda = ref('')
const categoriaFiltro = ref('')

const modal = ref(false)
const modalEliminar = ref(false)

const editando = ref(false)

let editId = null
let userId = null

const idEliminar = ref(null)

const nuevo = ref({
  nombre: '',
  categoria: '',
  cantidad: 0,
  unidad: '',
  stock_minimo: 0,
  fecha: '',
  observacion: ''
})

const obtenerUsuario = async () => {

  const { data } =
    await supabase.auth.getUser()

  userId = data.user?.id
}

const cargarInventario = async () => {

  const { data } = await supabase
    .from('inventario')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', {
      ascending: false
    })

  inventario.value = data || []
}

const guardar = async () => {

  const dataGuardar = {
    ...nuevo.value,
    user_id: userId
  }

  if (editando.value) {

    await supabase
      .from('inventario')
      .update(dataGuardar)
      .eq('id', editId)

  } else {

    await supabase
      .from('inventario')
      .insert([dataGuardar])
  }

  cerrarModal()

  cargarInventario()
}

const editar = (item) => {

  nuevo.value = { ...item }

  editId = item.id

  editando.value = true

  modal.value = true
}

const eliminar = (id) => {

  idEliminar.value = id

  modalEliminar.value = true
}

const confirmarEliminar = async () => {

  if (!idEliminar.value) return

  await supabase
    .from('inventario')
    .delete()
    .eq('id', idEliminar.value)

  cerrarModalEliminar()

  cargarInventario()
}

const abrirModal = () => {

  nuevo.value = {
    nombre: '',
    categoria: '',
    cantidad: 0,
    unidad: '',
    stock_minimo: 0,
    fecha: '',
    observacion: ''
  }

  editando.value = false

  modal.value = true
}

const cerrarModal = () => {

  modal.value = false
}

const cerrarModalEliminar = () => {

  modalEliminar.value = false

  idEliminar.value = null
}

const categorias = computed(() => {

  return [
    ...new Set(
      inventario.value.map(
        i => i.categoria
      )
    )
  ]
})

const inventarioFiltrado = computed(() => {

  return inventario.value.filter(item => {

    const coincideNombre =
      item.nombre
        .toLowerCase()
        .includes(
          busqueda.value.toLowerCase()
        )

    const coincideCategoria =
      !categoriaFiltro.value ||
      item.categoria === categoriaFiltro.value

    return coincideNombre &&
      coincideCategoria
  })
})

const stockBajo = computed(() => {

  return inventario.value.filter(
    item =>
      item.cantidad <= item.stock_minimo
  ).length
})

const totalProductos = computed(() => {

  return inventario.value.reduce(
    (acc, item) =>
      acc + Number(item.cantidad || 0),
    0
  )
})

onMounted(async () => {

  await obtenerUsuario()

  await cargarInventario()
})
</script>

<style scoped>
.inventario{
  width:95%;
  margin:auto;
  padding:1rem;
  font-family:Arial,sans-serif;
}

/* TOPBAR */

.topbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
  gap:1rem;
}

.topbar h2{
  margin:0;
  font-size:1.6rem;
}

.topbar p{
  margin-top:.2rem;
  color:#6b7280;
}

.btn-agregar{
  border:none;
  background:#22c55e;
  color:white;
  padding:.8rem 1.2rem;
  border-radius:14px;
  cursor:pointer;
  font-weight:bold;
  transition:.2s;
}

.btn-agregar:hover{
  transform:scale(1.03);
}

/* RESUMEN */

.cards-resumen{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(150px,1fr));
  gap:1rem;
  margin-bottom:1rem;
}

.mini-card{
  background:white;
  border-radius:18px;
  padding:1rem;
  box-shadow:
  0 2px 10px rgba(0,0,0,.05);
}

.mini-card span{
  color:#6b7280;
  font-size:.8rem;
}

.mini-card h3{
  margin-top:.4rem;
  font-size:1.4rem;
}

.alerta{
  border-left:5px solid #ef4444;
}

.total{
  border-left:5px solid #3b82f6;
}

/* FILTROS */

.filtros{
  display:flex;
  gap:.8rem;
  margin-bottom:1rem;
}

.filtros input,
.filtros select{
  flex:1;
  padding:.9rem;
  border-radius:14px;
  border:1px solid #e5e7eb;
  background:white;
}

/* LISTA */

.lista{
  display:grid;
  grid-template-columns:
  repeat(auto-fit,minmax(280px,1fr));
  gap:1rem;
}

.card{
  background:white;
  border-radius:20px;
  padding:1rem;
  box-shadow:
  0 3px 12px rgba(0,0,0,.05);
}

.header-card{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:.8rem;
}

.header-card h3{
  margin:0;
}

.header-card small{
  color:#6b7280;
}

.estado{
  background:#dcfce7;
  color:#166534;
  padding:.35rem .7rem;
  border-radius:999px;
  font-size:.72rem;
  font-weight:bold;
}

.estado.bajo{
  background:#fee2e2;
  color:#991b1b;
}

.contenido{
  margin-top:1rem;
}

.contenido p{
  margin:.45rem 0;
  color:#374151;
  font-size:.95rem;
}

/* ACCIONES */

.acciones{
  display:flex;
  justify-content:flex-end;
  gap:.7rem;
  margin-top:1rem;
}

.btn-icon{
  width:40px;
  height:40px;
  border:none;
  border-radius:12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.2rem;
  transition:.2s;
}

.editar{
  background:#dcfce7;
  color:#166534;
}

.eliminar{
  background:#fee2e2;
  color:#ef4444;
}

.btn-icon:hover{
  transform:scale(1.05);
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:1000;
  padding:1rem;
}

.modal{
  background:white;
  width:100%;
  max-width:480px;
  border-radius:24px;
  padding:1.2rem;
  animation:aparecer .2s ease;
}

@keyframes aparecer{
  from{
    opacity:0;
    transform:scale(.95);
  }
  to{
    opacity:1;
    transform:scale(1);
  }
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
  width:35px;
  height:35px;
  border-radius:50%;
  cursor:pointer;
}

.modal form{
  display:flex;
  flex-direction:column;
  gap:.9rem;
}

.modal input,
.modal select,
.modal textarea{
  width:100%;
  padding:.9rem;
  border-radius:14px;
  border:1px solid #e5e7eb;
  box-sizing:border-box;
}

.modal textarea{
  min-height:90px;
  resize:none;
}

.grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:.8rem;
}

/* BOTONES MODAL */

.acciones-modal{
  display:flex;
  gap:.8rem;
  margin-top:.5rem;
}

.acciones-modal button{
  flex:1;
  border:none;
  padding:.9rem;
  border-radius:14px;
  cursor:pointer;
  font-weight:bold;
}

.cancelar{
  background:#ef4444;
  color:white;
}

.guardar{
  background:#22c55e;
  color:white;
}

.btn-eliminar{
  background:#ef4444;
  color:white;
}

/* MODAL ELIMINAR */

.modal-eliminar{
  max-width:380px;
  text-align:center;
  padding:1.5rem;
}

.icono-eliminar{
  width:75px;
  height:75px;
  margin:auto;
  margin-bottom:1rem;
  border-radius:50%;
  background:#fee2e2;
  display:flex;
  align-items:center;
  justify-content:center;
}

.icono-eliminar svg{
  font-size:40px;
  color:#ef4444;
}

.modal-eliminar h3{
  margin-bottom:.5rem;
}

.modal-eliminar p{
  color:#6b7280;
  margin-bottom:1rem;
  line-height:1.4;
}

/* RESPONSIVE */

@media(max-width:768px){

  .inventario{
    width:90%;
    padding:.8rem;
    padding-bottom:6rem;
  }

  .topbar{
    flex-direction:column;
    align-items:flex-start;
  }

  .btn-agregar{
    width:100%;
  }

  .cards-resumen{
    grid-template-columns:
    repeat(2,1fr);
  }

  .filtros{
    flex-direction:column;
  }

  .lista{
    grid-template-columns:1fr;
  }

  .grid{
    grid-template-columns:1fr;
  }

  .acciones-modal{
    flex-direction:column;
  }

}
</style>