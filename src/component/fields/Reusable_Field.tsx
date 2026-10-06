import React, { useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiPaperclip,
  FiPhone,
  FiSearch,
} from "react-icons/fi";

interface SelectOption {
  label: string;
  value: string;
}

interface ReusableFieldProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    "type" | "onChange"
  > {
  label?: string;

  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "phone"
    | "file"
    | "search"
    | "select"
    | "textarea";

  error?: string;
  prefixText?: string;

  options?: SelectOption[];

  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

const Reusable_Field: React.FC<ReusableFieldProps> = ({
  label,
  type = "text",
  error,
  prefixText,
  options = [],
  onChange,
  className = "",
  ...props
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    if (type === "phone") {
      const target = e.target as HTMLInputElement;
      const numericValue = target.value.replace(/\D/g, "");

      target.value = numericValue.slice(0, 10);
    }

    if (type === "file") {
      const target = e.target as HTMLInputElement;

      if (target.files && target.files.length > 0) {
        setFileName(target.files[0].name);
      }
    }

    if (onChange) {
      onChange(e);
    }
  };

  const currentInputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type === "phone"
      ? "tel"
      : type;

  if (type === "search") {
    return (
      <div className={`flex items-center gap-4 w-full group ${className}`}>
        {label && (
          <label className="text-sm font-bold text-gray-600 whitespace-nowrap min-w-[80px] group-focus-within:text-[#003D8C] transition-colors">
            {label}
          </label>
        )}

        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch
              className="text-gray-400 group-focus-within:text-[#003D8C] transition-colors"
              size={18}
            />
          </div>

          <input
            type="text"
            onChange={handleInputChange}
            className={`
              w-full pl-11 pr-4 py-2.5
              bg-gray-100/70 border border-transparent
              rounded-full text-sm font-medium text-gray-800
              placeholder-gray-400 focus:outline-none
              focus:bg-white focus:border-[#003D8C]
              focus:ring-4 focus:ring-[#003D8C]/15
              transition-all duration-300 ease-in-out
              ${error ? "border-red-500 focus:border-red-500" : ""}
            `}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        </div>
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className={`w-full flex flex-col gap-2 ${className}`}>
        {label && (
          <label className="text-sm font-semibold text-gray-700">
            {label}
          </label>
        )}

        <div
          className={`
            relative flex items-center justify-center w-full p-5
            border-2 rounded-2xl transition-all duration-300
            ease-out cursor-pointer group
            ${
              fileName
                ? "border-[#003D8C] bg-[#003D8C]/5 shadow-sm"
                : error
                ? "border-red-300 border-dashed bg-red-50/50"
                : "border-gray-300 border-dashed bg-gray-50/50 hover:bg-gray-100 hover:border-gray-400"
            }
          `}
        >
          <input
            type="file"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />

          <div className="flex flex-col items-center gap-2 text-gray-500">
            {fileName ? (
              <FiCheckCircle size={26} className="text-green-500" />
            ) : (
              <FiPaperclip
                size={26}
                className="text-gray-400 group-hover:text-[#003D8C]"
              />
            )}

            <span className="text-sm font-medium text-center">
              {fileName ? (
                <span className="text-[#003D8C] font-semibold block truncate max-w-[200px]">
                  {fileName}
                </span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[#003D8C] font-semibold">
                    Drop files here or click to upload
                  </span>
                  <span>PDF, PNG, JPG up to 5MB</span>
                </div>
              )}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1.5">
            <FiAlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full group pt-2 ${className}`}>
      {label && (
        <label
          className={`
            absolute -top-1 left-3 px-1.5 text-sm font-medium
            bg-white z-10 transition-colors duration-300
            pointer-events-none
            ${
              error
                ? "text-red-500"
                : "text-gray-500 group-focus-within:text-[#003D8C]"
            }
          `}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {type === "phone" && (
          <div className="absolute left-3 flex items-center pointer-events-none z-10">
            <FiPhone
              className={`${
                error
                  ? "text-red-400"
                  : "text-gray-400 group-focus-within:text-[#003D8C]"
              }`}
              size={18}
            />
          </div>
        )}

        {prefixText && type !== "phone" && type !== "select" && type !== "textarea" && (
          <div className="absolute left-3 flex items-center pointer-events-none z-10">
            <span
              className={`text-base font-medium ${
                error
                  ? "text-red-400"
                  : "text-gray-500 group-focus-within:text-[#003D8C]"
              }`}
            >
              {prefixText}
            </span>
          </div>
        )}

        {type === "select" ? (
          <>
            <select
              value={props.value as string}
              onChange={handleInputChange}
              className={`
                appearance-none w-full py-3
                bg-transparent border-2
                rounded-lg text-sm font-medium text-gray-800
                focus:outline-none transition-all duration-300
                pl-4 pr-10 cursor-pointer
                ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#003D8C]"
                }
              `}
              {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="absolute right-4 flex items-center pointer-events-none z-10">
              {error ? (
                <FiAlertCircle className="text-red-500" size={18} />
              ) : (
                <FiChevronDown
                  className="text-gray-400 group-focus-within:text-[#003D8C]"
                  size={20}
                />
              )}
            </div>
          </>
        ) : type === "textarea" ? (
          <>
            <textarea
              onChange={handleInputChange}
              rows={4} 
              className={`
                w-full py-3 pl-4 pr-10
                bg-transparent border-2
                rounded-lg text-sm font-medium text-gray-800
                placeholder-gray-400 resize-y min-h-[100px]
                focus:outline-none transition-all duration-300
                ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#003D8C]"
                }
              `}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
            {error && (
              <div className="absolute top-4 right-4 flex items-center pointer-events-none z-10">
                <FiAlertCircle className="text-red-500" size={18} />
              </div>
            )}
          </>
        ) : (
          <>
            <input
              type={currentInputType}
              onChange={handleInputChange}
              className={`
                w-full py-3
                bg-transparent border-2
                rounded-lg text-sm font-medium text-gray-800
                placeholder-gray-400
                focus:outline-none transition-all duration-300
                ${type === "phone" || prefixText ? "pl-9" : "pl-4"}
                ${type === "password" ? "pr-12" : "pr-10"}
                ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 hover:border-gray-400 focus:border-[#003D8C]"
                }
              `}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />

            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="
                  absolute right-3 p-1
                  flex items-center justify-center
                  z-10 rounded-full
                  hover:bg-gray-100
                  text-gray-400
                  hover:text-[#003D8C]
                "
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            )}

            {error && (
              <div
                className={`absolute flex items-center pointer-events-none z-10 ${
                  type === "password" ? "right-10" : "right-4"
                }`}
              >
                <FiAlertCircle className="text-red-500" size={18} />
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500 mt-1 flex items-center gap-1.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default Reusable_Field;