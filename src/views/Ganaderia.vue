<template>
  <RouterLink class="regresar" to="dashboard">Regresar</RouterLink>
  <h1>Ganadería</h1>
  <div class="ganaderia-form">
    <form @submit.prevent="guardarGanaderia">
      <div>
        <label for="tipo">Tipo de ganado:</label>
        <input id="tipo" v-model="ganaderia.tipo" required />
      </div>
      <div>
        <label for="cantidad">Cantidad:</label>
        <input id="cantidad" type="number" v-model="ganaderia.cantidad" required />
      </div>
      <div>
        <label for="ubicacion">Ubicación:</label>
        <input id="ubicacion" v-model="ganaderia.ubicacion" required />
      </div>
      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const ganaderia = ref({
  tipo: '',
  cantidad: 0,
  ubicacion: ''
})

function guardarGanaderia() {
  // Aquí puedes agregar la lógica para guardar los datos
  alert('Datos de ganadería guardados:\n' + JSON.stringify(ganaderia.value, null, 2))
}
</script>

<style scoped>
.ganaderia-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.ganaderia-form div {
  margin-bottom: 1rem;
}
.ganaderia-form label {
  display: block;
  margin-bottom: 0.5rem;
}
.ganaderia-form input {
  width: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}
.ganaderia-form button {
  padding: 0.5rem 1rem;
}
</style>