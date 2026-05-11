<template>
  

  <div class="chat-page">
    
    <!-- HEADER -->
    

    <!-- CHAT -->
    <div class="chat-container">

      <!-- MENSAJES -->
      <div class="chat-mensajes" ref="chatScroll">

        <div
          v-for="msg in mensajes"
          :key="msg.id"
          :class="['mensaje-wrapper', msg.user_id === userId ? 'mio-wrapper' : 'otro-wrapper']"
        >

          <!-- AVATAR -->
          <div
            v-if="msg.user_id !== userId"
            class="avatar"
          >
            {{ msg.full_name?.charAt(0).toUpperCase() || '?' }}
          </div>

          <!-- BURBUJA -->
          <div
            :class="['mensaje', msg.user_id === userId ? 'mio' : 'otro']"
          >

            <!-- INFO -->
            <div class="mensaje-top">
              <small>
                {{
                  msg.user_id === userId
                    ? 'Tú'
                    : msg.full_name
                }}
              </small>

              <span>
                {{
                  new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                }}
              </span>
            </div>

            <!-- EDITAR -->
            <div v-if="editandoId === msg.id">

              <textarea
                v-model="mensajeEditado"
                class="input-editar"
              ></textarea>

              <div class="acciones">
                <button
                  class="btn-guardar"
                  @click="guardarEdicion(msg.id)"
                >
                  <Icon icon="mdi:content-save-outline" />
                </button>

                <button
                  class="btn-cancelar"
                  @click="cancelarEdicion"
                >
                  <Icon icon="mdi:close" />
                </button>
              </div>

            </div>

            <!-- MENSAJE -->
            <div v-else>

              <div class="contenido">
                {{ msg.contenido }}
              </div>

              <!-- ACCIONES -->
              <div
                v-if="msg.user_id === userId"
                class="acciones"
              >
                
                <Icon icon="mdi:pencil-outline" @click="editar(msg)" class="editar"/>
               

                <Icon icon="mdi:trash-can"  @click="eliminar(msg.id)" class="eliminarMsg"/>
               
              </div>

            </div>

          </div>

        </div>

      </div>

      <!-- INPUT -->
      <form
        @submit.prevent="guardar"
        class="chat-input"
      >

        <div class="input-box">

          <textarea
            v-model="mensaje"
            placeholder="Escribe un mensaje..."
            rows="1"
            @input="autoExpand"
            ref="textarea"
            required
          ></textarea>

          <button type="submit">
            <Icon icon="mdi:send" />
          </button>

        </div>

      </form>

    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
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
    if (chatScroll.value) {
      chatScroll.value.scrollTop =
        chatScroll.value.scrollHeight
    }
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

  await supabase.from('mensajes').insert([
    {
      contenido: mensaje.value,
      user_id: userId.value,
      full_name: perfil?.full_name || 'Usuario'
    }
  ])

  mensaje.value = ''

  autoExpand()

  await cargarMensajes()
}

const editar = (msg) => {
  editandoId.value = msg.id
  mensajeEditado.value = msg.contenido
}

const guardarEdicion = async (id) => {
  await supabase
    .from('mensajes')
    .update({
      contenido: mensajeEditado.value
    })
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
  await supabase
    .from('mensajes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId.value)

  await cargarMensajes()
}

onMounted(async () => {
  await obtenerUsuario()
  await cargarMensajes()

  supabase
    .channel('chat')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mensajes'
      },
      cargarMensajes
    )
    .subscribe()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.chat-page {
  min-height: 100vh;
  background: #efeae2;
  padding: 0.8rem;
  padding-bottom: 100px;
}

/* HEADER */

.top-chat {
  background: linear-gradient(135deg, #22c55e, #15803d);
  border-radius: 18px;
  padding: 0.9rem 1rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-chat {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-chat svg {
  font-size: 1.6rem;
}

.top-chat h2 {
  margin: 0;
  font-size: 1.2rem;
}

.top-chat p {
  margin: 3px 0 0;
  opacity: 0.9;
  font-size: 13px;
}

.online-status {
  background: rgba(255,255,255,0.15);
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
}

.online-status span {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
}

/* CHAT */

.chat-container {
  background: #efeae2;
  border-radius: 18px;
  height: calc(100vh - 180px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* MENSAJES */

.chat-mensajes {
  flex: 1;
  overflow-y: auto;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
}

/* WRAPPER */

.mensaje-wrapper {
  display: flex;
  margin-bottom: 0.35rem;
  align-items: flex-end;
}

.mio-wrapper {
  justify-content: flex-end;
}

.otro-wrapper {
  justify-content: flex-start;
}

/* AVATAR */

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  font-weight: bold;
  font-size: 13px;
  flex-shrink: 0;
}

/* MENSAJES */

.mensaje {
  max-width: 78%;
  padding: 0.38rem 0.55rem;
  border-radius: 10px;
  position: relative;
  word-break: break-word;
  animation: fade .15s ease;
}


@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(3px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mensaje.mio {
  background: #d9fdd3;
  color: #111827;
  border-bottom-right-radius: 3px;
}

.mensaje.otro {
  background: white;
  color: #111827;
  border-bottom-left-radius: 3px;
}

/* INFO */

.mensaje-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  font-size: 11px;
}

.mensaje-top small {
  font-weight: 600;
  color: #15803d;
}

.mensaje-top span {
  color: #6b7280;
  font-size: 10px;
}

/* TEXTO */

.contenido {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.35;
  font-size: 14px;
}

/* INPUT */

.chat-input {
  background: #f0f2f5;
  padding: 0.5rem;
  border-top: 1px solid #ddd;
}

.input-box {
  background: white;
  border-radius: 24px;
  padding: 0.25rem 0.3rem 0.25rem 0.8rem;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-box textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  padding-top: 0.65rem;
  font-size: 14px;
  max-height: 120px;
  min-height: 36px;
  line-height: 1.35;
}

.input-box textarea::placeholder {
  color: #9ca3af;
}

.input-box button {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
  transition: 0.2s;
}

.input-box button:hover {
  background: #16a34a;
}

.input-box button svg {
  font-size: 1rem;
}

/* EDITAR */

.input-editar {
  width: 100%;
  border: none;
  outline: none;
  border-radius: 8px;
  padding: 0.55rem;
  resize: none;
  min-height: 65px;
  font-size: 14px;
}

/* ACCIONES */

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.btn-icon,
.btn-guardar,
.btn-cancelar {
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editar,
.btn-guardar {
  color: #15803d;
}

.eliminarMsg {
  color: rgb(236, 10, 10);
}



.btn-cancelar {
  background: #e5e7eb;
  color: #374151;
}

/* SCROLL */

.chat-mensajes::-webkit-scrollbar {
  width: 5px;
}

.chat-mensajes::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 10px;
}

/* RESPONSIVE */

@media (max-width: 768px) {

  .chat-page {
    padding: 0.5rem;
    padding-bottom: 90px;
  }

  .chat-container {
    height: calc(100vh - 165px);
  }

  .mensaje {
    max-width: 88%;
  }

  .top-chat {
    border-radius: 14px;
    padding: 0.8rem;
  }

  .icon-chat {
    width: 42px;
    height: 42px;
  }

  .icon-chat svg {
    font-size: 1.3rem;
  }

}

@media (max-width: 480px) {

  .top-chat {
    flex-direction: column;
    align-items: flex-start;
  }

  .online-status {
    width: 100%;
    justify-content: center;
  }

  .mensaje {
    max-width: 94%;
  }

  .chat-mensajes {
    padding: 0.5rem;
  }

}
</style>