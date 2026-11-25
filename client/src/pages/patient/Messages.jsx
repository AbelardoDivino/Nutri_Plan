import Chat from '../../components/Chat.jsx'
import { MessageSquare } from 'lucide-react'

export default function Messages() {
  return (
    <div>
      <h1 style={{ marginBottom: 18 }}>Mensagens</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Converse com sua nutricionista.</p>
      <Chat title="Chat com a nutricionista" />
    </div>
  )
}