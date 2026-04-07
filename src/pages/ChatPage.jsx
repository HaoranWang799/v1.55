import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Send } from 'lucide-react'
import { fetchVirtualLoverMessage } from '../api/virtualLover'
import { useL } from '../i18n/useL'

export default function ChatPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast, lang } = useApp()
  const L = useL()
  const [inputVal, setInputVal] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [streamingReply, setStreamingReply] = useState('')
  const listRef = useRef(null)
  const typingTimerRef = useRef(null)

  const lover = useMemo(() => {
    const fromState = location.state?.lover || {}
    return {
      id: fromState.id || 'default-lover-luna',
      name: fromState.name || 'Luna',
      avatar: fromState.avatar || 'L',
    }
  }, [location.state])

  const storageKey = `ai-lover-chat:${lover.id}:${lang}`

  const [messages, setMessages] = useState(() => {
    const cached = window.localStorage.getItem(storageKey)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {
        // ignore invalid cache
      }
    }
    return [{ role: 'ai', text: L(`主人，${lover.name} 在这，今晚想和我聊点什么？`, `Hey, ${lover.name} is here. What shall we talk about tonight?`) }]
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, streamingReply])

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }
  }, [])

  const streamAiReply = (fullText) => new Promise((resolve) => {
    const finalText = String(fullText || '').trim()
    if (!finalText) {
      resolve('')
      return
    }

    if (typingTimerRef.current) {
      window.clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }

    let cursor = 0
    setStreamingReply('')

    typingTimerRef.current = window.setInterval(() => {
      cursor += Math.random() < 0.72 ? 1 : 2
      const nextText = finalText.slice(0, Math.min(cursor, finalText.length))
      setStreamingReply(nextText)

      if (cursor >= finalText.length) {
        window.clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
        setMessages((prev) => [...prev, { role: 'ai', text: finalText }])
        setStreamingReply('')
        resolve(finalText)
      }
    }, 42)
  })

  const handleSend = async () => {
    const content = inputVal.trim()
    if (!content || isSending) return

    setMessages((prev) => [...prev, { role: 'user', text: content }])
    setInputVal('')
    setIsSending(true)

    try {
      const result = await fetchVirtualLoverMessage({
        forceRefresh: true,
        text: content,
        context: {
          lang,
          userName: L('主人', 'Master'),
          loverId: lover.id,
          loverName: lover.name,
        },
        lang,
      })

      const reply = String(result?.text || '').trim() || L('我在这，继续和我说说吧。', "I'm here, keep talking to me.")
      await streamAiReply(reply)

      if (result?.fallback) {
        showToast(L('当前网络不稳定，已使用降级回复', 'Network unstable, using fallback reply'))
      }
    } catch (error) {
      setStreamingReply('')
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: L('我刚刚有点走神了，再和我说一次好吗？', 'Sorry, I got distracted. Could you say that again?') },
      ])
      showToast(error?.message || L('发送失败，请稍后重试', 'Failed to send, please try again later'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0C060B] text-[#F9EDF5]">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#FF7DAF]/20 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 text-[#9B859D]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-base font-bold text-[#F9EDF5]">{L(`${lover.name} 专属对话`, `${lover.name} Private Chat`)}</h1>
        <div className="w-10" />
      </div>

      {/* 消息区 */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-end space-x-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7DAF] to-[#A87CFF] flex items-center justify-center text-xs text-white shrink-0">
                {lover.avatar}
              </div>
            )}
            <div className={`${msg.role === 'user' ? 'bg-[#A87CFF]/20 border border-[#A87CFF]/35' : 'bg-[#1E1324]'} text-sm p-3 rounded-2xl text-[#F9EDF5] max-w-[80%] leading-relaxed`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isSending && !streamingReply && (
          <div className="flex items-end space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7DAF] to-[#A87CFF] flex items-center justify-center text-xs text-white shrink-0">
              {lover.avatar}
            </div>
            <div className="bg-[#1E1324] text-sm p-3 rounded-2xl text-[#CDB9D4] max-w-[80%] leading-relaxed">
              {L('正在想你这句话...', 'Thinking about what you said...')}
            </div>
          </div>
        )}
        {streamingReply && (
          <div className="flex items-end space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7DAF] to-[#A87CFF] flex items-center justify-center text-xs text-white shrink-0">
              {lover.avatar}
            </div>
            <div className="bg-[#1E1324] text-sm p-3 rounded-2xl text-[#F9EDF5] max-w-[80%] leading-relaxed">
              {streamingReply}
            </div>
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <div className="shrink-0 p-4 bg-[#0C060B]">
        <div className="flex bg-[#1E1324] rounded-full p-2 pl-4 items-center">
          <input
            type="text"
            placeholder={L('发送指令...', 'Send a message...')}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isSending}
            className="flex-1 bg-transparent outline-none text-sm text-[#F9EDF5] placeholder:text-[#9B859D]"
          />
          <button
            onClick={() => {
              handleSend()
            }}
            disabled={isSending || !inputVal.trim()}
            className="bg-[#FF7DAF] p-2 rounded-full text-white active:scale-90 transition-transform disabled:opacity-45 disabled:active:scale-100"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
