-- Split user_answer into raw (STT 원본) + clean (후처리본)
ALTER TABLE "questions" ADD COLUMN "user_answer_raw" TEXT;
ALTER TABLE "questions" ADD COLUMN "user_answer_clean" TEXT;

-- 기존 user_answer 값은 분리 이전 데이터라 raw/clean 구분이 없으므로 양쪽 모두에 복사한다.
UPDATE "questions"
SET "user_answer_raw" = "user_answer",
    "user_answer_clean" = "user_answer"
WHERE "user_answer" IS NOT NULL;

ALTER TABLE "questions" DROP COLUMN "user_answer";
