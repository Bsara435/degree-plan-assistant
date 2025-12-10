import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making API request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Signup Step 1: Create account with email and password
  signupStep1: async (email: string, password: string) => {
    const response = await api.post('/auth/signup/step1', {
      email,
      password,
    });
    return response.data;
  },

  // Signup Step 2: Verify confirmation code
  signupStep2: async (userId: string, code: string) => {
    const response = await api.post('/auth/signup/verify', {
      userId,
      code,
    });
    return response.data;
  },

  // Signup Step 3: Complete profile
  signupStep3: async (userId: string, profileData: {
    fullName: string;
    school: string;
    major?: string;
    classification?: string;
  }) => {
    const response = await api.post('/auth/signup/step3', {
      userId,
      ...profileData,
    });
    return response.data;
  },

  // Login Step 1: Login with email and password, get verification code
  loginStep1: async (email: string, password: string) => {
    const response = await api.post('/auth/login/step1', {
      email,
      password,
    });
    return response.data;
  },

  // Login Step 2: Verify login code and get JWT token
  loginStep2: async (userId: string, code: string) => {
    const response = await api.post('/auth/login/verify', {
      userId,
      code,
    });
    return response.data;
  },
};

export const adminAPI = {
  loginStep1: async (adminId: string, password: string) => {
    const response = await api.post("/admin/login/step1", {
      adminId,
      password,
    });
    return response.data;
  },

  loginStep2: async (userId: string, code: string) => {
    const response = await api.post("/admin/login/verify", {
      userId,
      code,
    });
    return response.data;
  },

  listStudents: async () => {
    const response = await api.get("/admin/students");
    return response.data;
  },

  listMentors: async () => {
    const response = await api.get("/admin/mentors");
    return response.data;
  },

  listAdvisors: async () => {
    const response = await api.get("/admin/advisors");
    return response.data;
  },

  promoteStudentToMentor: async (studentId: string) => {
    const response = await api.post(`/admin/students/${studentId}/make-mentor`);
    return response.data;
  },

  assignMentor: async (studentId: string, mentorId: string) => {
    const response = await api.post(`/admin/students/${studentId}/assign-mentor`, {
      mentorId,
    });
    return response.data;
  },

  assignAdvisor: async (studentId: string, advisorId: string) => {
    const response = await api.post(`/admin/students/${studentId}/assign-advisor`, {
      advisorId,
    });
    return response.data;
  },
};

// --- NEW: ADVISING AGENT API ---

export type ApiResponse = {
  success: boolean;
  analysis: string;
}

export const sendAdvisingRequest = async (
  question: string,
  transcriptFile: File // Now accepts a File object
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('question', question);
    formData.append('transcript', transcriptFile); // Key must match backend (e.g., upload.single('transcript'))

    const response = await api.post('/analyze-plan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Explicitly set for file upload
      },
    });
    return response.data.analysis;
  } catch (error) {
    console.error("Advising Request Failed:", error);
    return {
      success: false,
      analysis: "**System Error:** Failed to upload transcript or connect to advisor."
    };
  }
}

export default api;