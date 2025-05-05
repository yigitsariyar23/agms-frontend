import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MenuIcon, X } from "lucide-react"
import { useState } from "react"

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

  return (
    <header className={cn("w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            {/* Logo can be added here */}
            <span className="font-bold text-xl">AGMS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavItem href="/dashboard" title="Dashboard" />
          <NavItem href="/dashboard/students" title="Students" />
          <NavItem href="/dashboard/courses" title="Courses" />
          <NavItem href="/dashboard/reports" title="Reports" />
        </nav>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <span className="sr-only">Profile</span>
                  <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    U
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
      {mobileMenuOpen && (
        <div className="md:hidden py-4 container border-t">
          <nav className="flex flex-col space-y-4">
            <NavItem href="/dashboard" title="Dashboard" />
            <NavItem href="/dashboard/students" title="Students" />
            <NavItem href="/dashboard/courses" title="Courses" />
            <NavItem href="/dashboard/reports" title="Reports" />
            <div className="pt-2">
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2 h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                  U
                </span>
                <span>Profile</span>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
