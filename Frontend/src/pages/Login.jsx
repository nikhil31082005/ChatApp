import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src="https://images.unsplash.com/photo-1633409361618-c73427e4e206"
            alt="Logo"
            className="w-16 h-16 mx-auto mb-4 rounded-full object-cover shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2.5 text-gray-800 hover:bg-gray-100 transition-all shadow-sm"
          onClick={login}>
          <FcGoogle size={20} /> Continue with Google
        </button>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2.5 font-medium hover:bg-blue-700 transition-all shadow-md"
            disabled={loading}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-500">
            Don't have an account?
            <button className="text-blue-600 font-medium ml-1 hover:underline">Sign up</button>
          </p>
          <button className="text-blue-600 font-medium mt-2 hover:underline">Forgot password?</button>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import { useAuth } from "../context/AuthContext";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const { user, login } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) navigate("/dashboard");
//   }, [user, navigate]);

//   return (
//     <div className="text-center mt-10">
//       <h1 className="text-2xl font-bold">Login</h1>
//       <button
//         onClick={login}
//         className="bg-red-500 text-white px-4 py-2 rounded mt-4"
//       >
//         Sign in with Google
//       </button>
//     </div>
//   );
// };

// export default Login;
