'use client';
import { motion } from 'framer-motion';
import Start from '@/public/assets/icons/rocket.svg';
import { useRouter } from 'next/navigation';
import { useSessionUser } from '@/lib/auth/useSessionUser';

export default function FiterviewStart() {
  const router = useRouter();
  const { user } = useSessionUser();

  return (
    <div className="w-full px-28 py-20 bg-[#3B82F6] flex flex-col justify-start items-center gap-8">
      <motion.div
        className="w-full flex flex-col justify-start items-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-center justify-start text-white text-[28px] font-bold"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          지금 바로 면접 준비를 시작하세요
        </motion.h2>
        <motion.p
          className="text-[#C7D2FE] text-[16px] font-normal leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          무료로 첫 번째 맞춤형 면접 질문 세트를 생성해보세요
        </motion.p>
        <motion.button
          className="h-14 px-8 bg-white rounded-[12px] flex justify-center items-center gap-2 cursor-pointer shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.6, type: 'spring', stiffness: 200 }}
          whileHover={{
            scale: 1.05,
            y: -2,
            transition: { duration: 0.2, type: 'spring', stiffness: 400 },
          }}
          whileTap={{
            scale: 0.9,
            y: 1,
            transition: { duration: 0.1, type: 'spring', stiffness: 100 },
          }}
          onClick={
            user
              ? () => window.scrollTo({ top: 0, behavior: 'smooth' })
              : () => router.push('/login')
          }
        >
          <motion.div
            whileHover={{
              rotate: 15,
              transition: { duration: 0.3, type: 'spring', stiffness: 300 },
            }}
          >
            <Start width={20} height={20} stroke="#3B82F6" strokeWidth={1.67} />
          </motion.div>
          <p className="text-[#3B82F6] text-[16px] font-semibold leading-tight">
            {user ? '시작하기' : '로그인하고 시작하기'}
          </p>
        </motion.button>
      </motion.div>
    </div>
  );
}
