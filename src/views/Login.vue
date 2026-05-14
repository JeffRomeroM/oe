<template>
  <div class="login-wrapper">

    <div class="login-container">

      <!-- LOGO TEXTO -->

      <div class="brand">
        agro
      </div>

      <h2>
        Iniciar Sesión
      </h2>

      <p class="subtitle">
        Accede a tu panel agrícola
      </p>

      <form
        @submit.prevent="login"
        class="form"
      >

        <!-- EMAIL -->

        <label>
          Correo electrónico

          <input
            v-model="email"
            type="email"
            placeholder="correo@ejemplo.com"
            required
          >
        </label>

        <!-- PASSWORD -->

        <label>
          Contraseña

          <div class="password-box">

            <input
              v-model="password"
              :type="
                mostrarPassword
                ? 'text'
                : 'password'
              "
              placeholder="********"
              required
            >

            <button
              type="button"
              class="toggle-password"
              @click="togglePassword"
            >

              <Icon
                :icon="
                  mostrarPassword
                  ? 'mdi:eye-off-outline'
                  : 'mdi:eye-outline'
                "
              />

            </button>

          </div>

        </label>

        <!-- BOTON -->

        <button
          type="submit"
          class="login-btn"
          :disabled="loading"
        >
          {{
            loading
            ? 'Ingresando...'
            : 'Iniciar Sesión'
          }}
        </button>

      </form>

      <!-- ERROR -->

      <p
        v-if="errorMessage"
        class="error"
      >
        {{ errorMessage }}
      </p>

      <!-- REGISTER -->

      <div class="register-redirect">

        <span>
          ¿No tienes cuenta?
        </span>

        <button
          @click="goToRegister"
          class="register-button"
        >
          Regístrate aquí
        </button>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { Icon } from '@iconify/vue'

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const mostrarPassword = ref(false)

const router = useRouter()

const togglePassword = () => {

  mostrarPassword.value =
    !mostrarPassword.value
}

const login = async () => {

  errorMessage.value = ''

  loading.value = true

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

  if (error) {

    errorMessage.value =
      error.message

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

<style scoped>

.login-wrapper{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:1rem;
  background:
  linear-gradient(
    135deg,
    #f0fdf4,
    #ecfeff
  );
}

.login-container{
  width:100%;
  max-width:430px;
  background:white;
  padding:2.2rem;
  border-radius:30px;
  box-shadow:
  0 10px 35px rgba(0,0,0,.08);
  border:1px solid #e5e7eb;
}

.brand{
  text-align:center;
  font-size:3rem;
  font-weight:900;
  letter-spacing:1px;
  color:#16a34a;
  margin-bottom:.4rem;
  font-family:
  'Trebuchet MS',
  sans-serif;
}

h2{
  text-align:center;
  color:#111827;
  font-size:1.8rem;
  margin-bottom:.3rem;
}

.subtitle{
  text-align:center;
  color:#6b7280;
  margin-bottom:2rem;
}

.form{
  display:flex;
  flex-direction:column;
  gap:1rem;
}

.form label{
  display:flex;
  flex-direction:column;
  gap:.5rem;
  font-weight:600;
  color:#374151;
  font-size:.95rem;
}

.form input{
  width:100%;
  padding:1rem;
  border-radius:16px;
  border:1px solid #d1d5db;
  outline:none;
  transition:.2s;
  font-size:1rem;
  background:white;
}

.form input:focus{
  border-color:#22c55e;
  box-shadow:
  0 0 0 4px rgba(34,197,94,.12);
}

.password-box{
  position:relative;
}

.password-box input{
  padding-right:55px;
}

.toggle-password{
  position:absolute;
  top:50%;
  right:14px;
  transform:translateY(-50%);
  border:none;
  background:none;
  cursor:pointer;
  color:#6b7280;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:1.35rem;
}

.login-btn{
  width:100%;
  border:none;
  background:#22c55e;
  color:white;
  padding:1rem;
  border-radius:16px;
  font-size:1rem;
  font-weight:700;
  cursor:pointer;
  transition:.2s;
  margin-top:.5rem;
}

.login-btn:hover{
  background:#16a34a;
}

.login-btn:disabled{
  opacity:.7;
  cursor:not-allowed;
}

.error{
  margin-top:1rem;
  text-align:center;
  color:#dc2626;
  font-weight:600;
}

.register-redirect{
  margin-top:1.5rem;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:.4rem;
  flex-wrap:wrap;
  text-align:center;
  color:#4b5563;
  font-size:.95rem;
}

.register-button{
  border:none;
  background:none;
  color:#2563eb;
  cursor:pointer;
  font-weight:700;
  text-decoration:underline;
}

@media(max-width:768px){

  .login-wrapper{
    padding:1rem;
    align-items:flex-start;
    padding-top:3rem;
  }

  .login-container{
    padding:1.5rem;
    border-radius:24px;
  }

  .brand{
    font-size:2.5rem;
  }

  h2{
    font-size:1.5rem;
  }

  .subtitle{
    font-size:.92rem;
  }

  .form input{
    padding:.95rem;
    font-size:.95rem;
  }

  .login-btn{
    padding:.95rem;
  }

}

@media(max-width:480px){

  .login-container{
    padding:1.2rem;
    margin-top:5rem;
  }

  .brand{
    font-size:2.2rem;
  }

  h2{
    font-size:1.35rem;
  }

  .form label{
    font-size:.9rem;
  }

  .form input{
    font-size:.92rem;
    width: 90%;
  }

}

</style>