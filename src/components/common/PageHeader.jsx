import React from "react";
import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle }) {
  return (
    <motion.div 
      className="text-center mb-10 md:mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter hebrew-font text-gray-900">
        <span className="block text-gradient">
          {title}
        </span>
      </h1>
      {subtitle && (
        <p className="mt-4 text-lg text-gray-600 hebrew-font max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}