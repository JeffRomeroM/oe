<script setup>
import Header from './components/Header.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MenuAbajo from './components/MenuAbajo.vue'

const route = useRoute()

const mostrarHeader = computed(() => {
  const rutasOcultas = ['/', '/login', '/register', '/*'] // Rutas donde no se muestra el header
  // Si la ruta actual está en la lista, devolvemos false (no mostrar)
  return !rutasOcultas.includes(route.path)
})

</script>

<template>
  <Header v-if="mostrarHeader" />
  <router-view />
  <MenuAbajo v-if="mostrarHeader" />
  
</template>

<style>

*{
  margin: 0;
  padding: 0;
}
html, body {
  height: 100%;
  margin: 0;
}

</style>
