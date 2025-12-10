import axios from 'axios';

// Axios instance 생성
const apiClient = axios.create({
  timeout: 20000,
  withCredentials: true,
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 응답 성공 시 공통 로직
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // 응답 에러 시 공통 로직
    console.error('[API Response Error]', error.response?.status, error.response?.data);

    // 전역 에러 처리
    if (error.response?.status === 401) {
      // 인증 에러 - 로그인 모달 열기
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      }
    } else if (error.response?.status === 403) {
      // 권한 에러 - 알림 표시
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-alert', {
            detail: { message: '권한이 없습니다.' },
          })
        );
      }
    } else if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '파일 분석에 실패했습니다.';
      if (typeof window !== 'undefined') {
        if (errorMessage.includes('JSON 응답을 찾을 수 없습니다')) {
          window.dispatchEvent(new CustomEvent('open-file-error-modal'));
        } else {
          window.dispatchEvent(
            new CustomEvent('show-alert', {
              detail: { message: errorMessage },
            })
          );
        }
      }
    } else if (error.response?.status >= 500) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-question-error-modal'));
      }
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('show-alert', {
            detail: { message: '네트워크 오류가 발생했습니다.' },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
