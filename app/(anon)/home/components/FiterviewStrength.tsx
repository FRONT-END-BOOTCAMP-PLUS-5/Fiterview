'use client';

import { motion } from 'framer-motion';
import Brain from '@/public/assets/icons/brain.svg';
import Chat from '@/public/assets/icons/message-circle.svg';
import Target from '@/public/assets/icons/target.svg';

export default function FiterviewStrength() {
  return (
    <div className="w-full px-[120px] py-20 bg-[#F8FAFC] inline-flex flex-col justify-center items-center gap-12">
      <motion.div
        className="self-stretch flex flex-col justify-start items-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-[#1E293B] text-[32px] font-bold leading-10">
          왜 핏터뷰를 선택해야 할까요?
        </h2>
      </motion.div>

      <div className="w-full flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StrengthCard
            icon={<Brain width={28} height={28} stroke="#475569" strokeWidth={2.33} />}
            title="종합 AI 분석"
            description={
              <>
                포트폴리오와 채용공고를 함께 분석하여 <br />
                정확하고 맞춤화된 면접 질문을 생성합니다
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StrengthCard
            icon={<Chat width={28} height={28} stroke="#3B82F6" opacity={0.7} strokeWidth={2.33} />}
            title="실시간 피드백"
            description={
              <>
                답변에 대한 피드백과 개선점을 제공하여
                <br />
                면접 실력을 향상시킵니다
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 1.4,
            delay: 1.4,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StrengthCard
            icon={<Target width={28} height={28} stroke="#3B82F6" strokeWidth={2.33} />}
            title="실전 같은 연습"
            description={
              <>실제 면접 환경과 유사한 조건에서 연습하여 본 면접에서의 긴장감을 줄입니다</>
            }
          />
        </motion.div>
      </div>
    </div>
  );
}

function StrengthCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <motion.div
      className="w-[360px] p-8 rounded-[16px] flex flex-col items-start gap-5 bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
      whileHover={{
        y: -8,
        transition: { duration: 0.6, type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      <div className={`w-14 h-14 bg-[#F8FAFC] rounded-[12px] flex justify-center items-center`}>
        {icon}
      </div>
      <div className="flex flex-col gap-3">
        <motion.p
          className="text-[#1E293B] text-[20px] font-semibold leading-tight"
          whileHover={{
            color: '#3B82F6',
            transition: { duration: 0.2 },
          }}
        >
          {title}
        </motion.p>
        <p className="text-[#64748B] text-[16px] leading-snug">{description}</p>
      </div>
    </motion.div>
  );
}
