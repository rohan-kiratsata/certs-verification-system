import { useEffect, useState } from 'react'
import { api } from './lib/api'
import './App.css'

type Health = {
  status: string
  service: string
  time: string
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Health>('/health')
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <section id="center">
      <h1>fueler</h1>
      <p>React + Vite frontend, Laravel API backend.</p>
      {error && <p role="alert">Backend unreachable: {error}</p>}
      {health && (
        <p>
          Backend <strong>{health.service}</strong> is {health.status} (
          {health.time})
        </p>
      )}
      {!health && !error && <p>Checking backend…</p>}
    </section>
  )
}

export default App
