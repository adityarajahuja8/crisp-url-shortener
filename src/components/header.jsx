import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { LogOut, LinkIcon, Menu, X } from 'lucide-react'
import { UrlState } from '@/context'
import useFetch from '@/hook/use-fetch'
import { BarLoader } from 'react-spinners'
import { logout } from '@/db/apiAuth'
import CreateLink from './create-link'

const getUserInitial = (user) => {
  const name = user?.user_metadata?.name?.trim();
  const email = user?.email?.trim();
  return (name?.charAt(0) || email?.charAt(0) || "U").toUpperCase();
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nav = useNavigate();

  const { user, fetchUser } = UrlState();
  const { loading, fn: fnLogout } = useFetch(logout);

  const desktopNavLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors py-1 ${isActive
      ? "text-white border-b-2 border-crisp-link"
      : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block text-base font-medium transition-colors py-1.5 ${isActive
      ? "text-white border-b-2 border-crisp-link w-fit"
      : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent w-fit"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-slate-800">
      <div className="container h-16 relative flex items-center justify-between">
        {/* LEFT: existing Crisp logo image, linking to "/" */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/logo.png" className="h-12 w-auto object-contain" alt="Crisp" />
        </Link>

        {/* CENTER: nav links, absolutely centered on the bar (hidden on mobile) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
          <NavLink to="/" end className={desktopNavLinkClass}>
            Home
          </NavLink>

          <NavLink to="/dashboard" end className={desktopNavLinkClass}>
            Dashboard
          </NavLink>

          {user && (
            <CreateLink
              trigger={
                <Button
                  type="button"
                  className="text-sm font-medium text-slate-400 hover:text-slate-200 py-1 border-b-2 border-transparent hover:border-slate-600 transition-colors cursor-pointer bg-crisp-danger text-white hover:bg-[#B91C1C]"
                >
                  Create link
                </Button>
              }
            />
          )}
        </div>

        {/* RIGHT (Desktop): Logged out: Login text link + Sign up button in crisp-link; Logged in: Avatar dropdown */}
        <div className="hidden md:flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/auth"
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Login
              </Link>
              <Button
                size="sm"
                onClick={() => nav("/auth")}
                className="bg-crisp-link text-slate-950 hover:bg-[#4d94ec] text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                Sign up
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="w-10 rounded-full overflow-hidden"
                render={<Button variant="outline" />}
              >
                <Avatar>
                  <AvatarImage
                    src={user?.user_metadata?.profile_pic}
                    alt={user?.user_metadata?.name || user?.email || "User profile"}
                    className="object-contain w-full h-full rounded-full"
                  />
                  <AvatarFallback className="bg-crisp-link text-slate-950 font-semibold">
                    {getUserInitial(user)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user?.user_metadata?.name}</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link to="/dashboard" className="flex">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      My Links
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-crisp-danger">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span
                      onClick={async () => {
                        const result = await fnLogout();
                        if (result === null || loading) return;

                        await fetchUser();
                        nav("/");
                      }}
                    >
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* MOBILE (under 768px): Hamburger button toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN PANEL (below the bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-background/95 backdrop-blur px-4 py-4 space-y-3">
          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            end
            onClick={() => setMobileMenuOpen(false)}
            className={mobileNavLinkClass}
          >
            Dashboard
          </NavLink>

          {user && (
            <CreateLink
              trigger={
                <Button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-400 hover:text-slate-200 py-1.5 border-b-2 border-transparent w-fit transition-colors text-left cursor-pointer bg-crisp-danger text-white hover:bg-[#B91C1C]"
                >
                  Create link
                </Button>
              }
            />
          )}

          {!user ? (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                Login
              </Link>
              <Button
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  nav("/auth");
                }}
                className="w-full bg-crisp-link text-slate-950 hover:bg-[#4d94ec] text-sm font-bold py-2 rounded-lg shadow-sm transition"
              >
                Sign up
              </Button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              {user?.user_metadata?.name && (
                <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {user.user_metadata.name}
                </div>
              )}
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-2 py-2 text-sm text-slate-300 hover:text-white rounded-md hover:bg-slate-800/50 transition-colors"
              >
                <LinkIcon className="mr-2 h-4 w-4 text-slate-400" />
                My Links
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  const result = await fnLogout();
                  if (result === null || loading) return;

                  await fetchUser();
                  nav("/");
                }}
                className="flex w-full items-center px-2 py-2 text-sm text-crisp-danger hover:bg-slate-800/50 rounded-md transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {loading && <BarLoader width={"100%"} color="#60A4F9" />}
    </header>
  )
}

export default Header
