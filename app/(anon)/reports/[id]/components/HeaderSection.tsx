'use client';

import { useEffect, useState } from 'react';
import Edit from '@/public/assets/icons/edit.svg';
import X from '@/public/assets/icons/x.svg';
import Check from '@/public/assets/icons/check.svg';

interface HeaderSectionProps {
  reportId: string;
}

export default function HeaderSection({ reportId }: HeaderSectionProps) {
  const [report, setReport] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');

  // DB에서 리포트 데이터 가져오기
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          credentials: 'include',
        });

        const result = await response.json();
        if (result.success) {
          setReport(result.data);
        }
      } catch (error) {
        console.error('💥 API 호출 에러:', error);
      }
    };

    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  // 제목 편집 시작 핸들러
  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditingTitle(report?.title || '');
  };

  // 제목 저장 핸들러
  const handleSaveTitle = async () => {
    if (!reportId || !editingTitle.trim()) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setReport({
            ...report,
            title: result.data.title,
          });
          setIsEditingTitle(false);
          console.log('✅ 제목이 성공적으로 업데이트되었습니다.');
        }
      }
    } catch (error) {
      console.error('💥 제목 업데이트 오류:', error);
    }
  };

  // 제목 편집 취소 핸들러
  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setEditingTitle('');
  };

  return (
    <div className="px-16 py-8 bg-slate-50">
      {/* 파일명 헤더 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="self-stretch inline-flex justify-start items-center gap-2">
          {/* 파일명 */}
          {isEditingTitle ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="text-center text-slate-800 text-3xl font-bold leading-normal border-2 border-blue-500 focus:outline-none focus:border-blue-600 px-2 rounded"
              placeholder="제목을 입력하세요"
              style={{ width: `${editingTitle.length + 4}ch` }}
            />
          ) : (
            <div className="text-center text-slate-800 text-3xl font-bold leading-normal flex items-center">
              {report?.title || '제목 없음'}
            </div>
          )}

          {/* 편집 섹션 */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <>
                {/* 저장 버튼 */}
                <div className="cursor-pointer" onClick={handleSaveTitle}>
                  <Check width={20} height={20} strokeWidth={0.5} stroke="#303030" />
                </div>
                {/* 취소 버튼 */}
                <div className="cursor-pointer" onClick={handleCancelTitle}>
                  <X width={20} height={20} strokeWidth={2.3} stroke="#303030" />
                </div>
              </>
            ) : (
              /* 수정버튼 */
              <div className="cursor-pointer" onClick={handleEditTitle}>
                <Edit width={20} height={20} strokeWidth={0.5} stroke="#303030" />
              </div>
            )}
          </div>
        </div>
        <div className="self-stretch justify-start text-slate-500 text-base font-normal leading-tight">
          음성 녹음을 기반으로 생성된 면접 스크립트를 통해 개선점을 제안받으세요
        </div>
      </div>
    </div>
  );
}
