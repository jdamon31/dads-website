export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Dad&apos;s Store. All rights reserved.</p>
          <p>Questions? Email us and we&apos;ll get back to you.</p>
        </div>
      </div>
    </footer>
  )
}
