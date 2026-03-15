export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-100 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg btn-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm leading-none">✂️</span>
            </div>
            <span className="font-bold text-gray-700">
              BG<span className="gradient-text">Remover</span>
            </span>
          </div>

          {/* Privacy */}
          <p className="flex items-center gap-1.5 text-center">
            <span>🔒</span>
            Images are never stored — deleted immediately after processing.
          </p>

          {/* Credits */}
          <p>
            Powered by{' '}
            <a
              href="https://www.remove.bg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-500 hover:text-purple-700 underline transition-colors"
            >
              Remove.bg
            </a>
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center text-xs text-gray-300">
          © {new Date().getFullYear()} BGRemover · Free · No account required
        </div>
      </div>
    </footer>
  )
}
