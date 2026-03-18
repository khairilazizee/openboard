"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { deleteAdByAdmin } from "../../../../../../lib/actions";

export function DeleteAdForm({ adId }: { adId: string }) {
  const [isPending] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isPending && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [isPending, isSubmitting]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!confirm("Are you sure you want to delete this ad?")) {
      e.preventDefault();
      return;
    }

    setIsSubmitting(true);
  };

  const isDisabled = isSubmitting || isPending;

  return (
    <form action={deleteAdByAdmin.bind(null, adId)} onSubmit={handleSubmit}>
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
      >
        {isDisabled ? "Deleting..." : "Delete Ad"}
      </button>
    </form>
  );
}
