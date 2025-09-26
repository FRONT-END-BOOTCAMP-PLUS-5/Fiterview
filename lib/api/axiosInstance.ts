import axios from 'axios';

// Axios instance 생성
const apiClient = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 공통 로직 (로딩 상태, 인증 토큰 등)
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

    // 인증 에러 처리
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트 또는 토큰 갱신 로직
      console.warn('Authentication required');
    }

    // 서버 에러 처리
    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
