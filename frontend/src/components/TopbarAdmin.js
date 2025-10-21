import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/api";

export default function TopbarAdmin() {
  const [adminName, setAdminName] = useState('Admin');
  const [adminRole, setAdminRole] = useState('Quản trị viên');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch admin info when component mounts
    const fetchAdminInfo = async () => {
      if (typeof window === "undefined") return; // Check if on client side
      
      const token = localStorage.getItem("accessToken") || 
                    localStorage.getItem("token") || 
                    localStorage.getItem("authToken");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/admin/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setAdminName(data.data.full_name || 'Admin');
            setAdminRole(data.data.role || 'Quản trị viên');
          }
        }
      } catch (error) {
        console.error('Error fetching admin info:', error);
        // Use default values if API call fails
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken") || 
                    localStorage.getItem("token") || 
                    localStorage.getItem("authToken");
      
      // Call logout API if available
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API fails
    } finally {
      // Clear all tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      
      // Redirect to login
      router.push('/login');
    }
  };

  return (
    <header className="w-full bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="text-lg font-semibold text-gray-800">Admin Dashboard</div>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
            <div className="text-sm text-gray-500">Đang tải...</div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-800">{adminName}</span>
              <span className="text-xs text-gray-500">{adminRole}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded transition-colors duration-200"
            >
              Đăng xuất
            </button>
          </>
        )}
      </div>
    </header>
  );
}
