import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MenuIcon, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import Image from "next/image"

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
            <Image src="/iyte-logo.png" alt="IYTE Logo" className="h-8 w-8 object-contain" width={32} height={32} />
            <span className="font-bold text-xl">AGMS</span>
          </Link>
        </div>

        {/* Right: Username and Logout */}
        <div className="flex items-center gap-4 translate-x-36">
          {user && (
            <>
              <div className="flex flex-col items-end">
                <span className="font-medium">{user.firstName} {user.lastName}</span>
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
