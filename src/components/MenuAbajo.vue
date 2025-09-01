<template>
  <header class="menu-container">
    <nav class="menu">

    <RouterLink to="/dashboard" class="nav-item">
      <span class="icon"><span class="material-icons">dashboard</span></span>
      <span class="label">Dashboard</span>
    </RouterLink>

    <RouterLink to="/agricultura" class="nav-item">
      <span class="icon"><span class="material-icons">notes</span></span>
      <span class="label">Datos</span>
    </RouterLink>

    <RouterLink to="/cultivos" class="nav-item">
      <span class="icon"><span class="material-icons">eco</span></span>
      <span class="label">Cultivos</span>
    </RouterLink>

    <RouterLink to="/chats" class="nav-item">
      <span class="icon"><span class="material-icons">chat</span></span>
      <span class="label">Mensajes</span>
    </RouterLink>

    <RouterLink to="/usuarios" class="nav-item">
      <span class="icon"><span class="material-icons">group</span></span>
      <span class="label">Usuarios</span>
    </RouterLink>
  </nav>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
// index.js
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
</script>

<style scoped>
.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 4%;
  height: 100vh;
  z-index: 1000;
  background: #ffffff;

}
.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 4%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  gap: 2rem;
  z-index: 1000;
  padding: 1rem 0;
}

.logo {
  width: 50px;
}
.logoMovil {
  display: none;
  width: 50px;
}

/* Ítems */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  font-size: 24px;
  transition: color 0.3s;
  position: relative;
  padding: 3px;
}

.nav-item:hover {
  color: #4caf50;
}

.label {
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  background: #374151;
  color: white;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
}

.nav-item:hover .label {
  opacity: 1;
}

.router-link-active {
  color: #4caf50;
  padding: 3px;
  border-radius: 4px;
}

/* Icono activo */
.router-link-active .icon span {
  color: #4caf50;
}

.icon span{
  width: 24px;
}

@media (max-width: 740px){
  .menu{
    width: 7%;
  }
}

/* Vista móvil estilo TikTok */
@media (max-width: 640px) {
  .menu-container {
    top: auto;
    bottom: 0;
    width: 100% !important;
    height: 60px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);

  }
  .menu {
    display: flex;
    justify-content: space-around; /* 🔹 reparte los 5 ítems de forma igual */
    align-items: center;
    height: 60px;
    width: 95%;
    margin: auto !important;
    flex-wrap: wrap;
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    padding: 0 1rem;
  
  }

  .nav-item {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: #555;
    width: 10% !important;
    margin: auto !important;
    background-color: #ffffff !important;
 
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 22px;
    margin-bottom: 2px;
  }

  .label {
    position: static;
    transform: none;
    background: none;
    color: #333;
    padding: 0;
    font-size: 12px;
    opacity: 1;
  }

  .router-link-active .label  {
    color: #4caf50;
    font-weight: bold;
    padding: 0px;
  }
}
</style>

