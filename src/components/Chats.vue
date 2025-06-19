<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Mensajes</h2>
    </div>

    <div class="chat-mensajes" ref="chatScroll">
      <div
        v-for="msg in mensajes"
        :key="msg.id"
        :class="['mensaje', msg.user_id === userId ? 'mio' : 'otro']"
      >
        <div class="mensaje-info">
          <small>{{ msg.user_id === userId ? 'Tú' : msg.full_name }}</small>

        </div>

        <div v-if="editandoId === msg.id">
          <input v-model="mensajeEditado" class="input-editar" />
          <div class="acciones">
            <button @click="guardarEdicion(msg.id)">Guardar</button>
            <button @click="cancelarEdicion">Cancelar</button>
          </div>
        </div>
        <div v-else>
          <div class="contenido">{{ msg.contenido }}</div>
          <div v-if="msg.user_id === userId" class="acciones">
            <button @click="editar(msg)">✏️</button>
            <button @click="eliminar(msg.id)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="guardar" class="chat-input">
      <input v-model="mensaje" placeholder="Escribe un mensaje..." required />
      <button type="submit">Enviar</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'

const mensajes = ref([])
const mensaje = ref('')
const userId = ref(null)
const mensajeEditado = ref('')
const editandoId = ref(null)
const chatScroll = ref(null)

const obtenerUsuario = async () => {
  const { data } = await supabase.auth.getUser()
  userId.value = data?.user?.id
}

const cargarMensajes = async () => {
  const { data } = await supabase
    .from('mensajes')
    .select('*')
    .order('created_at', { ascending: true })
  mensajes.value = data || []
  scrollAlFinal()
}

const scrollAlFinal = () => {
  nextTick(() => {
    chatScroll.value.scrollTop = chatScroll.value.scrollHeight
  })
}

const guardar = async () => {
  if (!mensaje.value.trim()) return

  const { data: perfil } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId.value)
    .single()

  
  await supabase.from('mensajes').insert([
  {
    contenido: mensaje.value,
    user_id: userId.value,
    full_name: perfil.full_name
  }
])


  mensaje.value = ''
  await cargarMensajes()
}

const editar = (msg) => {
  editandoId.value = msg.id
  mensajeEditado.value = msg.contenido
}

const guardarEdicion = async (id) => {
  await supabase.from('mensajes').update({
    contenido: mensajeEditado.value
  }).eq('id', id).eq('user_id', userId.value)

  editandoId.value = null
  mensajeEditado.value = ''
  await cargarMensajes()
}

const cancelarEdicion = () => {
  editandoId.value = null
  mensajeEditado.value = ''
}

const eliminar = async (id) => {
  await supabase.from('mensajes').delete().eq('id', id).eq('user_id', userId.value)
  await cargarMensajes()
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarMensajes()

  supabase
    .channel('chat')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mensajes' }, cargarMensajes)
    .subscribe()
})
</script>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: auto;
  display: flex;
  flex-direction: column;
  height: 90vh;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  background: #fefefe;
}

.chat-header {
  background: #4caf50;
  color: white;
  text-align: center;
  padding: 1rem;
}

.chat-mensajes {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f6f6f6;
}

.mensaje {
  margin-bottom: 1rem;
  max-width: 90%;
  word-wrap: break-word;
  padding: 0.5rem;
  border-radius: 8px;
  position: relative;
}

.mensaje.mio {
  background: #d0f0c0;
  align-self: flex-end;
  text-align: right;
}

.mensaje.otro {
  background: #ffffff;
  align-self: flex-start;
}

.mensaje-info {
  font-size: 12px;
  color: #555;
  margin-bottom: 2px;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 4px;
}

.acciones button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
}

.contenido {
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  background: #fff;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
}

.chat-input button {
  padding: 0 16px;
  margin-left: 8px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.input-editar {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #aaa;
}

@media (max-width: 600px) {
  .chat-container {
    height: 100vh;
    border: none;
    border-radius: 0;
  }
  .chat-header{
    width: 90%;
    margin: auto;
  }

  .chat-mensajes {
    padding: 0.8rem;
  }

  .chat-input input {
    padding: 8px;
  }
}
</style>
