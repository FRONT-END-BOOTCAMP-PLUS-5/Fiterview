name: 🐛 Bug Report
description: 버그 발생 시 사용해주세요.
title: "[BUG] "
labels: [bug]
body:

- type: markdown
  attributes:
  value: "## 🐛 버그 설명\n버그 내용을 명확하게 설명해주세요."

- type: textarea
  id: steps
  attributes:
  label: "🔁 재현 방법"
  description: "버그를 재현할 수 있는 단계들을 알려주세요."
  placeholder: "1. 페이지 이동\n2. 버튼 클릭\n3. 오류 발생"
  validations:
  required: true

- type: input
  id: expected
  attributes:
  label: "🧠 기대 동작"
  placeholder: "예: 로그인 후 대시보드로 이동"

- type: textarea
  id: logs
  attributes:
  label: "📸 스크린샷 / 로그"
  description: "가능하다면 로그 또는 스크린샷 첨부"
