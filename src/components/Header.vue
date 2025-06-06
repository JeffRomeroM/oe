<template>
  <header class="header">
    <h1 class="app-name">Agro</h1>
    <div class="user-info" v-if="fullName">
      <span class="user-name">{{ fullName }}</span>
      <button @click="logout" class="logout-btn">Salir</button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const fullName = ref(null)
const router = useRouter()

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    fullName.value = profile?.full_name || user.email
  }
})

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.app-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.user-name {
  font-size: 0.9rem;
  word-break: break-word;
}

.logout-btn {
  background-color: #ef4444;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.logout-btn:hover {
  background-color: #dc2626;
}

@media (min-width: 640px) {
  .user-info {
    flex-direction: row;
    align-items: center;
  }

  .user-name {
    margin-right: 1rem;
  }
}
</style>
