import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Send } from 'lucide-react'

export default function Chat({ patientId, title }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  const load = async () => {
    try {
      const url = patientId ? `/messages?patientId=${patientId}` : '/messages'
      const data = await api.get(url)
      setMessages(data.messages)
      // mark read
      await api.put('/messages/read', patientId ? { patientId } : {})
    } catch {}
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 6000)
    return () => clearInterval(t)
  }, [patientId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const body = { text: text.trim() }
      if (patientId) body.patientId = patientId
      await api.post('/messages', body)
      setText('')
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const isMe = (m) => String(m.sender?._id || m.sender) === String(user?._id)

  return (
    <div className="chat">
      {title && <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{title}</div>}
      <div className="chat-messages">
        {messages.length === 0 && <div className="empty" style={{ padding: 24 }}>Nenhuma mensagem ainda. Comece a conversa!</div>}
        {messages.map((m) => (
          <div key={m._id} className={`bubble ${isMe(m) ? 'me' : 'them'}`}>
            {m.text}
            <div className="meta">
              {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-input" onSubmit={send}>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite sua mensagem..." />
        <button className="btn btn-primary" type="submit" disabled={sending || !text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}