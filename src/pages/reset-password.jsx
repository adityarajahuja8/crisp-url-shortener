import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Error from '@/components/error'
import * as Yup from 'yup'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hook/use-fetch'
import { updatePassword } from '@/db/apiAuth'
import { supabase } from '@/db/supabase'
import { Lock, Eye, EyeOff } from 'lucide-react'

const ResetPassword = () => {
  const [sessionStatus, setSessionStatus] = useState('checking') // 'checking' | 'valid' | 'invalid'
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    // 1. Subscribe to auth state changes for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setSessionStatus('valid')
      }
    })

    // 2. Also check current session directly
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!isMounted) return
        if (data?.session) {
          setSessionStatus('valid')
          return
        }
      } catch {
        // Continue to timeout fallback
      }

      // Allow a brief period for Supabase to parse hash tokens / fire onAuthStateChange
      const timer = setTimeout(() => {
        if (isMounted) {
          setSessionStatus((prev) => (prev === 'valid' ? 'valid' : 'invalid'))
        }
      }, 1200)

      return () => clearTimeout(timer)
    }

    checkSession()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  };

  const { data, error, loading, fn: fnUpdatePassword } = useFetch(updatePassword, {
    password: formData.password,
  });

  useEffect(() => {
    if (error === null && data) {
      setSuccessMessage("Password updated")
      const timer = setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [data, error, navigate])

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrors({});
    try {
      const schema = Yup.object().shape({
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Please confirm your password"),
      });

      await schema.validate(formData, { abortEarly: false });
      await fnUpdatePassword();
    } catch (e) {
      if (e?.inner) {
        const newErrors = {};
        e.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Central Headings */}
      <div className="text-center max-w-lg mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2.5">
          Set a new password
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Enter and confirm your new password below.
        </p>
      </div>

      {/* Centered Card Container */}
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[#0f162a] backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
        <Card className="border-0 bg-transparent shadow-none p-0">
          <CardHeader className="p-0 mb-5 space-y-0">
            <h2 className="text-xl font-bold text-white tracking-tight">Set a new password</h2>
            <p className="text-xs text-slate-400 mt-1">Create a secure password for your account</p>
            {error && <div className="mt-2"><Error message={error.message} /></div>}
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            {sessionStatus === 'checking' && (
              <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                <BeatLoader size={8} color="#60A4F9" />
                <span>Verifying reset link...</span>
              </div>
            )}

            {sessionStatus === 'invalid' && (
              <div className="py-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-sm">
                  This reset link is invalid or has expired.
                </div>
                <div className="text-center pt-2">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-crisp-link hover:underline underline-offset-4"
                  >
                    Request a new password reset link
                  </Link>
                </div>
              </div>
            )}

            {sessionStatus === 'valid' && (
              <>
                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-sm font-medium">
                    {successMessage} — redirecting to dashboard...
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reset-password">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="reset-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="h-auto block w-full pl-10 pr-10 py-2.5 bg-[#0F172A] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-crisp-link focus:ring-1 focus:ring-crisp-link focus-visible:ring-1 focus-visible:ring-crisp-link focus-visible:border-crisp-link transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <div className="mt-1"><Error message={errors.password} /></div>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="reset-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-auto block w-full pl-10 pr-10 py-2.5 bg-[#0F172A] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-crisp-link focus:ring-1 focus:ring-crisp-link focus-visible:ring-1 focus-visible:ring-crisp-link focus-visible:border-crisp-link transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="mt-1"><Error message={errors.confirmPassword} /></div>}
                </div>
              </>
            )}
          </CardContent>

          {sessionStatus === 'valid' && (
            <CardFooter className="p-0 pt-4 flex flex-col gap-3">
              <Button
                className="w-full h-auto py-2.5 px-4 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-[#06080F] shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading || Boolean(successMessage)}
              >
                {loading ? <BeatLoader size={10} color="#06080F" /> : "Update password"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
