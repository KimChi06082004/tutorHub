// Test script để kiểm tra backend API
import axios from 'axios';

const testEmail = 'test@example.com';

console.log('🧪 Testing backend API...');
console.log('Email:', testEmail);

try {
  const response = await axios.post('http://localhost:8080/api/auth/send-otp', {
    email: testEmail
  });
  
  console.log('✅ Success:', response.data);
} catch (error) {
  console.error('❌ Error:', error.response?.data || error.message);
  console.error('Status:', error.response?.status);
  console.error('Full error:', error);
}
