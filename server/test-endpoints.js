// Simple test script to verify server endpoints
const baseUrl = 'http://localhost:5000';

// Test data
const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    password: 'password123',
    confirmPassword: 'password123'
};

// Test functions
async function testHealthEndpoint() {
    try {
        const response = await fetch(`${baseUrl}/api/health`);
        const data = await response.json();
        console.log('✅ Health endpoint test:', data);
    } catch (error) {
        console.error('❌ Health endpoint error:', error);
    }
}

async function testSignUpEndpoint() {
    try {
        const response = await fetch(`${baseUrl}/api/auth/sign-up`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });
        const data = await response.json();
        console.log('📝 SignUp endpoint test:', response.status, data);
    } catch (error) {
        console.error('❌ SignUp endpoint error:', error);
    }
}

// Run tests
console.log('🧪 Testing LifeScore Server Endpoints...\n');

testHealthEndpoint();
setTimeout(() => {
    testSignUpEndpoint();
}, 1000);

console.log('\n💡 Note: SignUp will fail because MongoDB is not connected, but it should return a proper error response.');
