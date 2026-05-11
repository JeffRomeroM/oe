<template>
  <div class="opciones-container">

    <!-- HEADER -->
    <div class="top-banner">

      <div class="banner-info">

        <div class="banner-icon">
          <Icon icon="mdi:finance" />
        </div>

        <div>
          <h2>Finanzas agrícolas</h2>
          <p>Gestiona ingresos y egresos</p>
        </div>

      </div>

    </div>

    <!-- SUBMENU -->
    <div class="submenu-card">

      <button
        :class="{ activo: vista === 'egresos' }"
        @click="vista = 'egresos'"
      >
        <Icon icon="mdi:cash-remove" />
        Egresos
      </button>

      <button
        :class="{ activo: vista === 'ingresos' }"
        @click="vista = 'ingresos'"
      >
        <Icon icon="mdi:cash-plus" />
        Ingresos
      </button>

    </div>

    <!-- CONTENIDO -->
    <div class="contenido">

      <transition
        name="fade"
        mode="out-in"
      >

        <Egresos
          v-if="vista === 'egresos'"
          key="egresos"
        />

        <Ingresos
          v-else
          key="ingresos"
        />

      </transition>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

import Ingresos from '../components/Ingresos.vue'
import Egresos from '../components/Egresos.vue'

const vista = ref('egresos')
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.opciones-container{
  min-height:100vh;
  background:#f5f7fb;
  padding:1rem;
  padding-bottom:90px;
}

/* TOP */

.top-banner{
  background:linear-gradient(135deg,#16a34a,#15803d);
  border-radius:24px;
  padding:1.1rem;
  margin-bottom:1rem;
  color:white;
  box-shadow:0 8px 20px rgba(22,163,74,.15);
}

.banner-info{
  display:flex;
  align-items:center;
  gap:14px;
}

.banner-icon{
  width:60px;
  height:60px;
  border-radius:18px;
  background:rgba(255,255,255,.14);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}

.banner-icon svg{
  font-size:2rem;
}

.top-banner h2{
  margin:0;
  font-size:1.4rem;
  font-weight:700;
}

.top-banner p{
  margin-top:4px;
  font-size:13px;
  opacity:.9;
}

/* SUBMENU */

.submenu-card{
  background:white;
  border-radius:22px;
  padding:.5rem;
  display:flex;
  gap:.7rem;
  margin-bottom:1rem;
  box-shadow:0 4px 18px rgba(0,0,0,.04);
}

.submenu-card button{
  flex:1;
  border:none;
  background:transparent;
  padding:.95rem 1rem;
  border-radius:18px;
  font-size:14px;
  font-weight:600;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  color:#6b7280;
  transition:.25s;
}

.submenu-card button svg{
  font-size:1.2rem;
}

.submenu-card button:hover{
  background:#f3f4f6;
}

.submenu-card button.activo{
  background:linear-gradient(135deg,#22c55e,#15803d);
  color:white;
  box-shadow:0 6px 14px rgba(34,197,94,.25);
}

/* CONTENIDO */

.contenido{
  width:100%;
}

/* ANIMACION */

.fade-enter-active,
.fade-leave-active{
  transition:all .25s ease;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
  transform:translateY(10px);
}

/* RESPONSIVE */

@media(max-width:768px){

  .opciones-container{
    padding:.7rem;
    padding-bottom:90px;
  }

  .top-banner{
    border-radius:20px;
  }

  .submenu-card{
    border-radius:18px;
  }

}

@media(max-width:480px){

  .banner-icon{
    width:52px;
    height:52px;
  }

  .banner-icon svg{
    font-size:1.7rem;
  }

  .top-banner h2{
    font-size:1.2rem;
  }

  .submenu-card{
    gap:.5rem;
  }

  .submenu-card button{
    font-size:13px;
    padding:.85rem .7rem;
  }

}
</style>