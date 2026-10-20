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
import { signup } from '@/db/apiAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { UrlState } from '@/context'
import { User, Mail, Lock, Eye, EyeOff, Image } from 'lucide-react'

const Signup = () => {
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  })

  const navigate = useNavigate();
  const [searchParams] = useSearchParams()
  const createNew = searchParams.get("createNew")

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }))
  };

  const { data, error, loading, fn: fnSignup } = useFetch(signup, formData);
  const { fetchUser } = UrlState();

  useEffect(() => {
    if (!data?.user || error || loading) return

    const finishSignup = async () => {
      await fetchUser()
      const redirectQuery = createNew
        ? `?createNew=${encodeURIComponent(createNew)}`
        : ''
      navigate(`/dashboard${redirectQuery}`)
    }

    finishSignup()
  }, [data, error, loading, fetchUser, navigate, createNew])

  const handleSignup = async (e) => {
    e.preventDefault()
    if (loading) return
    setErrors({})
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string().email("Invalid email format").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        profile_pic: Yup.mixed().test("fileTypeOrSize", "Profile picture must be an image up to 5 MB", (value) => {
          if (!value || !(value instanceof File)) return true;
          return value.type.startsWith("image/") && value.size <= 5 * 1024 * 1024;
        })
      })

      await schema.validate(formData, { abortEarly: false });

      await fnSignup()

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
          <h2 className="text-xl font-bold text-white tracking-tight">Signup</h2>
          <p className="text-xs text-slate-400 mt-1">Create a new account if you haven&apos;t already</p>
          {error && <div className="mt-2"><Error message={error.message} /></div>}
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="p-0 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="signup-name"
                  name="name"
                  type="text"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-auto block w-full pl-10 pr-3.5 py-2.5 bg-[#0F172A] border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-crisp-link focus:ring-1 focus:ring-crisp-link focus-visible:ring-1 focus-visible:ring-crisp-link focus-visible:border-crisp-link transition"
                />
              </div>
              {errors.name && <div className="mt-1"><Error message={errors.name} /></div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="signup-email"
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
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="signup-password"
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
              {errors.password && <div className="mt-1"><Error message={errors.password} /></div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="signup-profile-pic">
                Profile Avatar (Optional)
              </label>
              <div className="flex items-center gap-3 p-2 bg-[#0F172A] border border-slate-700/80 rounded-xl">
                <label
                  htmlFor="signup-profile-pic"
                  className="cursor-pointer inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-[#151D30] hover:bg-[#1E293B] text-slate-200 border border-slate-700 shrink-0 transition"
                >
                  <Image className="h-3.5 w-3.5 mr-1.5 text-slate-300" />
                  Choose File
                </label>
                <Input
                  id="signup-profile-pic"
                  name="profile_pic"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleInputChange}
                />
                <span className={`text-xs truncate ${formData.profile_pic?.name ? 'text-slate-200' : 'text-slate-400'}`}>
                  {formData.profile_pic?.name || "No file chosen"}
                </span>
              </div>
              {errors.profile_pic && <div className="mt-1"><Error message={errors.profile_pic} /></div>}
            </div>
          </CardContent>
          <CardFooter className="p-0 pt-2">
            <Button
              className="w-full h-auto py-2.5 px-4 rounded-xl text-sm font-bold bg-white hover:bg-slate-100 text-[#06080F] shadow-md hover:shadow-lg transition active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? <BeatLoader size={10} color="#06080F" /> : "Create Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Signup
