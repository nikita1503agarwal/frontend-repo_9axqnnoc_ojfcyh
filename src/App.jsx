import { useEffect, useMemo, useState } from 'react'
import PackageCard from './components/PackageCard'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState([])
  const [selected, setSelected] = useState(null)
  const [playerId, setPlayerId] = useState('')
  const [serverId, setServerId] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  const fetchPackages = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${baseUrl}/api/mlbb/packages`)
      if (res.status === 404) {
        // Try seeding if not found
        await fetch(`${baseUrl}/seed/mlbb`, { method: 'POST' })
        const res2 = await fetch(`${baseUrl}/api/mlbb/packages`)
        const data2 = await res2.json()
        setPackages(data2.packages || [])
      } else {
        const data = await res.json()
        setPackages(data.packages || [])
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Unable to load packages. Please try again later.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const canCheckout = useMemo(() => selected && playerId && serverId, [selected, playerId, serverId])

  const placeOrder = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!canCheckout) return
    try {
      const res = await fetch(`${baseUrl}/api/mlbb/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId.trim(),
          server_id: serverId.trim(),
          package_id: selected._id,
          contact_email: email || undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Order failed')
      setMessage({ type: 'success', text: `Order created! ID: ${data.order_id}. Status: ${data.status}` })
      setSelected(null)
      setPlayerId('')
      setServerId('')
      setEmail('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/mlbb.png" alt="MLBB" className="w-8 h-8" onError={(e)=>{e.currentTarget.style.display='none'}} />
            <h1 className="text-xl font-bold text-gray-800">MLBB Diamonds Store</h1>
          </div>
          <a href="/test" className="text-sm text-gray-600 hover:text-blue-600">System Check</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Package</h2>
            {loading ? (
              <p className="text-gray-500">Loading packages...</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <PackageCard key={pkg._id} pkg={pkg} selected={selected?._id === pkg._id} onSelect={setSelected} />
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Top-up Details</h2>
            <form onSubmit={placeOrder} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Player ID</label>
                <input value={playerId} onChange={(e)=>setPlayerId(e.target.value)} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 123456789" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Server ID</label>
                <input value={serverId} onChange={(e)=>setServerId(e.target.value)} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 1234" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email (optional)</label>
                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Selected Package</label>
                <div className="p-3 rounded-lg border bg-gray-50 text-sm text-gray-700 min-h-[48px]">
                  {selected ? (
                    <div className="flex items-center justify-between">
                      <span>{selected.name} • {selected.diamonds} diamonds</span>
                      <span className="font-semibold text-blue-600">${(selected.price ?? 0).toFixed(2)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No package selected</span>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={!canCheckout}
                className={`w-full rounded-lg py-2 font-semibold text-white transition-colors ${canCheckout ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Place Order
              </button>
              {message && (
                <p className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
              )}
              <p className="text-xs text-gray-500">Delivery: 1-10 minutes after payment. Ensure your Player ID and Server ID are correct.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        Secure payments coming soon. This is a demo store.
      </footer>
    </div>
  )
}

export default App
