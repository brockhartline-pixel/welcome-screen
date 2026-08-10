"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
  formAction,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
  formAction?: (formData: FormData) => void;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
