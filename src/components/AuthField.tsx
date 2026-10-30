/** AuthField.tsx — the luxury animated input field used by all auth forms. */
import { useState, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  multiline?: boolean;
};

type AuthFieldProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type AuthTextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function AuthField(props: AuthFieldProps | AuthTextareaProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const { label, multiline = false, className, ...fieldProps } = props;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = !multiline && "type" in fieldProps && fieldProps.type === "password";
  const inputType =
    isPassword && passwordVisible
      ? "text"
      : !multiline && "type" in fieldProps
        ? fieldProps.type
        : undefined;
  const shared = cn(
    "peer w-full border-0 bg-transparent px-4 pb-3 pt-7 text-sm font-medium text-foreground outline-none placeholder:text-transparent",
    multiline ? "min-h-32 resize-none" : "h-14",
    isPassword && "pr-12",
    className,
  );

  return (
    <div className="luxury-field group relative overflow-hidden border border-border/90 bg-background/65 shadow-deep transition-[border-color,box-shadow,transform] duration-300 focus-within:-translate-y-0.5 focus-within:border-gold/75 focus-within:shadow-gold">
      {multiline ? (
        <textarea
          id={id}
          placeholder={label}
          className={shared}
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)}
          id={id}
          type={inputType}
          placeholder={label}
          className={shared}
        />
      )}
      {isPassword && (
        <button
          type="button"
          onClick={() => setPasswordVisible((visible) => !visible)}
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 p-2 text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {passwordVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2.5 text-[9px] font-semibold uppercase text-muted-foreground transition-all duration-300 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-[11px] peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-gold"
      >
        {label}
      </label>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-focus-within:scale-x-100" />
    </div>
  );
}
