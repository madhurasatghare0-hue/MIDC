import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-xs">
      <div
        className={`bg-white rounded-2xl shadow-raised border border-cream-200 w-full ${maxWidth} overflow-hidden transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
          <h3 className="font-display font-bold text-lg text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
