'use client';

import { motion } from 'framer-motion';
import ArrowRight from '@/public/assets/icons/arrow-right.svg';

export default function FiterviewPrepare() {
  return (
    <div className="px-[120px] self-stretch py-20 bg-white inline-flex flex-col justify-center items-center gap-12">
      <motion.div
        className="self-stretch flex flex-col justify-start items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="self-stretch text-center justify-start text-[#1E293B] text-[32px] font-bold leading-10">
          3단계로 완성하는 면접 준비
        </div>
        <div className="self-stretch text-center justify-start text-[#64748B] text-lg leading-snug">
          간단한 과정으로 맞춤형 면접 연습을 시작해보세요!
        </div>
      </motion.div>

      <div className="w-full inline-flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.8 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StepCard
            number="1"
            innerBgColor="bg-[#475569]"
            title="자료 분석"
            description={
              <>
                포트폴리오와 채용공고를 업로드하면
                <br />
                AI가 종합적으로 분석합니다
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            type: 'spring',
            stiffness: 150,
            damping: 20,
          }}
        >
          <ArrowRight width={24} height={24} stroke="#CBD5E1" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.8 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.8,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StepCard
            number="2"
            innerBgColor="bg-[#3B82F6]/50"
            title="맞춤 질문 생성"
            description={
              <>
                분석 결과를 바탕으로
                <br />
                개인화된 면접 질문을 생성합니다
              </>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 1.2,
            type: 'spring',
            stiffness: 150,
            damping: 20,
          }}
        >
          <ArrowRight width={24} height={24} stroke="#CBD5E1" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30, scale: 0.8 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{
            duration: 0.6,
            delay: 1.4,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
        >
          <StepCard
            number="3"
            innerBgColor="bg-[#3B82F6]"
            title="AI 모의면접"
            description={
              <>
                실제 면접처럼 연습하고
                <br />
                상세한 피드백을 받아보세요
              </>
            }
          />
        </motion.div>
      </div>
    </div>
  );
}

function StepCard({
  number,
  innerBgColor,
  title,
  description,
}: {
  number: string;
  innerBgColor: string;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <motion.div
      className="w-80 flex flex-col items-center gap-5"
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.3, type: 'spring', stiffness: 200 },
      }}
    >
      <motion.div
        className={`w-20 h-20 bg-[#F1F5F9] rounded-[40px] flex justify-center items-center`}
        whileHover={{
          width: '80px',
          height: '80px',
          transition: { duration: 0.4, type: 'spring', stiffness: 200, damping: 25 },
        }}
      >
        <motion.div
          className={`w-14 h-14 ${innerBgColor} rounded-[30px] flex justify-center items-center`}
          whileHover={{
            width: '56px',
            height: '56px',
            opacity: 1,
            transition: { duration: 0.4, type: 'spring', stiffness: 200, damping: 25 },
          }}
        >
          <p className="text-white text-[24px] font-bold leading-7">{number}</p>
        </motion.div>
      </motion.div>
      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-[#1E293B] text-[18px] font-semibold leading-snug">{title}</p>
        <p className="text-center text-[#64748B] text-[14px] leading-tight">{description}</p>
      </div>
    </motion.div>
  );
}
