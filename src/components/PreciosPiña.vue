<template>
  <div>

    <button class="btn-open" @click="abrirModal">
      <span class="material-icons">sell</span>
      Editar Precios
    </button>

    <!-- MODAL -->
    <transition name="fade">
      <div
        v-if="modalAbierto"
        class="modal-overlay"
        @click.self="cerrarModal"
      >

        <div class="modal">

          <!-- HEADER -->
          <div class="modal-header">

            <div>
              <h3>Precios de Piñas</h3>
              <p>Actualiza el valor de cada categoría</p>
            </div>

            <button class="btn-close" @click="cerrarModal">
              ✕
            </button>

          </div>

          <!-- FORM -->
          <form @submit.prevent="guardar">

            <div class="grid-precios">

              <div
                v-for="(label, key) in etiquetas"
                :key="key"
                class="precio-card"
              >

                <div class="precio-info">

                  <span class="precio-nombre">
                    {{ label }}
                  </span>

                  <small>
                    Precio por unidad
                  </small>

                </div>

                <div class="input-wrapper">

                  <span class="currency">
                    C$
                  </span>

                  <input
                    :id="key"
                    type="number"
                    min="0"
                    step="0.01"
                    v-model.number="precios[key]"
                    required
                  />

                </div>

              </div>

            </div>

            <!-- FOOTER -->
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
                Guardar Cambios
              </button>

            </div>

          </form>

        </div>

      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const modalAbierto = ref(false)

const precios = ref({})

const usuarioId = ref(null)

const filaId = ref(null)

const etiquetas = {
  primera: 'Primera',
  segunda: 'Segunda',
  tercera: 'Tercera',
  cuarta: 'Cuarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
  septima: 'Séptima',
  octava: 'Octava',
  novena: 'Novena'
}

const abrirModal = () => {
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
}

const cargarPrecios = async () => {

  const { data: userData } = await supabase.auth.getUser()

  usuarioId.value = userData.user.id

  const { data, error } = await supabase
    .from('preciosPiña')
    .select('*')
    .eq('user_id', usuarioId.value)
    .single()

  if (data) {

    precios.value = { ...data }

    filaId.value = data.id

  } else {

    precios.value = {
      primera: 0,
      segunda: 0,
      tercera: 0,
      cuarta: 0,
      quinta: 0,
      sexta: 0,
      septima: 0,
      octava: 0,
      novena: 0
    }

  }

  if (error && error.code !== 'PGRST116') {
    console.error(error.message)
  }

}

const guardar = async () => {

  const dataAGuardar = {
    ...precios.value,
    user_id: usuarioId.value,
  }

  let res

  if (filaId.value) {

    res = await supabase
      .from('preciosPiña')
      .update(dataAGuardar)
      .eq('id', filaId.value)

  } else {

    res = await supabase
      .from('preciosPiña')
      .insert(dataAGuardar)

  }

  if (res.error) {

    alert('Error: ' + res.error.message)

  } else {

    cerrarModal()

  }

}

onMounted(() => {
  cargarPrecios()
})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

/* BOTON */

.btn-open{
  display:flex;
  align-items:center;
  gap:.5rem;
  background:#16a34a;
  color:white;
  border:none;
  padding:.85rem 1.2rem;
  border-radius:14px;
  font-weight:600;
  cursor:pointer;
  transition:.2s;
  box-shadow:0 4px 12px rgba(22,163,74,.2);
}

.btn-open:hover{
  transform:translateY(-2px);
  background:#15803d;
}

.btn-open .material-icons{
  font-size:20px;
}

/* MODAL */

.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.45);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
  padding:1rem;
  backdrop-filter:blur(4px);
}

.modal{
  width:100%;
  max-width:750px;
  background:white;
  border-radius:28px;
  overflow:hidden;
  box-shadow:0 20px 50px rgba(0,0,0,.15);
  animation:show .25s ease;
}

/* HEADER */

.modal-header{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  padding:1.5rem;
  border-bottom:1px solid #f1f5f9;
}

.modal-header h3{
  margin:0;
  font-size:1.5rem;
  color:#111827;
}

.modal-header p{
  margin-top:.4rem;
  color:#6b7280;
  font-size:.95rem;
}

.btn-close{
  width:40px;
  height:40px;
  border:none;
  background:#f3f4f6;
  border-radius:50%;
  cursor:pointer;
  font-size:1rem;
  transition:.2s;
}

.btn-close:hover{
  background:#e5e7eb;
}

/* GRID */

.grid-precios{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:1rem;
  padding:1.5rem;
}

/* CARD */

.precio-card{
  background:#f9fafb;
  border:1px solid #eef2f7;
  border-radius:20px;
  padding:1rem;
  transition:.2s;
}

.precio-card:hover{
  border-color:#86efac;
  transform:translateY(-2px);
}

.precio-info{
  margin-bottom:.8rem;
}

.precio-nombre{
  display:block;
  font-size:1rem;
  font-weight:700;
  color:#111827;
}

.precio-info small{
  color:#6b7280;
}

/* INPUT */

.input-wrapper{
  position:relative;
}

.currency{
  position:absolute;
  left:14px;
  top:50%;
  transform:translateY(-50%);
  color:#16a34a;
  font-weight:700;
}

.input-wrapper input{
  width:100%;
  height:52px;
  border:1px solid #d1d5db;
  border-radius:14px;
  padding:0 1rem 0 3rem;
  font-size:1rem;
  outline:none;
  transition:.2s;
}

.input-wrapper input:focus{
  border-color:#16a34a;
  box-shadow:0 0 0 4px rgba(34,197,94,.12);
}

/* FOOTER */

.acciones-modal{
  display:flex;
  justify-content:flex-end;
  gap:1rem;
  padding:1.5rem;
  border-top:1px solid #f1f5f9;
}

.btn-cancelar,
.btn-guardar{
  border:none;
  padding:.9rem 1.3rem;
  border-radius:14px;
  font-weight:600;
  cursor:pointer;
  transition:.2s;
}

.btn-cancelar{
  background:#e5e7eb;
  color:#374151;
}

.btn-cancelar:hover{
  background:#d1d5db;
}

.btn-guardar{
  background:#16a34a;
  color:white;
  box-shadow:0 6px 15px rgba(22,163,74,.25);
}

.btn-guardar:hover{
  background:#15803d;
  transform:translateY(-1px);
}

/* ANIMACIONES */

.fade-enter-active,
.fade-leave-active{
  transition:.2s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
}

@keyframes show{

  from{
    opacity:0;
    transform:translateY(15px) scale(.96);
  }

  to{
    opacity:1;
    transform:none;
  }

}

/* RESPONSIVE */

@media(max-width:640px){

  .modal{
    border-radius:24px 24px 0 0;
    margin-top:auto;
    max-height:90vh;
    overflow:auto;
  }

  .grid-precios{
    grid-template-columns:1fr;
    padding:1rem;
  }

  .acciones-modal{
    flex-direction:column-reverse;
  }

  .btn-cancelar,
  .btn-guardar{
    width:100%;
  }

}
</style>