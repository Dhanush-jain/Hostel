"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        // 🔐 Login
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("✅ Logged in successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => router.push("/about"), 1000);
      } else {
        // 🆕 Register
        if (password !== confirm) {
          toast.error("❌ Passwords do not match!", {
            position: "top-center",
            autoClose: 2000,
          });
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("🎉 Account created successfully!", {
          position: "top-center",
          autoClose: 2000,
        });
        setTimeout(() => router.push("/about"), 1000);
      }
    } catch (error) {
      if (error.code === "auth/wrong-password") {
        toast.error("❌ Incorrect password. Please try again.", {
          position: "top-center",
          autoClose: 2000,
        });
      } else if (error.code === "auth/user-not-found") {
        toast.error("⚠️ No account found with this email.", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        toast.error(`⚠️ ${error.message}`, {
          position: "top-center",
          autoClose: 2000,
        });
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/IMG_2162.JPG')",
      }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-center text-white mb-6 drop-shadow-lg">
          {isLogin ? "Welcome Back " : "Create an Account ✨"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-indigo-600/80 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700/90 transition"
          >
            {isLogin ? "Login" : "Register"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-200 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white font-semibold ml-1 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </motion.div>

      {/* ✅ Toast container — now centered */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
