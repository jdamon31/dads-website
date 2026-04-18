'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

type FormState = 'idle' | 'loading' | 'success' | 'error'

function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setError('')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setState('success')
      setForm({ name: '', email: '', message: '' })
    } else {
      const d = await res.json()
      setError(d.error ?? 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-800 font-semibold">Message sent!</p>
        <p className="text-green-700 text-sm mt-1">We&apos;ll get back to you as soon as possible.</p>
        <button onClick={() => setState('idle')} className="mt-3 text-sm text-green-600 underline">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          required
          placeholder="What's on your mind?"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      {state === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={state === 'loading'} size="lg">
        {state === 'loading' ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  )
}

function RequestForm() {
  const [state, setState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', description: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setError('')
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setState('success')
      setForm({ name: '', email: '', phone: '', description: '' })
    } else {
      const d = await res.json()
      setError(d.error ?? 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-800 font-semibold">Request submitted!</p>
        <p className="text-green-700 text-sm mt-1">We&apos;ll reach out as soon as we track it down.</p>
        <button onClick={() => setState('idle')} className="mt-3 text-sm text-green-600 underline">
          Submit another request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" required />
      </div>
      <Input label="Phone (optional)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" />
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1">What are you looking for?</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          required
          placeholder="Describe the item — brand, model, condition, size, any details that help..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>
      {state === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={state === 'loading'} size="lg">
        {state === 'loading' ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  )
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-16">
      {/* Contact */}
      <section>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Get in Touch</h1>
          <p className="text-gray-500 mt-2">Have a question about an item or need help with an order? Send us a message.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <ContactForm />
        </div>
      </section>

      {/* Request */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Request an Item</h2>
          <p className="text-gray-500 mt-2">Don&apos;t see what you&apos;re looking for? Tell us what you need and we&apos;ll try to source it.</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <RequestForm />
        </div>
      </section>
    </div>
  )
}
