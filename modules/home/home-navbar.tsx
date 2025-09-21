import { SignInButton } from "@/components/buttons/signin-button";
import ArriveSoonLogo from "../../components/Logo"

export function Navbar() {
  return (
    <nav className="top-0 sticky ">
      <ArriveSoonLogo />
      <SignInButton />
    </nav>
  );
}
