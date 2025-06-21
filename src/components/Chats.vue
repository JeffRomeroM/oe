<template>
  <div class="chat-container" :class="{ expandido }">
    <div class="chat-header">
      <h2>Mensajes</h2>
      <button class="btn-expandir" @click="expandido = !expandido">
        {{ expandido ? 'Minimizar' : 'Expandir' }}
      </button>
    </div>

    <div class="chat-mensajes" ref="chatScroll">
      <div
        v-for="msg in mensajes"
        :key="msg.id"
        :class="['mensaje', msg.user_id === userId ? 'mio' : 'otro']"
      >
        <div class="avatar">
          {{ msg.full_name?.charAt(0).toUpperCase() || '?' }}
        </div>
        <div class="mensaje-info">
          <small>
            {{ msg.user_id === userId ? 'Tú' : msg.full_name }}
            {{ new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) }}
          </small>
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
      <textarea
        v-model="mensaje"
        placeholder="Escribe un mensaje..."
        rows="1"
        @input="autoExpand"
        ref="textarea"
        required
      ></textarea>
      <button type="submit">Enviar</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'

const mensajes = ref([])
const mensaje = ref('')
const mensajeEditado = ref('')
const editandoId = ref(null)
const userId = ref(null)
const chatScroll = ref(null)
const expandido = ref(false)

const textarea = ref(null)

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

const autoExpand = () => {
  const el = textarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}

const guardar = async () => {
  if (!mensaje.value.trim()) return

  const { data: perfil } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId.value)
    .single()

  await supabase.from('mensajes').insert([{
    contenido: mensaje.value,
    user_id: userId.value,
    full_name: perfil.full_name
  }])

  mensaje.value = ''
  await cargarMensajes()
}

const editar = (msg) => {
  editandoId.value = msg.id
  mensajeEditado.value = msg.contenido
}

const guardarEdicion = async (id) => {
  await supabase.from('mensajes')
    .update({ contenido: mensajeEditado.value })
    .eq('id', id)
    .eq('user_id', userId.value)

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
  max-width: 75%;
  margin: auto;
  display: flex;
  flex-direction: column;
  height: 40vh;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  background: #fefefe;
  transition: height 0.3s ease;
  z-index: 100;
}

.chat-container.expandido {
  height: 90vh !important;
}

.chat-header {
  background: #4caf50;
  color: white;
  text-align: center;
  padding: 1rem;
  position: relative;
  border-radius: 10px 10px 0 0;
}

.btn-expandir {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgb(189, 252, 153);
  color: #4caf50;
  border: none;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
}

.chat-mensajes {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f6f6f6;
}

.mensaje {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
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
  flex-direction: row-reverse;
  margin-left: 30px;
}

.mensaje.otro {
  background: #ffffff;
  align-self: flex-start;
}

.avatar {
  background: #4caf50;
  color: white;
  font-weight: bold;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 4px;
}

.mensaje-info {
  font-size: 12px;
  color: #555;
  margin-bottom: 2px;
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

.chat-input textarea {
  flex: 1;
  resize: none;
  overflow: hidden;
  padding: 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font-size: 16px;
  min-height: 10px;
  max-height: 200px;
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

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .chat-container {
    max-width: 90%;
    margin: auto;
    height: 60vh;
  }

  .chat-header {
    padding: 0.8rem;
  }

  .chat-mensajes {
    padding: 0.8rem;
  }

  .chat-input textarea {
    padding: 8px;
  }
}
</style>
