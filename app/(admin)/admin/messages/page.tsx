'use client'

import { useEffect, useState } from 'react'
import { ContactMessage, ItemRequest, RequestStatus } from '@/types'

type Tab = 'contacts' | 'requests'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  fulfilled: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-600',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MessagesPage() {
  const [tab, setTab] = useState<Tab>('contacts')
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [requests, setRequests] = useState<ItemRequest[]>([])
  const [loading, setLoading] = useState(true)

  async function loadContacts() {
    const res = await fetch('/api/contact')
    if (res.ok) setContacts(await res.json())
  }

  async function loadRequests() {
    const res = await fetch('/api/requests')
    if (res.ok) setRequests(await res.json())
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadContacts(), loadRequests()]).finally(() => setLoading(false))
  }, [])

  async function markRead(id: string) {
    await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, read: true } : c))
  }

  async function updateRequestStatus(id: string, status: RequestStatus) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    }
  }

  const unreadContacts = contacts.filter((c) => !c.read).length
  const pendingRequests = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([
          { key: 'contacts' as Tab, label: 'Contact Messages', badge: unreadContacts },
          { key: 'requests' as Tab, label: 'Item Requests', badge: pendingRequests },
        ]).map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tab === 'contacts' ? (
        /* ── Contact Messages ── */
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No messages yet.</p>
          ) : (
            contacts.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-xl border p-5 space-y-3 ${
                  msg.read ? 'border-gray-200' : 'border-brand-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      {msg.name}
                      {!msg.read && (
                        <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
                      )}
                    </p>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {msg.email}
                    </a>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
                  {msg.message}
                </p>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=Re: Your message to Replay Industrial`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Reply via Email →
                  </a>
                  {!msg.read && (
                    <button
                      onClick={() => markRead(msg.id)}
                      className="ml-auto text-xs text-gray-400 hover:text-gray-600"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ── Item Requests ── */
        <div className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No item requests yet.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{req.name}</p>
                    <a
                      href={`mailto:${req.email}`}
                      className="text-sm text-brand-600 hover:underline"
                    >
                      {req.email}
                    </a>
                    {req.phone && (
                      <p className="text-sm text-gray-500">{req.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[req.status]}`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-orange-600 font-medium mb-1">Looking for:</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{req.description}</p>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => updateRequestStatus(req.id, 'fulfilled')}
                      className="text-sm font-medium px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Mark Fulfilled + Notify Customer
                    </button>
                    <button
                      onClick={() => updateRequestStatus(req.id, 'dismissed')}
                      className="text-sm font-medium px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
