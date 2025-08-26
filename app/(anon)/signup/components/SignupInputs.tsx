import Input from '@/app/components/Input';
import EyeOff from '@/public/assets/icons/eye-off.svg';

interface SignupInputsProps {
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
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordVisibilityToggle: () => void;
  onConfirmPasswordVisibilityToggle: () => void;
}

export default function SignupInputs({
  formData,
  passwordVisible,
  confirmPasswordVisible,
  isUsernameValid,
  isEmailValid,
  isPasswordValid,
  passwordsMatch,
  serverUsernameDuplicate,
  serverEmailDuplicate,
  onFormDataChange,
  onPasswordVisibilityToggle,
  onConfirmPasswordVisibilityToggle,
}: SignupInputsProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Username */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">아이디</p>
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            name="username"
            placeholder="아이디를 입력하세요"
            value={formData.username}
            onChange={onFormDataChange}
          />
        </div>
        <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
          {!isUsernameValid ? (
            <p className="text-[#EF4444] text-[12px] leading-[14px]">
              아이디는 영문 또는 숫자만 사용할 수 있습니다.
            </p>
          ) : serverUsernameDuplicate ? (
            <p className="text-[#EF4444] text-[12px] leading-[14px]">
              이미 사용 중인 아이디입니다.
            </p>
          ) : null}
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">비밀번호</p>
        <div className="inline-flex">
          <Input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={onFormDataChange}
            icon={<EyeOff />}
            showPassword={onPasswordVisibilityToggle}
          />
        </div>
        <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
          {!isPasswordValid ? (
            <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
              비밀번호는 8자 이상, 영문/숫자/특수문자를 포함해야 합니다.
            </p>
          ) : null}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">비밀번호 재입력</p>
        <div className="inline-flex">
          <Input
            type={confirmPasswordVisible ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={onFormDataChange}
            icon={<EyeOff />}
            showPassword={onConfirmPasswordVisibilityToggle}
          />
        </div>
        <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
          {!passwordsMatch ? (
            <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
              비밀번호가 일치하지 않습니다.
            </p>
          ) : null}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">이메일</p>
        <div className="inline-flex">
          <Input
            type="email"
            name="email"
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChange={onFormDataChange}
          />
        </div>
        <div className="inline-flex items-center gap-1 px-[10px] min-h-[14.4px]">
          {!isEmailValid ? (
            <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
              이메일 형식이 맞지 않습니다.
            </p>
          ) : serverEmailDuplicate ? (
            <p className="text-[#EF4444] text-[12px] leading-[14.4px]">
              이미 사용 중인 이메일입니다.
            </p>
          ) : null}
        </div>
      </div>

      {/* Nickname */}
      <div className="flex flex-col gap-2">
        <p className="text-[16px] leading-[16.8px] text-[#374151] font-bold">닉네임</p>
        <div className="inline-flex">
          <Input
            type="text"
            name="nickname"
            placeholder="닉네임을 입력하세요"
            value={formData.nickname}
            onChange={onFormDataChange}
          />
        </div>
      </div>
    </div>
  );
}
