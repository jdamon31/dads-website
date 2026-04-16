export function Footer() {
  return (
    <footer className="bg-dark-900 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-black text-white tracking-tight">REWIND</p>
            <p className="text-slate-400 text-sm mt-1">Quality goods at great prices.</p>
          </div>
          <div className="text-sm text-slate-400 text-center sm:text-right space-y-1">
            <p>Ships nationwide · Local pickup available</p>
            <p>© {new Date().getFullYear()} Rewind. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
