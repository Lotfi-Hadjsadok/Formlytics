'use client'

import { useEffect, useState } from 'react'
import { initializePaddle, Paddle } from '@paddle/paddle-js'

let paddleInstance: Paddle | null | undefined = null

export function usePaddle(customerId?: string) {
  const [paddle, setPaddle] = useState<Paddle | null | undefined>(paddleInstance)
  const [loading, setLoading] = useState(!paddleInstance)

  useEffect(() => {
    if (paddleInstance) return

    const init = async () => {
      setLoading(true)
      paddleInstance = await initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_KEY as string,
        environment: process.env.NODE_ENV === "production" ? 'production' : 'sandbox',
        pwCustomer: { id: customerId ?? '' },
      })
      setPaddle(paddleInstance)
      setLoading(false)
    }

    init()
  }, [customerId])

  return { paddle, loading }
}
