<template>
  <div>
    <button @click="abrirModal">Editar Precios</button>

    <div v-if="modalAbierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal">
        <h3>Mis Precios de Piñas</h3>
        <form @submit.prevent="guardar">
          <div v-for="(label, key) in etiquetas" :key="key" class="input-group">
            <label :for="key">{{ label }}</label>
            <input
              :id="key"
              type="number"
              min="0"
              step="0.01"
              v-model.number="precios[key]"
              required
            />
          </div>
          <div class="acciones-modal">
            <button type="submit" class="btn-confirmar">Guardar</button>
            <button type="button" class="btn-cancelar" @click="cerrarModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
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
    .from('preciosPiña') // Ajusta si el nombre de tu tabla es distinto
    .select('*')
    .eq('user_id', usuarioId.value)
    .single()

  if (data) {
    precios.value = { ...data }
    filaId.value = data.id
  } else {
    // Si no hay, asignamos valores por defecto
    precios.value = {
      primera: 0, segunda: 0, tercera: 0, cuarta: 0, quinta: 0,
      sexta: 0, septima: 0, octava: 0, novena: 0
    }
  }

  if (error && error.code !== 'PGRST116') {
    console.error('Error al cargar precios:', error.message)
  }
}

const guardar = async () => {
  const dataAGuardar = {
    ...precios.value,
    user_id: usuarioId.value,
  }

  let res
  if (filaId.value) {
    res = await supabase.from('preciosPiña').update(dataAGuardar).eq('id', filaId.value)
  } else {
    res = await supabase.from('preciosPiña').insert(dataAGuardar)
  }

  if (res.error) {
    alert('Error al guardar precios: ' + res.error.message)
  } else {
    alert('Precios actualizados correctamente')
    cerrarModal()
  }
}

onMounted(() => {
  cargarPrecios()
})
</script>

<style scoped>
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
  max-width: 400px;
  width: 90%;
}
.input-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: bold;
}
input {
  width: 100%;
  padding: 6px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.acciones-modal {
  margin-top: 1.2rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}
.btn-confirmar {
  background-color: #4caf50;
  border: none;
  padding: 0.5rem 1.2rem;
  color: white;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cancelar {
  background-color: #ccc;
  border: none;
  padding: 0.5rem 1.2rem;
  color: #333;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}
</style>
