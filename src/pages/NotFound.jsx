import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle(t('page_not_found', 'Page Not Found'));

  return (
    <div className="flex items-center justify-center h-[60vh] px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated 404 icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <Search className="w-24 h-24 text-red-600/20" />
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                x: [0, 5, -5, 5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 flex items-center justify-center italic font-bold text-6xl text-red-600"
            >
              404
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          {t('page_not_found', 'Page Not Found')}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-500 mb-8 text-lg"
        >
          {t('page_not_found_desc', "The page you are looking for doesn't exist or has been moved.")}
        </motion.p>

        {/* Back home button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            {t('go_back_home', 'Go Back Home')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}