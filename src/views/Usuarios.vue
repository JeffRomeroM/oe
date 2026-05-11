<template>
  <div class="vista-usuarios">


    <!-- HERO -->
    <div class="hero">

      <div class="hero-info">

        <div class="icono">
          <Icon icon="mdi:account-group-outline" />
        </div>

        <div>
          <h2>Comunidad agrícola</h2>
          <p>{{ usuarios.length }} productores usando la app</p>
        </div>

      </div>

    </div>

    <!-- BUSCADOR -->
    <div class="buscador-box">

      <Icon
        icon="mdi:magnify"
        class="icon-search"
      />

      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar usuario..."
      />

    </div>

    <!-- LISTA -->
    <div class="lista-usuarios">

      <div
        v-for="usuario in usuariosFiltrados"
        :key="usuario.full_name"
        class="usuario-card"
      >

        <!-- AVATAR -->
        <div class="avatar">
          {{ obtenerIniciales(usuario.full_name) }}
        </div>

        <!-- INFO -->
        <div class="usuario-info">

          <h3>
            {{ usuario.full_name }}
          </h3>

          <small>
            Productor agrícola
          </small>

        </div>

        <!-- ICON -->
        <div class="icon-right">
          <Icon icon="mdi:chevron-right" />
        </div>

      </div>

    </div>

    <!-- VACÍO -->
    <div
      v-if="usuariosFiltrados.length === 0"
      class="sin-resultados"
    >
      <Icon icon="mdi:account-search-outline" />

      <p>No se encontraron usuarios</p>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { supabase } from '../supabase'

import Header from '../components/Header.vue'
import MenuAbajo from '../components/MenuAbajo.vue'

const usuarios = ref([])
const busqueda = ref('')

const cargarUsuarios = async () => {

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name')
    .order('full_name')

  if (!error) {
    usuarios.value = data || []
  }

}

const obtenerIniciales = (nombre) => {

  return nombre
    ?.split(' ')
    ?.map(p => p[0])
    ?.join('')
    ?.substring(0, 2)
    ?.toUpperCase()

}

const usuariosFiltrados = computed(() => {

  return usuarios.value.filter(usuario =>
    usuario.full_name
      ?.toLowerCase()
      ?.includes(busqueda.value.toLowerCase())
  )

})

onMounted(cargarUsuarios)
</script>

<style scoped>


.vista-usuarios {
  min-height: 100vh;
  background:
    linear-gradient(to bottom, #f5fff7, #f4f7fb);
  padding: 1rem;
  padding-bottom: 100px;
}

/* HERO */

.hero {
  background:
    linear-gradient(135deg, #22c55e, #15803d);
  border-radius: 28px;
  padding: 1.2rem;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 10px 25px rgba(34,197,94,0.2);
}

.hero-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.icono {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icono svg {
  font-size: 2rem;
}

.hero h2 {
  margin: 0;
  font-size: 1.3rem;
}

.hero p {
  margin: 5px 0 0;
  opacity: 0.9;
  font-size: 14px;
}

/* BUSCADOR */

.buscador-box {
  background: white;
  border-radius: 18px;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.icon-search {
  font-size: 1.3rem;
  color: #6b7280;
}

.buscador-box input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
}

/* LISTA */

.lista-usuarios {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 4rem;
}

/* CARD */

.usuario-card {
  background: white;
  border-radius: 22px;
  padding: 0.9rem;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: 0.2s;
  box-shadow: 0 4px 14px rgba(0,0,0,0.04);
}

.usuario-card:hover {
  transform: translateY(-2px);
}

/* AVATAR */

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

/* INFO */

.usuario-info {
  flex: 1;
}

.usuario-info h3 {
  margin: 0;
  font-size: 15px;
  color: #111827;
}

.usuario-info small {
  color: #6b7280;
  font-size: 13px;
}

/* ICON RIGHT */

.icon-right {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.icon-right svg {
  font-size: 1.2rem;
}

/* VACÍO */

.sin-resultados {
  margin-top: 2rem;
  text-align: center;
  color: #6b7280;
}

.sin-resultados svg {
  font-size: 3rem;
  margin-bottom: 10px;
}

/* RESPONSIVE */

@media (max-width: 768px) {

  .vista-usuarios {
    padding: 0.8rem;
    padding-bottom: 90px;
  }

  .hero {
    border-radius: 24px;
  }

  .icono {
    width: 52px;
    height: 52px;
  }

  .icono svg {
    font-size: 1.6rem;
  }

  .usuario-card {
    border-radius: 18px;
  }

}

@media (max-width: 480px) {

  .hero {
    padding: 1rem;
  }

  .hero h2 {
    font-size: 1.1rem;
  }

  .hero p {
    font-size: 13px;
  }

  .avatar {
    width: 46px;
    height: 46px;
    border-radius: 15px;
  }

}
</style>