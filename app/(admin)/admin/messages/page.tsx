'use client'

import { useEffect, useState } from 'react'
import { ContactMessage, ItemRequest, RequestStatus, Offer, OfferStatus } from '@/types'
import { formatPrice } from '@/lib/utils'

type Tab = 'contacts' | 'requests' | 'offers'

const REQUEST_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  fulfilled: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-600',
}

const OFFER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  countered: 'bg-purple-100 text-purple-800',
  declined: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CounterModal({ offer, onClose, onSubmit }: {
  offer: Offer
  onClose: () => void
  onSubmit: (amount: number, message: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Send Counter Offer</h3>
        <p className="text-sm text-gray-500">Their offer: <strong>{formatPrice(offer.offer_amount_cents)}</strong></p>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Your Counter Price ($)</label>
          <input
            type="number" min="0.01" step="0.01"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 85.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Message (optional)</label>
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)}
            rows={3} placeholder="Add a note to the buyer..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { if (amount) onSubmit(Math.round(parseFloat(amount) * 100), message) }}
            disabled={!amount}
            className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50"
          >
            Send Counter
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>('contacts')
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [counterTarget, setCounterTarget] = useState<Offer | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadAll() {
    setLoading(true)
    const [c, r, o] = await Promise.all([
      fetch('/api/contact').then(res => res.ok ? res.json() : []),
      fetch('/api/requests').then(res => res.ok ? res.json() : []),
      fetch('/api/offers').then(res => res.ok ? res.json() : []),
    ])
    setContacts(c)
    setRequests(r)
    setOffers(o)
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  async function markRead(id: string) {
    await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
    setContacts(prev => prev.map(c => c.id === id ? { ...c, read: true } : c))
  }

  async function updateRequestStatus(id: string, status: RequestStatus) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  async function handleOfferAction(id: string, action: string, extra?: object) {
    setActionLoading(id + action)
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    if (res.ok) {
      const newStatus: OfferStatus = action === 'accept' ? 'accepted' : action === 'counter' ? 'countered' : 'declined'
      setOffers(prev => prev.map(o => o.id === id ? {
        ...o,
        status: newStatus,
        ...(extra as object),
      } : o))
    }
    setActionLoading(null)
    setCounterTarget(null)
  }

  const unreadContacts = contacts.filter(c => !c.read).length
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const pendingOffers = offers.filter(o => o.status === 'pending').length

  const tabs: { key: Tab; label: string; badge: number }[] = [
    { key: 'contacts', label: 'Contact Messages', badge: unreadContacts },
    { key: 'requests', label: 'Item Requests', badge: pendingRequests },
    { key: 'offers', label: 'Offers', badge: pendingOffers },
  ]

  return (
    <div className="space-y-6">
      {counterTarget && (
        <CounterModal
          offer={counterTarget}
          onClose={() => setCounterTarget(null)}
          onSubmit={(amount, message) => handleOfferAction(counterTarget.id, 'counter', {
            counter_amount_cents: amount,
            counter_message: message || null,
          })}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{badge}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tab === 'contacts' ? (
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No messages yet.</p>
          ) : contacts.map(msg => (
            <div key={msg.id} className={`bg-white rounded-xl border p-5 space-y-3 ${msg.read ? 'border-gray-200' : 'border-brand-300 shadow-sm'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    {msg.name}
                    {!msg.read && <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />}
                  </p>
                  <a href={`mailto:${msg.email}`} className="text-sm text-brand-600 hover:underline">{msg.email}</a>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3">{msg.message}</p>
              <div className="flex gap-2">
                <a href={`mailto:${msg.email}?subject=Re: Your message to Replay Industrial`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Reply via Email →</a>
                {!msg.read && <button onClick={() => markRead(msg.id)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">Mark as read</button>}
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'requests' ? (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No item requests yet.</p>
          ) : requests.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{req.name}</p>
                  <a href={`mailto:${req.email}`} className="text-sm text-brand-600 hover:underline">{req.email}</a>
                  {req.phone && <p className="text-sm text-gray-500">{req.phone}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${REQUEST_STATUS_STYLES[req.status]}`}>{req.status}</span>
                  <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                <p className="text-xs text-orange-600 font-medium mb-1">Looking for:</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{req.description}</p>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => updateRequestStatus(req.id, 'fulfilled')} className="text-sm font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Mark Fulfilled + Notify Customer</button>
                  <button onClick={() => updateRequestStatus(req.id, 'dismissed')} className="text-sm font-medium px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">Dismiss</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* ── Offers ── */
        <div className="space-y-3">
          {offers.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No offers yet.</p>
          ) : offers.map(offer => (
            <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-brand-600 font-medium uppercase tracking-wide mb-0.5">{offer.product?.title}</p>
                  <p className="font-semibold text-gray-900">{offer.buyer_name}</p>
                  <a href={`mailto:${offer.buyer_email}`} className="text-sm text-brand-600 hover:underline">{offer.buyer_email}</a>
                  {offer.buyer_phone && <p className="text-sm text-gray-500">{offer.buyer_phone}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${OFFER_STATUS_STYLES[offer.status]}`}>{offer.status}</span>
                  <span className="text-xs text-gray-400">{formatDate(offer.created_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-gray-500">Offer</p>
                  <p className="text-xl font-black text-gray-900">{formatPrice(offer.offer_amount_cents)}</p>
                </div>
                {offer.counter_amount_cents && (
                  <>
                    <span className="text-gray-300 text-lg">→</span>
                    <div>
                      <p className="text-xs text-gray-500">Counter</p>
                      <p className="text-xl font-black text-brand-600">{formatPrice(offer.counter_amount_cents)}</p>
                    </div>
                  </>
                )}
              </div>

              {offer.message && (
                <p className="text-sm text-gray-600 italic px-1">&ldquo;{offer.message}&rdquo;</p>
              )}
              {offer.counter_message && (
                <p className="text-sm text-gray-500 italic px-1">Your note: &ldquo;{offer.counter_message}&rdquo;</p>
              )}

              {offer.status === 'pending' && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button
                    disabled={!!actionLoading}
                    onClick={() => handleOfferAction(offer.id, 'accept')}
                    className="text-sm font-semibold px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Accept — Send Payment Link
                  </button>
                  <button
                    disabled={!!actionLoading}
                    onClick={() => setCounterTarget(offer)}
                    className="text-sm font-semibold px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    Counter
                  </button>
                  <button
                    disabled={!!actionLoading}
                    onClick={() => handleOfferAction(offer.id, 'decline')}
                    className="text-sm font-medium px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
