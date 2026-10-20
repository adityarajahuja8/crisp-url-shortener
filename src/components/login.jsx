//pura code samaj na hai

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Error from '@/components/error'
import { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { BeatLoader } from 'react-spinners'
import useFetch from '@/hook/use-fetch'
import { login } from '@/db/apiAuth'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UrlState } from '@/context'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const createNew = searchParams.get("createNew");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  };

  const { data, error, loading, fn: fnLogin } = useFetch(login, formData);
  const { fetchUser } = UrlState();

  useEffect(() => {
    if (error === null && data) {
      const redirectQuery = createNew
        ? `?createNew=${encodeURIComponent(createNew)}`
        : ''
      navigate(`/dashboard${redirectQuery}`)
      fetchUser()
    }
  }, [data, error, fetchUser, navigate, createNew])

  const handleLogin = async () => {
    setErrors({})
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email("Invalid email format").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
      })

      await schema.validate(formData, { abortEarly: false });

      await fnLogin();

    } catch (e) {
      const newErrors = {};

      e?.inner?.forEach((error) => {
        newErrors[error.path] = error.message;
      });

      setErrors(newErrors);
    }

  }

  return (
    <div>
      <Card className="border-0 bg-transparent shadow-none p-0">
        <CardHeader className="p-0 mb-5 space-y-0">
          <h2 className="text-xl font-bold text-white tracking-tight">Login</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
          {error && <div className="mt-2"><Error message={error.message} /></div>}
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4 w-4" />
              </div>
              <Input
                id="login-email"
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

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
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
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-slate-400 hover:text-crisp-link transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            {errors.password && <div className="mt-1"><Error message={errors.password} /></div>}
          </div>
        </CardContent>
        <CardFooter className="p-0 pt-2">
          <Button
            className="w-full h-auto py-2.5 px-4 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-[#06080F] shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <BeatLoader size={10} color="#06080F" /> : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
