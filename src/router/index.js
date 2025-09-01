import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import { supabase } from '../supabase'
import Agricultura from '../views/Agricultura.vue'
import Ganaderia from '../views/Ganaderia.vue'
import Chats from '../views/Chats.vue'
import Usuarios from '../views/Usuarios.vue'
import Cultivos from '../views/Cultivos.vue'

const routes = [
  { path: '/', component: Login },
  { path: '/register', component: Register },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/agricultura',
    component: Agricultura,
    meta: { requiresAuth: true }
  },
  {
    path: '/ganaderia',
    component: Ganaderia,
    meta: { requiresAuth: true }
  },
  {
    path: '/chats',
    component: Chats,
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    component: Usuarios,
    meta: { requiresAuth: true }
  },
  {
    path: '/cultivos',
    component: Cultivos,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { data } = await supabase.auth.getSession()
  const isAuthenticated = !!data.session

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
