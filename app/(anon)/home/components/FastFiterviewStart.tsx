'use client';

import { motion } from 'framer-motion';
import InterviewForm from '@/app/(anon)/home/components/quick/InterviewFrom';

export default function FastFiterviewStart() {
  return (
    <section className="relative px-[120px] py-[80px] flex flex-col w-full text-center gap-4 items-center overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-200 to-blue-600"
          animate={{
            background: [
              'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #e0e7ff 100%)',
              'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #e0e7ff 100%)',
              'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 50%, #e0e7ff 100%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-blue-100/60 rounded-full blur-xl"
          animate={{
            y: [0, -40, 20, 0],
            x: [0, 25, -15, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute top-40 right-32 w-24 h-24  bg-indigo-200/30 rounded-full blur-xl"
          animate={{
            y: [0, 35, -25, 0],
            x: [0, -30, 20, 0],
            scale: [1, 1.3, 1.8, 1.3, 1],
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        <motion.div
          className="absolute bottom-32 left-40 w-20 h-20 bg-blue-200/60 rounded-full blur-xl"
          animate={{
            y: [0, -45, 30, 0],
            x: [0, 35, -25, 0],
            scale: [1, 1.5, 1.8, 1.6, 1],
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        <motion.div
          className="absolute bottom-20 right-20 w-28 h-28 bg-indigo-200/40 rounded-full blur-xl"
          animate={{
            y: [0, 50, -35, 0],
            x: [0, -40, 30, 0],
            scale: [1, 0.6, 1.5, 1],
          }}
          transition={{
            duration: 100,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 3,
          }}
        />

        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0 0', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>

      <motion.h1
        className="text-[48px] relative z-10"
        style={{ fontFamily: 'var(--font-gmarket)' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        핏터뷰와 함께하는 맞춤형 면접 준비
      </motion.h1>

      <motion.p
        className="text-[#64748B] text-[18px] leading-relaxed relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        포트폴리오와 채용공고 이미지를 업로드하면 핏터뷰가 맞춤형 면접 질문을 생성하고, <br /> 실제
        면접처럼 연습할 수 있습니다.
      </motion.p>

      <motion.article
        className="w-[700px] p-8 bg-white/80 rounded-[16px] flex flex-col relative z-10 shadow-lg border border-white/20"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          delay: 0.8,
          type: 'spring',
          stiffness: 120,
          damping: 30,
        }}
      >
        <InterviewForm />
      </motion.article>
    </section>
  );
}
