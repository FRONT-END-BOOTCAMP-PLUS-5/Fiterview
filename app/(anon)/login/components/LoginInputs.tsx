import Input from '@/app/components/Input';
import EyeOff from '@/public/assets/icons/eye-off.svg';

interface LoginInputsProps {
  username: string;
  password: string;
  passwordVisible: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordVisibilityToggle: () => void;
}

export default function LoginInputs({
  username,
  password,
  passwordVisible,
  onUsernameChange,
  onPasswordChange,
  onPasswordVisibilityToggle,
}: LoginInputsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-[14px] leading-[16.8px] text-[#374151] font-semibold">아이디</p>
        <div className="flex flex-col gap-1">
          <Input
            type="text"
            name="username"
            placeholder="아이디를 입력하세요"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[14px] leading-[16.8px] text-[#374151] font-semibold">비밀번호</p>
        <div className="inline-flex">
          <Input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            icon={<EyeOff />}
            showPassword={onPasswordVisibilityToggle}
          />
        </div>
      </div>
    </div>
  );
}
