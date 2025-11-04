"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { DumbbellIcon, HomeIcon, UserIcon} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-md border-b border-border py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src={"/corpus-logo.png"}
            alt="Corpus AI Logo"
          
            className="w-16 sm:w-28 object-contain"
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-2 sm:gap-5">
          {isSignedIn ? (
            <>
            
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <HomeIcon size={16} />
                <span className="hidden md:inline">Home</span> 
              </Link>

            
              <Link
                href="/generate-program"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <DumbbellIcon size={16} />
                <span className="hidden md:inline">Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
              >
                <UserIcon size={16} />
                <span className="hidden md:inline">Profile</span> 
              </Link>

             
              <Button
                asChild
                variant="outline"
              
                className="ml-2 border-primary/50 text-primary hover:text-white hover:bg-primary/10 h-7 px-3 text-xs md:h-9 md:px-4 md:text-sm"
              >
                <Link href="/generate-program">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span> 
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
            
              <SignInButton>
                <Button
                  variant={"outline"}
                  className="border-primary/50 text-primary hover:text-white hover:bg-primary/10 h-7 px-3 text-xs md:h-9 md:px-4 md:text-sm"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-3 text-xs md:h-9 md:px-4 md:text-sm">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;