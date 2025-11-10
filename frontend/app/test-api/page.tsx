"use client";

import { useState } from "react";
import { authAPI } from "../../lib/api";

export default function TestAPI() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await authAPI.signupStep1("test@example.com", "testpass123");
      setResult(JSON.stringify(response, null, 2));
    } catch (error: any) {
      setResult(`Error: ${error.message}\n${error.response?.data || ''}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">API Test</h1>
        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Signup API"}
        </button>
        
        {result && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}




