/** AuthField.tsx — the luxury animated input field used by all auth forms. */
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  multiline?: boolean;
};

type AuthFieldProps = BaseProps &
  (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>);

export function AuthField({ label, multiline = false, className, ...props }: AuthFieldProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const shared = cn(
    "peer w-full border-0 bg-transparent px-4 pb-3 pt-7 text-sm font-medium text-foreground outline-none placeholder:text-transparent",
    multiline ? "min-h-32 resize-none" : "h-14",
    className,
  );

  return (
    <div className="luxury-field group relative overflow-hidden border border-border/90 bg-background/65 shadow-deep transition-[border-color,box-shadow,transform] duration-300 focus-within:-translate-y-0.5 focus-within:border-gold/75 focus-within:shadow-gold">
      {multiline ? (
        <textarea id={id} placeholder={label} className={shared} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={id} placeholder={label} className={shared} {...(props as InputHTMLAttributes<HTMLInputElement>)} />
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