<template>
  <div class="register-container">
    <img src="/public/agro.png" alt="">
    <h2>Registrarse</h2>
    <form @submit.prevent="registrar" class="form">
      <label>
        Nombre completo:
        <input v-model="nombre" type="text" placeholder="Tu nombre completo" required />
      </label>

      <label>
        Correo electrónico:
        <input v-model="email" type="email" placeholder="correo@ejemplo.com" required />
      </label>

      <label>
        Contraseña:
        <input v-model="password" type="password" placeholder="********" required />
      </label>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>

      <div class="register-redirect">
        <span>¿Ya tienes una cuenta?</span>
        <button @click="goToLogin" class="login-button">Login</button>
      </div>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Modal de confirmación de correo -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>Revisa tu correo</h3>
        <p>Hemos enviado un enlace de confirmación a <strong>{{ email }}</strong>.</p>
        <p>Por favor, confirma tu correo antes de iniciar sesión.</p>
        <button @click="goToLogin">Ir al Login</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const nombre = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showModal = ref(false)
const router = useRouter()

const goToLogin = () => {
  router.push('/')
}

const registrar = async () => {
  errorMessage.value = ''
  loading.value = true

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (error) {
    errorMessage.value = error.message
    loading.value = false
    return
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: nombre.value,
    })

    if (profileError) {
      errorMessage.value = profileError.message
      loading.value = false
      return
    }

    showModal.value = true // Mostrar modal de confirmación
  }

  loading.value = false
}
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.register-container img {
  width: 100px;
  display: block;
  margin: 0 auto 1rem;
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
  width: 100%;
  padding: 0.5rem 0.7rem;
  margin-top: 0.3rem;
  margin-bottom: 1rem;
  border: 1px solid #aaa;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 0.6rem 0;
  font-size: 1.1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.2s ease;
}

button:disabled {
  background-color: #4caf50;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #4caf50;
}

.error {
  margin-top: 1rem;
  color: #b91c1c;
  font-weight: 700;
  text-align: center;
}

.register-redirect {
  margin-top: 1rem;
  text-align: center;
}

.login-button {
  background-color: white;
  color: #1e40af;
  text-decoration: underline;
}

.login-button:hover {
  background-color: white !important;
  color: #1e40af !important;
  text-decoration: underline !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  text-align: center;
}

.modal h3 {
  margin-bottom: 1rem;
}

.modal button {
  margin-top: 1rem;
}
</style>
