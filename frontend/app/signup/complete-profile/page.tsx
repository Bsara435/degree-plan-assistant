"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "../../../lib/api";
import { SCHOOLS, MAJORS_BY_SCHOOL } from "../../../lib/constants/majors";

export default function CompleteProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    school: "",
    major: "",
    classification: ""
  });
  const [errors, setErrors] = useState({
    fullName: "",
    school: "",
    major: "",
    classification: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get majors filtered by selected school
  const availableMajors = useMemo(() => {
    if (!formData.school) {
      return [];
    }
    return MAJORS_BY_SCHOOL[formData.school] || [];
  }, [formData.school]);

  // Classification options matching backend enum
  const classifications = [
    "Freshman",
    "Sophomore", 
    "Junior",
    "Senior"
  ];

  // Sanitize input function - allow spaces for full name
  const sanitizeInput = (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, "")
      .replace(/['"]/g, "")
      .replace(/[;]/g, "")
      .slice(0, 255);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle dropdown changes
  const handleDropdownChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Reset major when school changes
      if (field === "school") {
        newData.major = "";
      }
      
      return newData;
    });

    // Clear error when user selects
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Reset errors
    setErrors({ fullName: "", school: "", major: "", classification: "" });

    // Validate inputs
    if (!formData.fullName) {
      setErrors(prev => ({ ...prev, fullName: "Full name is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!formData.school) {
      setErrors(prev => ({ ...prev, school: "School is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!formData.major) {
      setErrors(prev => ({ ...prev, major: "Major is required" }));
      setIsSubmitting(false);
      return;
    }
    if (!formData.classification) {
      setErrors(prev => ({ ...prev, classification: "Classification is required" }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Get userId from localStorage (set during signup)
      const userId = localStorage.getItem('signupUserId');
      if (!userId) {
        throw new Error('User ID not found. Please start the signup process again.');
      }

      // Call backend API to complete profile
      const response = await authAPI.signupStep3(userId, {
        fullName: formData.fullName,
        school: formData.school,
        major: formData.major,
        classification: formData.classification
      });
      
      if (response.success) {
        // Store user data and token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Clear signup data from localStorage
        localStorage.removeItem('signupUserId');
        localStorage.removeItem('signupEmail');
        localStorage.removeItem('signupVerificationComplete');
        
        alert("Profile completed successfully!");
        
        // Redirect to home experience
        router.replace("/home");
      } else {
        throw new Error(response.message || 'Profile completion failed');
      }
      
    } catch (error: any) {
      console.error("Error completing profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error completing profile. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Back Button */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/signup/verify-phone"
          className="inline-flex items-center text-[var(--dark-navy)] hover:text-[var(--primary-blue)] transition-colors duration-200"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      {/* Profile Completion Form */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Title */}
        <h1 className="text-[var(--dark-navy)] text-2xl font-bold mb-2">
          Create your Account
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-sm mb-8">
          Finalise your Account
        </p>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Fullname"
              className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 placeholder-gray-400 ${
                errors.fullName ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* School Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <select
              name="school"
              value={formData.school}
              onChange={(e) => handleDropdownChange('school', e.target.value)}
              className={`w-full pl-12 pr-10 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 appearance-none ${
                errors.school ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            >
              <option value="">School</option>
              {SCHOOLS.map((school, index) => (
                <option key={index} value={school.value}>
                  {school.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {errors.school && (
              <p className="text-red-500 text-sm mt-1">{errors.school}</p>
            )}
          </div>

          {/* Major Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <select
              name="major"
              value={formData.major}
              onChange={(e) => handleDropdownChange('major', e.target.value)}
              disabled={!formData.school}
              className={`w-full pl-12 pr-10 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 appearance-none ${
                errors.major ? 'border-red-500' : 'border-gray-200'
              } ${!formData.school ? 'opacity-50 cursor-not-allowed' : ''}`}
              required
            >
              <option value="">
                {formData.school ? "Major" : "Select a school first"}
              </option>
              {availableMajors.map((major, index) => (
                <option key={index} value={major}>
                  {major}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {errors.major && (
              <p className="text-red-500 text-sm mt-1">{errors.major}</p>
            )}
          </div>

          {/* Classification Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                />
              </svg>
            </div>
            <select
              name="classification"
              value={formData.classification}
              onChange={(e) => handleDropdownChange('classification', e.target.value)}
              className={`w-full pl-12 pr-10 py-4 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent text-gray-900 appearance-none ${
                errors.classification ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            >
              <option value="">Classification</option>
              {classifications.map((classification, index) => (
                <option key={index} value={classification}>
                  {classification}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-[var(--dark-navy)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            {errors.classification && (
              <p className="text-red-500 text-sm mt-1">{errors.classification}</p>
            )}
          </div>

          {/* Finalise Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-xl font-bold transition-colors duration-200 ${
              isSubmitting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-light)] text-white"
            }`}
          >
            {isSubmitting ? "Finalising..." : "Finalise"}
          </button>
        </form>
      </div>
    </div>
  );
}
