<template>
 

  <nav class="navigation-bar">

   

    <div class="nav-links">

      <RouterLink
        to="/dashboard"
        class="nav-item"
      >
        <Icon
          icon="mdi:view-dashboard"
          class="nav-icon"
        />

        <span class="label">
          Dashboard
        </span>
      </RouterLink>

      <RouterLink
        to="/agricultura"
        class="nav-item"
      >
        <Icon
          icon="mdi:clipboard-text-outline"
          class="nav-icon"
        />

        <span class="label">
          Datos
        </span>
      </RouterLink>

      <RouterLink
        to="/cultivos"
        class="nav-item"
      >
        <Icon
          icon="mdi:sprout"
          class="nav-icon"
        />

        <span class="label">
          Cultivos
        </span>
      </RouterLink>

      <RouterLink
        to="/chats"
        class="nav-item"
      >
        <Icon
          icon="mdi:chat-outline"
          class="nav-icon"
        />

        <span class="label">
          Chats
        </span>
      </RouterLink>

      <!-- MÁS -->
      <div
        class="nav-item more-button"
        @click.stop="mostrarMenuMas = !mostrarMenuMas"
      >

        <Icon
          icon="mdi:dots-horizontal"
          class="nav-icon"
        />

        <span class="label">
          Más
        </span>

        <transition name="pop">

          <div
            v-if="mostrarMenuMas"
            class="more-popover"
            @click.stop
          >

            <div class="popover-title">
              Más opciones
            </div>

            <div class="popover-list">

              <RouterLink
                to="/usuarios"
                class="pop-item"
                @click="cerrarMenu"
              >
                <Icon
                  icon="mdi:account-group"
                  class="pop-icon"
                />

                <span>Usuarios</span>
              </RouterLink>

              <RouterLink
                to="/inducciones"
                class="pop-item"
                @click="cerrarMenu"
              >
                <Icon
                  icon="mdi:file-document-edit-outline"
                  class="pop-icon"
                />

                <span>Inducciones</span>
              </RouterLink>

              <RouterLink
                to="/facturas"
                class="pop-item"
                @click="cerrarMenu"
              >
                <Icon
                  icon="mdi:receipt-text-outline"
                  class="pop-icon"
                />

                <span>Facturas</span>
              </RouterLink>
              <RouterLink
                to="/inventario"
                class="pop-item"
                @click="cerrarMenu"
              >
                <Icon
                  icon="mdi:warehouse"
                  class="pop-icon"
                />

                <span>Inventario</span>
              </RouterLink>
              <RouterLink
                to="/fertilizaciones"
                class="pop-item"
                @click="cerrarMenu"
              >
                <Icon
                  icon="mdi:leaf"
                  class="pop-icon"
                />

                <span>Fertilizaciones</span>
              </RouterLink>

            </div>

          </div>

        </transition>

      </div>

    </div>

  </nav>

  <div
    v-if="mostrarMenuMas"
    class="overlay"
    @click="mostrarMenuMas = false"
  />
</template>

<script setup>
import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import { RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'

const isHidden = ref(false)
const mostrarMenuMas = ref(false)

let lastScrollPosition = 0

const cerrarMenu = () => {
  mostrarMenuMas.value = false
}

const handleScroll = () => {

  const currentScrollPosition =
    window.pageYOffset ||
    document.documentElement.scrollTop

  if (
    Math.abs(
      currentScrollPosition -
      lastScrollPosition
    ) < 10
  ) return

  if (
    currentScrollPosition >
    lastScrollPosition &&
    currentScrollPosition > 60
  ) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }

  lastScrollPosition =
    currentScrollPosition
}

onMounted(() => {
  window.addEventListener(
    'scroll',
    handleScroll
  )
})

onUnmounted(() => {
  window.removeEventListener(
    'scroll',
    handleScroll
  )
})
</script>

<style scoped>


/* NAVIGATION */

.navigation-bar{
  --nav-width:72px;
  --primary:#22c55e;
  --bg:#ffffff;

  position:fixed;
  top:0;
  left:0;

  width:var(--nav-width);
  height:55px !important;
  

  background:var(--bg);

  display:flex;
  flex-direction:column;

  padding:1.2rem 0;

  box-shadow:
    2px 0 16px rgba(0,0,0,.06);

  z-index:1000;
}

