import LoginInputs from './LoginInputs';
import LoginButton from './LoginButton';
import SignupLink from './SignupLink';
import Divider from './Divider';
import GoogleOAuthButton from './GoogleOAuthButton';

interface LoginFormProps {
  username: string;
  password: string;
  passwordVisible: boolean;
  loading: boolean;
  error: string;
  isFormReady: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordVisibilityToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  username,
  password,
  passwordVisible,
  loading,
  error,
  isFormReady,
  onUsernameChange,
  onPasswordChange,
  onPasswordVisibilityToggle,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-[400px] flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[32px] leading-[38.4px] text-[#1E293B] font-gmarket font-medium">
            로그인
          </p>
          <p className="text-[16px] leading-[19.2px] text-[#64748B] font-medium">
            계정에 로그인하여 AI 면접을 경험해보세요.
          </p>
        </div>
      </div>

      <LoginInputs
        username={username}
        password={password}
        passwordVisible={passwordVisible}
        onUsernameChange={onUsernameChange}
        onPasswordChange={onPasswordChange}
        onPasswordVisibilityToggle={onPasswordVisibilityToggle}
      />

      <LoginButton loading={loading} isFormReady={isFormReady} error={error} />

      <SignupLink />
      <Divider />
      <GoogleOAuthButton />
    </form>
  );
}
