"use client";

import { motion } from "framer-motion";
import type { User } from "@/types/auth";

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-white font-medium">{user.username}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>
      
      <motion.button
        onClick={onLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
      >
        로그아웃
      </motion.button>
    </motion.div>
  );
}
