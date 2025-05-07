import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/auth-context"
import Image from "next/image"
import { useUser } from "@/lib/contexts/user-context";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, confirmLogout } = useAuth();
  const { userProfile } = useUser();

  return (
    <header className={cn("w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Logo and AGMS */}
        <div className="flex items-center px-6 gap-2">
          <Link href="/" className="flex items-center space-x-6 hover:cursor-pointer">
            <Image src="/iyte-logo.png" alt="IYTE Logo" className="h-12 w-12 object-contain" width={360} height={360} />
            <span className="font-bold text-xl">AGMS</span>
          </Link>
        </div>

        {/* Right: Username and Logout */}
        <div className="flex items-center gap-4 translate-x-36">
          {user && (
            <>
              <div className="flex flex-col items-end">
                <span className="font-medium">{userProfile?.firstname} {userProfile?.lastname}</span>
                <span className="text-xs text-muted-foreground">
                  {userProfile?.role ? userProfile.role.replace('ROLE_', '').charAt(0).toUpperCase() + userProfile.role.replace('ROLE_', '').slice(1).toLowerCase() : ''}
                </span>
              </div>
              <Button onClick={confirmLogout} className="hover:cursor-pointer">Log Out</Button>
              <LogoutConfirmDialog />
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
