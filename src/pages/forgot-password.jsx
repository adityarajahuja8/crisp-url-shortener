import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { requestPasswordReset } from '@/db/apiAuth'
import { Mail } from 'lucide-react'

const ForgotPassword = () => {
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  };

  const { loading, fn: fnReset } = useFetch(requestPasswordReset, formData);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setErrors({});
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Invalid email format").required("Email is required"),
      });

      await schema.validate(formData, { abortEarly: false });
      await fnReset();
      // On success, ALWAYS show the generic message to avoid email enumeration
      setIsSubmitted(true);
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
          Forgot password
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {/* Centered Card Container */}
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-[#0f162a] backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80">
        <Card className="border-0 bg-transparent shadow-none p-0">
          <CardHeader className="p-0 mb-5 space-y-0">
            <h2 className="text-xl font-bold text-white tracking-tight">Forgot password</h2>
            <p className="text-xs text-slate-400 mt-1">We will send a reset link to your email</p>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            {isSubmitted && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-sm">
                If an account exists for that email, we sent a reset link.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="forgot-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-auto block w-full pl-10 pr-3.5 py-2.5 bg-[#0F172A] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-crisp-link focus:ring-1 focus:ring-crisp-link focus-visible:ring-1 focus-visible:ring-crisp-link focus-visible:border-crisp-link transition"
                />
              </div>
              {errors.email && <div className="mt-1"><Error message={errors.email} /></div>}
            </div>
          </CardContent>

          <CardFooter className="p-0 pt-4 flex flex-col gap-3">
            <Button
              className="w-full h-auto py-2.5 px-4 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-[#06080F] shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <BeatLoader size={10} color="#06080F" /> : "Send reset link"}
            </Button>

            <div className="text-center pt-2">
              <Link to="/auth" className="text-xs text-slate-400 hover:text-white transition-colors">
                ← Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword
