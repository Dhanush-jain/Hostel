"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
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
        // 🔐 LOGIN
        await signInWithEmailAndPassword(auth, email, password);

        toast.success("✅ Logged in successfully!");

        setTimeout(() => router.push("/dashboard"), 1000);

      } else {
        // 🆕 REGISTER
        if (password !== confirm) {
          toast.error("❌ Passwords do not match!");
          return;
        }

        // 1️⃣ Create user in Firebase Auth
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCred.user;

        // 2️⃣ Save name in Firebase Auth (displayName)
        await updateProfile(user, {
          displayName: name,
        });

        // 3️⃣ Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          phone:"",
          room: "",
          profilePic: "",
          createdAt: new Date(),
        });

        toast.success("🎉 Account created successfully!");

        setTimeout(() => router.push("/dashboard"), 1000);
      }
    } catch (error) {
      console.log("Auth Error:", error);

      if (error.code === "auth/wrong-password") {
        toast.error("❌ Incorrect password");
      } else if (error.code === "auth/user-not-found") {
        toast.error("⚠️ No account found");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("⚠️ Email already in use");
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/IMG_2162.JPG')" }}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
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
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg"
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
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg"
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
              className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg"
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
                className="w-full px-4 py-2 bg-white/20 text-white placeholder-gray-200 border border-white/30 rounded-lg"
              />
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-indigo-600/80 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700/90"
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

      <ToastContainer theme="colored" position="top-center" autoClose={2000} />
    </div>
  );
}
