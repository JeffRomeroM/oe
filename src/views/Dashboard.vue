<template>
  <Header />
  <div class="container">
    
    <h2>Subir Foto</h2>

    <input type="file" accept="image/*" @change="handleFile" />

    <button @click="uploadImage" :disabled="!file || loading">
      {{ loading ? 'Subiendo...' : 'Subir Foto' }}
    </button>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="gallery" v-if="fotos.length">
      <div v-for="foto in fotos" :key="foto.id" class="card">
        <img :src="foto.url" alt="foto subida" />
        <p class="email">Subido por: {{ foto.email }}</p>
        <button
          v-if="foto.user_id === currentUserId"
          @click="eliminarFoto(foto)"
          class="delete-btn"
        >
          Eliminar
        </button>
      </div>
    </div>
    <div v-else class="empty">No hay fotos aún.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import Header from '../components/Header.vue'

const file = ref(null)
const fotos = ref([])
const errorMessage = ref('')
const loading = ref(false)
const currentUserId = ref(null)

const handleFile = (e) => {
  file.value = e.target.files[0]
}

const uploadImage = async () => {
  errorMessage.value = ''
  loading.value = true

  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user || userError) {
    errorMessage.value = 'Usuario no autenticado'
    loading.value = false
    return
  }
  currentUserId.value = user.id

  const fileName = `${user.id}/${Date.now()}_${file.value.name}`

  const { error: uploadError } = await supabase.storage
    .from('fotos')
    .upload(fileName, file.value)

  if (uploadError) {
    errorMessage.value = uploadError.message
    loading.value = false
    return
  }

  const { data: publicUrlData } = supabase.storage
    .from('fotos')
    .getPublicUrl(fileName)

  const { error: dbError } = await supabase.from('fotos').insert({
    user_id: user.id,
    url: publicUrlData.publicUrl,
    path: fileName,
  })

  if (dbError) {
    errorMessage.value = dbError.message
  } else {
    await fetchFotos()
    file.value = null
  }

  loading.value = false
}

const fetchFotos = async () => {
  const { data: userData } = await supabase.auth.getUser()
  currentUserId.value = userData.user?.id || null

  const { data, error } = await supabase
    .from('fotos')
    .select('id, url, path, user_id, created_at, profiles: user_id (email)')
    .order('created_at', { ascending: false })

  if (!error) {
    fotos.value = data.map(f => ({
      ...f,
      email: f.profiles?.email || 'Anónimo'
    }))
  }
}

const eliminarFoto = async (foto) => {
  const { error: storageError } = await supabase.storage
    .from('fotos')
    .remove([foto.path])

  const { error: dbError } = await supabase
    .from('fotos')
    .delete()
    .eq('id', foto.id)

  if (storageError || dbError) {
    errorMessage.value = storageError?.message || dbError?.message
  } else {
    await fetchFotos()
  }
}

onMounted(fetchFotos)
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

input[type="file"] {
  margin: 1rem 0;
}

button {
  background-color: #2563eb;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  font-weight: 600;
  margin-top: 1rem;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.card {
  background: white;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
}

.card img {
  width: 100%;
  border-radius: 4px;
}

.email {
  font-size: 0.85rem;
  color: #4b5563;
  margin-top: 0.3rem;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
  font-size: 0.85rem;
  border: none;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #b91c1c;
}

.empty {
  margin-top: 2rem;
  color: #6b7280;
}
</style>
