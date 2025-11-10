import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--dark-navy)] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/Project Assets/logo-cle-white.png"
          alt="DegreePlan.AI Logo"
          width={120}
          height={120}
          priority
          className="mx-auto"
        />
      </div>

      {/* Welcome Message */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl md:text-3xl font-light leading-tight">
          Welcome to<br />
          <span className="font-semibold">DegreePlan.AI</span>
        </h1>
      </div>

      {/* Auth Buttons */}
      <div className="w-full max-w-sm space-y-4">
        {/* Log in Button - Dark Purple */}
        <Link
          href="/login"
          className="w-full bg-[#6B46C1] hover:bg-[#7C3AED] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
        >
          Log in
        </Link>

        {/* Sign up Button - Light Gray */}
        <Link
          href="/signup/create-account"
          className="w-full bg-[var(--light-gray)] hover:bg-[#9CA3AF] text-[#6B7280] font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
        >
          Sign up
        </Link>

        {/* Continue with Outlook Button - Primary Blue */}
        <Link
          href="/auth/outlook"
          className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
        >
          Continue With Outlook
        </Link>
      </div>
    </div>
  );
}