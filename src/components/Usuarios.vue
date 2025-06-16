<template>
  <div class="usuarios-container">
    <h2 class="titulo">👥 Compañeros que ya usan la app</h2>
    <div class="lista-usuarios">
      <div v-for="usuario in usuarios" :key="usuario.full_name" class="usuario-card">
        <div class="avatar">
          {{ obtenerIniciales(usuario.full_name) }}
        </div>
        <div class="nombre">{{ usuario.full_name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const usuarios = ref([])

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
.usuarios-container {
  padding: 2rem;
  max-width: 600px;
  margin: auto;
  background: #f9f9f9;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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
  background: white;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
</style>