/* LOGO */

.logo-container{
  display:flex;
  justify-content:center;
  margin-bottom:2rem;
}

.logo-desktop{
  width:48px;
}

/* LINKS */

.nav-links{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:1rem;
}

/* ITEMS */

.nav-item{
  width:52px;
  height:52px;

  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;

  border-radius:16px;

  color:#94a3b8;
  text-decoration:none;

  cursor:pointer;

  position:relative;

  transition:.25s ease;
}

.nav-item:hover{
  background:rgba(34,197,94,.08);
  color:var(--primary);
}

.router-link-active{
  background:rgba(34,197,94,.14);
  color:#16a34a;
}

/* ICON */

.nav-icon{
  font-size:26px;
}

/* LABEL */

.label{
  position:absolute;
  left:72px;

  background:#1e293b;
  color:white;

  font-size:12px;
  font-weight:700;

  padding:6px 12px;

  border-radius:8px;

  opacity:0;
  pointer-events:none;

  white-space:nowrap;

  transform:translateX(-10px);

  transition:.2s ease;
}

.nav-item:hover .label{
  opacity:1;
  transform:translateX(0);
}

/* MOBILE HEADER */

.mobile-header{
  display:none;
  transition:
    transform .3s ease,
    opacity .3s ease;
}

.header-hidden{
  transform:translateY(-100%);
  opacity:0;
}

.logo-mobile{
  width:52px;
}

/* MORE */

.more-button{
  position:relative;
}

/* POPOVER */

.more-popover{
  position:absolute;
  left:75px;
  bottom:0;

  width:220px;

  background:white;

  border-radius:18px;

  padding:.7rem;

  border:1px solid #f1f5f9;

  box-shadow:
    0 12px 30px rgba(0,0,0,.12);

  z-index:2000;
}

.popover-title{
  padding:0 10px 10px;

  font-size:13px;
  font-weight:700;

  color:#374151;

  border-bottom:1px solid #f1f5f9;

  margin-bottom:.5rem;
}

.popover-list{
  display:flex;
  flex-direction:column;
  gap:.3rem;
}

.pop-item{
  display:flex;
  align-items:center;
  gap:12px;

  text-decoration:none;

  padding:.9rem;

  border-radius:14px;

  color:#475569;

  transition:.2s ease;

  font-size:14px;
  font-weight:600;
}

.pop-item:hover{
  background:#f0fdf4;
  color:#16a34a;
}

.pop-icon{
  font-size:22px;
}

/* OVERLAY */

.overlay{
  position:fixed;
  inset:0;

  background:rgba(0,0,0,.05);

  z-index:900;
}

/* ANIMATION */

.pop-enter-active,
.pop-leave-active{
  transition:.2s ease;
}

.pop-enter-from,
.pop-leave-to{
  opacity:0;
  transform:
    translateY(10px)
    scale(.95);
}

/* MOBILE */

@media (max-width:640px){

  .navigation-bar{
    width:100%;
    height:72px;

    top:auto;
    bottom:0;

    flex-direction:row;
    justify-content:center;

    padding:0;

    border-top:1px solid #f1f5f9;

    box-shadow:
      0 -4px 20px rgba(0,0,0,.08);
  }

  .mobile-header{
    display:flex;

    align-items:center;

    position:fixed;
    top:0;
    left:0;

    width:100%;
    height:60px;

    padding:0 1rem;

    z-index:1100;

    background:transparent;
  }

  .logo-container{
    display:none;
  }

  .nav-links{
    width:100%;

    flex-direction:row;
    justify-content:space-around;

    gap:0;
  }

  .nav-item{
    width:20%;
    height:100%;

    border-radius:0;
  }

  .nav-icon{
    font-size:24px;
  }

  .label{
    position:static;

    opacity:1;

    transform:none;

    background:none;

    color:inherit;

    padding:0;

    font-size:10px;

    margin-top:2px;
  }

  .more-popover{
    left:auto;
    right:10px;
    bottom:78px;
  }

}
</style>