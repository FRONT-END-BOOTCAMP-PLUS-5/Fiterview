import SignupInputs from './SignupInputs';
import SignupButton from './SignupButton';

interface SignupFormProps {
  formData: {
    username: string;
    email: string;
    nickname: string;
    password: string;
    confirmPassword: string;
  };
  passwordVisible: boolean;
  confirmPasswordVisible: boolean;
  isUsernameValid: boolean;
  isEmailValid: boolean;
  isPasswordValid: boolean;
  passwordsMatch: boolean;
  serverUsernameDuplicate: boolean;
  serverEmailDuplicate: boolean;
  loading: boolean;
  isFormReady: boolean;
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordVisibilityToggle: () => void;
  onConfirmPasswordVisibilityToggle: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignupForm({
  formData,
  passwordVisible,
  confirmPasswordVisible,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  passwordsMatch,
  serverUsernameDuplicate,
  serverEmailDuplicate,
  loading,
  isFormReady,
  onFormDataChange,
  onPasswordVisibilityToggle,
  onConfirmPasswordVisibilityToggle,
  onSubmit,
}: SignupFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-[400px] flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[32px] leading-[38.4px] text-[#1E293B] font-gmarket font-medium">
            회원가입
          </p>
          <p className="text-[16px] leading-[19.2px] text-[#64748B] font-semibold">
            핏터뷰와 함께하는 스마트한 면접 준비를 시작해보세요.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <SignupInputs
        formData={formData}
        passwordVisible={passwordVisible}
        confirmPasswordVisible={confirmPasswordVisible}
        isUsernameValid={isUsernameValid}
        isEmailValid={isEmailValid}
        isPasswordValid={isPasswordValid}
        passwordsMatch={passwordsMatch}
        serverUsernameDuplicate={serverUsernameDuplicate}
        serverEmailDuplicate={serverEmailDuplicate}
        onFormDataChange={onFormDataChange}
        onPasswordVisibilityToggle={onPasswordVisibilityToggle}
        onConfirmPasswordVisibilityToggle={onConfirmPasswordVisibilityToggle}
      />

      {/* Actions */}
      <SignupButton loading={loading} isFormReady={isFormReady} />
    </form>
  );
}
