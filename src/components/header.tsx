import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MenuIcon, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"

interface NavItemProps {
  href: string
  title: string
  active?: boolean
}

const NavItem = ({ href, title, active }: NavItemProps) => {
  return (
    <Link 
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary/80",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      {title}
    </Link>
  )
}

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth();

  return (
    <header className={cn("w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo and AGMS */}
        <div className="flex items-center px-6 gap-2">
          <Link href="/" className="flex items-center space-x-6 hover:cursor-pointer">
            <img src="/iyte-logo.png" alt="IYTE Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-xl">AGMS</span>
          </Link>
        </div>

        {/* Right: Username and Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex flex-col items-end">
                <span className="font-medium hover:cursor-pointer">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}</span>
              </div>
              <Button onClick={logout} className="hover:cursor-pointer">Log Out</Button>
            </>
          )}
        </div>


        


        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      
    </header>
  )
}

export default Header
