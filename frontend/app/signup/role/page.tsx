import Link from "next/link";
import Image from "next/image";

export default function RoleSelection() {
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

      {/* Role Selection */}
      <div className="w-full max-w-md">
        <h1 className="text-white text-2xl font-semibold text-center mb-8">
          Select Your Role
        </h1>
        
        <div className="space-y-4">
          {/* Student Role */}
          <Link
            href="/signup/confirm?role=student"
            className="w-full bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            Student
          </Link>

          {/* Peer Mentor Role */}
          <Link
            href="/signup/confirm?role=mentor"
            className="w-full bg-[#6B46C1] hover:bg-[#7C3AED] text-white font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            Peer Mentor
          </Link>

          {/* FYE Instructor Role */}
          <Link
            href="/signup/confirm?role=fye-teacher"
            className="w-full bg-[var(--light-gray)] hover:bg-[#9CA3AF] text-[#6B7280] font-medium py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            FYE Instructor
          </Link>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
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








