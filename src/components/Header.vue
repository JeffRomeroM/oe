<template>
  <header class="header">
    <h1 class="app-name" @click="irARuta('dashboard')">Agro</h1>
    
    <div class="user-info" v-if="fullName" @click="mostrarModal = true">
      <div class="icono">
        {{ obtenerIniciales(fullName) }}
      </div>
      <span class="user-name">{{ fullName }}</span>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" v-if="mostrarModal">
      <div class="modal">
        <h3 class="modal-title">¿Deseas cerrar sesión?</h3>
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
/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 1rem;
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
}

.app-name {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  color: #4caf50;
  cursor: pointer;
  user-select: none;
}

/* User info */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  transition: background 0.2s ease-in-out;
}
.user-info:hover {
  background-color: #f0fdf4;
}

.icono {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4caf50;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4caf50;
  white-space: nowrap;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 340px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  gap: 1rem;
  padding: 0 1rem 1rem 1rem;
}

.modal button {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
  padding: 20px;
}

.confirm {
  background-color: #e53935;
  color: white;
}

.cancel {
  background-color: #e5e7eb;
  color: #333;
}

/* Responsive */
@media (max-width: 640px) {
 
  .icono {
    width: 30px;
    height: 30px;
    font-size: 0.85rem;
  }
  .user-info {
    flex-direction: column;
    padding: 0.3rem 0.6rem;
    gap: 0.4rem;
    margin-right: 5px !important;
    margin-top: 5px !important;
  }
  .user-name {
    font-size: 0.75rem;
  }
  
  .app-name {
    font-size: 1.3rem;
    margin-left: 5px !important;
  }
}
</style>
