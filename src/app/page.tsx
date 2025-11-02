"use client";

import { SignedIn, SignedOut, SignIn, SignInButton, SignOutButton } from "@clerk/nextjs"

const Homepage = () => {
  return (
    <div>
       <SignedOut>
        <SignInButton/>
        </SignedOut> 

      <SignedIn>
        <SignOutButton/>
        </SignedIn>    
        </div>
  )
}

export default Homepage