import Header from '@/components/header'
import { Outlet } from "react-router-dom";
const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-grow container">
        <Outlet />
      </main>
      <footer className="relative p-10 text-center bg-[#0F172A] text-[#F8FAFC] border-t border-[#1E293B]">
        <span>Made with 💗</span>
        <a
          href="https://github.com/adityarajahuja8/crisp-url-shortener"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Crisp on GitHub"
          className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md border border-transparent p-1 hover:text-[#60a4f9]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.589 2 12.264c0 4.537 2.865 8.386 6.839 9.745.5.095.682-.223.682-.495 0-.244-.009-.89-.014-1.747-2.782.622-3.369-1.379-3.369-1.379-.455-1.187-1.11-1.503-1.11-1.503-.908-.638.069-.625.069-.625 1.004.073 1.532 1.063 1.532 1.063.892 1.575 2.341 1.12 2.912.856.091-.666.349-1.12.635-1.378-2.22-.26-4.555-1.139-4.555-5.07 0-1.12.389-2.034 1.029-2.752-.103-.26-.446-1.303.098-2.715 0 0 .84-.276 2.75 1.05A9.185 9.185 0 0 1 12 8.209a9.24 9.24 0 0 1 2.504.35c1.909-1.326 2.748-1.05 2.748-1.05.545 1.412.202 2.455.1 2.715.64.718 1.028 1.632 1.028 2.752 0 3.941-2.339 4.807-4.566 5.062.359.32.678.949.678 1.913 0 1.38-.012 2.493-.012 2.832 0 .275.18.595.688.494C19.138 20.647 22 16.798 22 12.264 22 6.589 17.523 2 12 2Z" />
          </svg>
        </a>
      </footer>
    </div>
  )
}

export default AppLayout
