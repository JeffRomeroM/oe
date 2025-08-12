<template>
  <header class="header">
    <h1 class="app-name" @click="irARuta('dashboard')">Agro</h1>
    <div class="botones">
      <button @click="irARuta('agricultura')">Agricultura</button>
      <button @click="irARuta('ganaderia')">Ganadería</button>
    </div>
    <div class="user-info" v-if="fullName" @click="mostrarModal = true">
      <div class="icono">
        {{ obtenerIniciales(fullName) }}
      </div>
      <span class="user-name">{{ fullName }}</span>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="mostrarModal">
      <div class="modal">
        <h3>¿Deseas cerrar sesión?</h3>
        <div class="modal-buttons">
          <button class="confirm" @click="logout">Sí</button>
          <button class="cancel" @click="mostrarModal = false">No</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const obtenerIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

const irARuta = (ruta) => {
  router.push(`/${ruta}`)
}
const fullName = ref(null)
const mostrarModal = ref(false)
const router = useRouter()

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    fullName.value = profile?.full_name || user.email
  }
})

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px;
  flex-wrap: wrap;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 100; 
  width: 98%;
  justify-content: space-between;
}

.app-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
  color: #4caf50;
}



button {
  border: none;
  margin-left: 10px;
  border-radius: 8px;
  cursor: pointer;
  background-color: white;
  color: #4caf50;
  font-size:  14px;
}

.user-info {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  gap: 0.6rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  transition: background 0.2s ease-in-out;
  margin-right: 5px;
}
.user-info:hover {
  background-color: #f0fdf4;
}

.icono {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color:  #4caf50;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  line-height: 34px;
  font-size: 16px;
  
}

.user-name {
  font-size: .8rem;
  font-weight: 800;
  color: #4caf50;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 300px;
  text-align: center;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 1rem;
}

.modal button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.confirm {
  background-color: red;
  color: white;
}

.cancel {
  background-color: #e5e7eb;
  color: #333;
}
</style>
