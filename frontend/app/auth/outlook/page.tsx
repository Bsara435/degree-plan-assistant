import Link from "next/link";
import Image from "next/image";

export default function OutlookAuth() {
  return (
    <div className="min-h-screen bg-[var(--dark-navy)] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <Image
          src="/Project Assets/logo-cle-white.png"
          alt="DegreePlan.AI Logo"
          width={80}
          height={80}
          priority
          className="mx-auto"
        />
      </div>

      {/* Outlook Auth Content */}
      <div className="w-full max-w-md text-center">
        <h1 className="text-white text-2xl font-semibold mb-4">
          Continue with Outlook
        </h1>
        
        <p className="text-gray-300 mb-8">
          Sign in with your AUI Outlook account to get started
        </p>

        {/* Outlook Sign In Button */}
        <button className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 mb-6">
          Sign in with Outlook
        </button>

        {/* Alternative Options */}
        <div className="space-y-3 mb-8">
          <Link
            href="/login"
            className="block w-full bg-[#6B46C1] hover:bg-[#7C3AED] text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Use Email Instead
          </Link>
          
          <Link
            href="/signup/role"
            className="block w-full bg-[var(--light-gray)] hover:bg-[#9CA3AF] text-[#6B7280] font-medium py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Create New Account
          </Link>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link
            href="/"
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}




