import { Link } from '@tanstack/react-router'
import { Globe } from 'lucide-react'
import React from 'react'

export const CallToAction: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-20 text-white">
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-6 text-4xl font-bold">Ready to speak up?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
          Join the fastest-growing network for tech professionals. Host your
          first space or find your next role today.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/feed"
            className="rounded-full bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-500"
          >
            Sign Up Free
          </Link>
          <Link
            to="/feed"
            className="rounded-full border border-slate-600 bg-transparent px-8 py-3 font-bold text-white transition-colors hover:bg-slate-800"
          >
            Join the Conversation
          </Link>
        </div>
      </div>
      <Globe className="animate-spin-slow absolute -right-20 -bottom-40 h-96 w-96 text-slate-800 opacity-50" />
    </section>
  )
}
