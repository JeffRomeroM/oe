<template>
  <div>
    <button @click="modalAbierto = true" class="btn-abrir">Ver usuarios</button>

    <div v-if="modalAbierto" class="modal-overlay" @click.self="modalAbierto = false">
      <div class="modal-contenido">
        <h2 class="titulo">👥 Compañeros que ya usan la app</h2>
        <div class="lista-usuarios">
          <div v-for="usuario in usuarios" :key="usuario.full_name" class="usuario-card">
            <div class="avatar">
              {{ obtenerIniciales(usuario.full_name) }}
            </div>
            <div class="nombre">{{ usuario.full_name }}</div>
          </div>
        </div>
        <button @click="modalAbierto = false" class="btn-cerrar">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const usuarios = ref([])
const modalAbierto = ref(false)

const cargarUsuarios = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')

  if (!error) usuarios.value = data
}

const obtenerIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
}

onMounted(cargarUsuarios)
</script>

<style scoped>
.btn-abrir {
  background: #4caf50;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-left: 35%;
  font-size: 17px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20000;
  width: 100%;
  margin: auto;
}

.modal-contenido {
  background: white;
  border-radius: 16px;
  width: 80%;
  padding: 10px;
  margin: auto;
  margin-left: 1%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.titulo {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.lista-usuarios {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.usuario-card {
  display: flex;
  align-items: center;
  background: #f7f7f7;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}

.usuario-card:hover {
  transform: scale(1.03);
}

.avatar {
  width: 40px;
  height: 40px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1rem;
}

.nombre {
  font-size: 1rem;
  color: #333;
}

.btn-cerrar {
  margin-top: 1.5rem;
  background: #e53935;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: block;
  margin-left: auto;
}
</style>
