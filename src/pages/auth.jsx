import { useNavigate, useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from '@/components/login'
import Signup from '@/components/signup'
import { UrlState } from '@/context'
import { useEffect, useState } from 'react'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState("login")

  const longLink = searchParams.get("createNew")
  const navigate = useNavigate()

  const { isAuthenticated, loading } = UrlState()

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const redir = longLink ? `?createNew=${encodeURIComponent(longLink)}` : ""
      navigate(`/dashboard${redir}`)
    }
  }, [isAuthenticated, loading, navigate, longLink])

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Central Headings */}
      <div className="text-center max-w-lg mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5">
          {searchParams.get("createNew") ? "Hold up! Let's login first..." : "Login / Signup"}
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Sign in to manage your links and see how they perform.
        </p>
      </div>

      {/* Centered Card Container */}
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[#0f162a] backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex w-full flex-col">
          <TabsList className="relative bg-[#0F172A] p-1 rounded-xl border border-slate-800 flex h-auto w-full mb-6">
            {/* Animated Slider Indicator */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg bg-[#151D30] border border-slate-700/60 shadow-sm transition-transform duration-300 ease-in-out pointer-events-none ${activeTab === "signup" ? "translate-x-full" : "translate-x-0"
                }`}
            />

            <TabsTrigger
              value="login"
              className="relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors border-0 bg-transparent shadow-none text-slate-400 hover:text-slate-200 data-active:text-white data-active:bg-transparent dark:data-active:bg-transparent dark:data-active:text-white dark:data-active:border-transparent after:hidden"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors border-0 bg-transparent shadow-none text-slate-400 hover:text-slate-200 data-active:text-white data-active:bg-transparent dark:data-active:bg-transparent dark:data-active:text-white dark:data-active:border-transparent after:hidden"
            >
              Signup
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Login />
          </TabsContent>
          <TabsContent value="signup">
            <Signup />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Auth
