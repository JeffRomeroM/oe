<template>
  <Header/>
<div class="chat-container-padre">
  
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
    <MenuAbajo /> 
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '../supabase'
import MenuAbajo from '../components/MenuAbajo.vue'
import Header from '../components/Header.vue'

const mensajes = ref([])
const mensaje = ref('')
const mensajeEditado = ref('')
const editandoId = ref(null)
const userId = ref(null)
const chatScroll = ref(null)

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
.chat-container-padre {
  display: flex;
  width: 100%;

}

/* Caja principal */
.chat-container {
  width: 75%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  height: 70vh;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  z-index: 100;
  position: fixed;
  margin: auto !important;
  bottom: 70px; /* deja espacio al menú inferior */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Header */
.chat-header {
  background: #4caf50;
  color: white;
  text-align: center;
  padding: 0.8rem;
  position: relative;
  border-radius: 12px 12px 0 0;
  font-weight: bold;
}

/* Lista de mensajes */
.chat-mensajes {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: #f6f6f6;
  scroll-behavior: smooth;
}

/* Estilo general de burbujas */
.mensaje {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 0.8rem;
  max-width: 70%;
  word-wrap: break-word;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
  position: relative;
  line-height: 1.4;
}

/* Mensaje propio */
.mensaje.mio {
  background: #83c460;
  align-self: flex-end;
  margin-top: 10px;
  text-align: right;
  flex-direction: row-reverse;
  border-bottom-right-radius: 4px;
}

/* Mensaje de otro */
.mensaje.otro {
  background: #ffffff;
  margin-top: 10px;
  padding-top:50px;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

/* Avatar */
.avatar {
  background: #4caf50;
  color: white;
  font-weight: bold;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Info del mensaje */
.mensaje-info {
  font-size: 11px;
  color: #666;
  margin-bottom: 2px;
}

.contenido {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}

/* Input */
.chat-input {
  display: flex;
  align-items: center;
  padding: 8px;
  border-top: 1px solid #ddd;
  background: #fff;
}

.chat-input textarea {
  flex: 1;
  resize: none;
  overflow: hidden;
  padding: 8px;
  border: 1px solid #bbb;
  border-radius: 8px;
  font-size: 14px;
  min-height: 36px;
  max-height: 150px;
}

.chat-input button {
  padding: 0 16px;
  margin-left: 6px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.input-editar {
  width: 100%;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #aaa;
  font-size: 14px;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 4px;
}

.acciones button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

/* 📱 Mobile */
@media (max-width: 640px) {
  .chat-container-padre {
  display: flex;
  width: 100%;
}

  .chat-container {
    width: 97%;
    max-width: 100%;
    margin: auto!important;
    margin-left: 1.4%!important;
    height: 80vh;
    border-radius: 0;
    bottom: 60px; /* deja visible el menú inferior */
    border: none;
  }

  .chat-header {
    padding: 0.6rem;
    font-size: 14px;
  }

  .chat-mensajes {
    padding: 0.6rem;
  }

  .mensaje {
    max-width: 85%;
    font-size: 13px;
  }

  .chat-input textarea {
    font-size: 13px;
  }
}
</style>
