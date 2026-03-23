'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ReactionButtonProps = {
  userId: string | null
  targetType: 'comment' | 'reply'
  targetId: number
  initialCount: number
  initialReacted: boolean
}

export default function ReactionButton({
  userId,
  targetType,
  targetId,
  initialCount,
  initialReacted,
}: ReactionButtonProps) {
  const supabase = createClient()
  const router = useRouter()

  const [count, setCount] = useState(initialCount)
  const [reacted, setReacted] = useState(initialReacted)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleToggleReaction() {
    if (!userId) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    setMessage('')

    if (reacted) {
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', userId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('reaction_type', 'like')

      if (error) {
        console.error('Error quitando reacción:', error)
        setMessage('No se pudo quitar la reacción.')
      } else {
        setReacted(false)
        setCount((prev) => Math.max(0, prev - 1))
        router.refresh()
      }
    } else {
      const { error } = await supabase.from('reactions').insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
        reaction_type: 'like',
      })

      if (error) {
        console.error('Error agregando reacción:', error)
        setMessage('No se pudo registrar la reacción.')
      } else {
        setReacted(true)
        setCount((prev) => prev + 1)
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={loading}
        onClick={handleToggleReaction}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
          reacted
            ? 'bg-white text-black'
            : 'border border-white/20 text-white'
        }`}
      >
        {loading
          ? 'Procesando...'
          : reacted
          ? `Quitar me gusta (${count})`
          : `Me gusta (${count})`}
      </button>

      {message ? (
        <p className="mt-2 text-sm text-yellow-300">{message}</p>
      ) : null}
    </div>
  )
}