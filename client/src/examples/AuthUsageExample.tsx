// Example of how to use the new Redux-based auth in components

import { useAuth } from "../hooks/useAuth";

// In your SignUpModal component, you can now use:
const SignUpModalExample = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signUp,
    verifyEmail,
    logout,
    clearError,
  } = useAuth();

  // Example usage:
  const handleSignUp = async (formData: any) => {
    try {
      clearError(); // Clear any previous errors
      const response = await signUp({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        // Handle success - proceed to verification
        console.log("Sign up successful");
      }
    } catch (err) {
      // Error is automatically set in Redux store
      console.error("Sign up failed:", err);
    }
  };

  const handleLogin = async (formData: any) => {
    try {
      clearError();
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // User data is automatically saved to Redux store
        console.log("Login successful, user:", user);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div>
      {/* Your component JSX */}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {isAuthenticated && <div>Welcome {user?.username}!</div>}
    </div>
  );
};

// In Level1Test, you can check authentication like this:
const Level1TestExample = () => {
  const { isAuthenticated } = useAuth();

  const handleSubmit = () => {
    if (isAuthenticated) {
      // User is logged in, proceed with test submission
      console.log("User is authenticated, submitting test");
    } else {
      // Show sign up modal
      console.log("User not authenticated, showing modal");
    }
  };

  return <div>{/* Your component */}</div>;
};
