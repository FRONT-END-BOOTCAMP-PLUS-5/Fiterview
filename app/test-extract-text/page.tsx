'use client';

import { useState } from 'react';

interface ExtractedResult {
  fileName: string;
  extractedText: string;
  fileSize: number;
  success: boolean;
  error?: string;
}

export default function TestExtractTextPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ExtractedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      // 이미지와 PDF 파일 필터링
      const supportedFiles = selectedFiles.filter((file) => {
        const extension = file.name.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'pdf'].includes(extension || '');
      });

      if (supportedFiles.length !== selectedFiles.length) {
        setError('지원하지 않는 파일이 포함되어 있습니다. JPG, PNG, PDF 파일만 선택해주세요.');
      } else {
        setError('');
      }

      setFiles(supportedFiles);
      setResults([]);
    }
  };

  const handleExtractText = async () => {
    if (files.length === 0) {
      setError('파일을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    const newResults: ExtractedResult[] = [];

    try {
      // 각 파일을 순차적으로 처리
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // 파일을 FormData로 변환
          const formData = new FormData();
          formData.append('file', file);

          // API 호출
          const response = await fetch('/api/extract-text', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          newResults.push({
            fileName: result.fileName,
            extractedText: result.extractedText,
            fileSize: result.fileSize,
            success: true,
          });
        } catch (err) {
          newResults.push({
            fileName: file.name,
            extractedText: '',
            fileSize: file.size,
            success: false,
            error: err instanceof Error ? err.message : '알 수 없는 오류',
          });
        }

        // 진행 상황 업데이트
        setResults([...newResults]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '텍스트 추출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setResults([]);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">텍스트 추출 테스트</h1>

          {/* 파일 업로드 섹션 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              파일 선택 (JPG, PNG, PDF) - 여러 개 선택 가능
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={handleExtractText}
                disabled={files.length === 0 || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '추출 중...' : '텍스트 추출'}
              </button>
              {files.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  모두 지우기
                </button>
              )}
            </div>

            {/* 선택된 파일 목록 */}
            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  선택된 파일 ({files.length}개)
                </h3>
                <div className="space-y-2">
                  {files.map((file, index) => {
                    const extension = file.name.toLowerCase().split('.').pop();
                    const isImage = ['jpg', 'jpeg', 'png'].includes(extension || '');
                    const isPdf = extension === 'pdf';

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {isImage && (
                              <svg
                                className="w-5 h-5 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {isPdf && (
                              <svg
                                className="w-5 h-5 text-red-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(2)} KB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          제거
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* 추출된 텍스트 결과 */}
          {results.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                추출 결과 ({results.filter((r) => r.success).length}/{results.length} 성공)
              </h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                    <div className={`px-4 py-3 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const extension = result.fileName.toLowerCase().split('.').pop();
                            const isImage = ['jpg', 'jpeg', 'png'].includes(extension || '');
                            const isPdf = extension === 'pdf';

                            return (
                              <>
                                {isImage && (
                                  <svg
                                    className="w-4 h-4 text-blue-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                {isPdf && (
                                  <svg
                                    className="w-4 h-4 text-red-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                                <h3 className="font-medium text-gray-900">{result.fileName}</h3>
                              </>
                            );
                          })()}
                        </div>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            result.success
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {result.success ? '성공' : '실패'}
                        </span>
                      </div>
                      {!result.success && result.error && (
                        <p className="text-sm text-red-700 mt-1">{result.error}</p>
                      )}
                    </div>
                    {result.success && result.extractedText && (
                      <div className="p-4 bg-gray-50">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono max-h-40 overflow-y-auto">
                          {result.extractedText}
                        </pre>
                        <div className="mt-2 text-sm text-gray-600">
                          텍스트 길이: {result.extractedText.length}자
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 사용법 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">사용법</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• JPG, PNG 이미지 파일과 PDF 파일을 여러 개 선택할 수 있습니다.</li>
              <li>• 이미지 파일은 OCR을 통해 텍스트를 추출합니다.</li>
              <li>• PDF 파일은 페이지별로 텍스트를 추출합니다.</li>
              <li>• 파일을 선택한 후 &quot;텍스트 추출&quot; 버튼을 클릭하세요.</li>
              <li>• 각 파일의 추출 결과가 개별적으로 표시됩니다.</li>
              <li>• 실패한 파일은 에러 메시지와 함께 표시됩니다.</li>
              <li>• 이 기능은 OpenAI GPT-4o를 사용하여 텍스트 추출을 수행합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
