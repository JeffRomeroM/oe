<template>
  <div class="login-container">
  <img src="/public/agro.png" alt="">
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="login" class="form">
      <label>
        Correo electrónico:
        <input v-model="email" type="email" placeholder="correo@ejemplo.com" required />
      </label>

      <label>
        Contraseña:
        <input v-model="password" type="password" placeholder="********" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
      </button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="register-redirect">
      <span>¿No tienes cuenta?</span>
      <button @click="goToRegister" class="register-button">Regístrate aquí</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

const login = async () => {
  errorMessage.value = ''
  loading.value = true

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  if (data.user) {
    router.push('/dashboard')
  }

  loading.value = false
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped >
.login-container {
  max-width: 400px !important;
  margin: 6rem 10px!important;
  padding: 1rem 1.5rem!important;
  border: 1px solid #ddd !important;
  border-radius: 8px!important;
  background: #fff!important;
}
.login-container img {
  display: block!important;
  margin: 0 auto 1rem!important;
  width: 100px!important; /* Ajusta el tamaño según sea necesario */
}
h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.form label {
  display: block;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.form input {
  width: 100%!important;
  padding: 0.5rem 0.7rem!important;
  margin-top: 0.3rem!important;
  margin-bottom: 1rem!important;
  border: 1px solid #aaa!important;
  border-radius: 4px!important;
  font-size: 1rem!important;
  box-sizing: border-box!important;
}

button {
  width: 100%!important;
  padding: 0.6rem 0!important;
  font-size: 1.1rem!important;
  background-color: #4caf50!important;
  color: white!important;
  border: none!important;
  border-radius: 6px!important;
  cursor: pointer!important;
  font-weight: 700!important;
  transition: background-color 0.2s ease!important;
}

button:disabled {
  background-color: #73e077!important;
  cursor: not-allowed!important;
}


.error {
  margin-top: 1rem;
  color: #b91c1c;
  font-weight: 700;
  text-align: center;
}

/* Nuevo estilo para el botón de registro */
.register-redirect {
  margin-top: 1.5rem!important;
  text-align: center;
  font-size: 0.9rem;
  color: #444!important;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.register-button {
  background: none!important;
  border: none;
  color: #2563eb!important;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  text-decoration: underline;
}


</style>
