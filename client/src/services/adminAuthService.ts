import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Admin login
export const loginAdmin = async (email: string, password: string) => {
    const response = await axios.post(
        `${API_URL}/api/admin/auth/login`,
        { email, password },
        { withCredentials: true }
    );
    return response.data;
};

// Admin logout
export const logoutAdmin = async () => {
    const response = await axios.post(
        `${API_URL}/admin/auth/logout`,
        {},
        { withCredentials: true }
    );
    return response.data;
};

// Get current admin
export const getCurrentAdmin = async () => {
    const response = await axios.get(`${API_URL}/api/admin/auth/me`, {
        withCredentials: true
    });
    return response.data;
};
