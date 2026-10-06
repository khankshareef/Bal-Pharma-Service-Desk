import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ReusableButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: "primary" | "secondary";
}

const Reusable_Button = ({
  children,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ReusableButtonProps) => {
  const variantStyles = {
    primary: `
      bg-[#003D8C]
      text-white
      hover:bg-[#002F6C]
      active:bg-[#002653]
      focus:ring-[#003D8C]
    `,

    secondary: `
      bg-white
      text-[#003D8C]
      border
      border-[#003D8C]
      hover:bg-[#F0F6FF]
      active:bg-[#E0EDFF]
      focus:ring-[#003D8C]
    `,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        px-5
        py-2
        rounded-lg
        font-medium
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        cursor-pointer
        ${variantStyles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span
            className="
              w-4
              h-4
              border-2
              border-current
              border-t-transparent
              rounded-full
              animate-spin
            "
          />
          Loading...
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Reusable_Button;