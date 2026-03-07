"use client";

type ConfirmDeleteButtonProps = {
  confirmMessage?: string;
};

export function ConfirmDeleteButton({
  confirmMessage = "Are you sure you want to delete this ad?",
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      className="rounded-full bg-red-500 px-6 py-3 font-medium text-white transition-colors hover:bg-red-600"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
