'use client';

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  showPassword?: () => void;
}
export default function Input({
  type,
  placeholder,
  value,
  name,
  onChange,
  icon,
  showPassword,
}: InputProps) {
  return (
    <div className="w-full flex py-[12px] px-[16px] bg-[#F8FAFC] justify-center rounded-[8px] border border-[#CBD5E1]">
      <input
        required
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="focus:outline-none bg-[#F8FAFC] text-[16px] font-normal text-[#1E293B] placeholder:text-[#94A3B8] w-full"
      />
      {icon && <div onClick={showPassword}>{icon}</div>}
    </div>
  );
}
