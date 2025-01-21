import { InputNumber } from 'antd';

interface InputRangeProps {
  onChange: (value: number | null) => void;
  title?: string;
  value: number;
  className?: string;
  min: number;
  max: number;
  step: number;
}

export function InputRange({ onChange, title, value, className, min, max, step }: InputRangeProps) {
  return (
    <InputNumber
      className={className}
      title={title}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
    />
  );
}
