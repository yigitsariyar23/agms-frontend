import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/contexts/auth-context"
import Image from "next/image"
import { useUser } from "@/lib/contexts/user-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Add Avatar component
function UserAvatar({ firstName, lastName }: { firstName?: string; lastName?: string }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
      {initials}
    </div>
  )
}

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const { user, logout, confirmLogout } = useAuth();
  const { userProfile } = useUser();

  return (
    <header className={cn("w-full border-b bg-background sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left: Logo and AGMS */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-6 hover:cursor-pointer">
            <Image src="/iyte-logo.png" alt="IYTE Logo" className="h-8 w-8 sm:h-12 sm:w-12 object-contain" width={360} height={360} />
            <span className="font-bold text-lg sm:text-xl">AGMS</span>
          </Link>
        </div>

        {/* Right: User Avatar, Name and Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-3">
                <UserAvatar firstName={userProfile?.firstName} lastName={userProfile?.lastName} />
                <div className="flex flex-col items-end">
                  <span className="font-medium">{userProfile?.firstName} {userProfile?.lastName}</span>
                  <span className="text-xs text-muted-foreground">
                    {userProfile?.role ? userProfile.role.replace('ROLE_', '').charAt(0).toUpperCase() + userProfile.role.replace('ROLE_', '').slice(1).toLowerCase() : ''}
                  </span>
                </div>
              </div>
              <div className="sm:hidden">
                <UserAvatar firstName={userProfile?.firstName} lastName={userProfile?.lastName} />
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:cursor-pointer">Log Out</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-lg sm:rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
                  <DialogHeader className="space-y-2 sm:space-y-3">
                    <DialogTitle className="text-lg sm:text-xl">Confirm Logout</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                      Are you sure you want to log out of your account? You will need to log in again to access your dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <DialogTrigger asChild className="w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto order-2 sm:order-1"
                      >
                        Cancel
                      </Button>
                    </DialogTrigger>
                    <Button 
                      variant="destructive" 
                      onClick={() => logout()}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      Log Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
