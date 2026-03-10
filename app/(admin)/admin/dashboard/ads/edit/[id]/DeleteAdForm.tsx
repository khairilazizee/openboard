"use client";

import { deleteAdByAdmin } from "../../../../../../lib/actions";

export function DeleteAdForm({ adId }: { adId: string }) {
  return (
    <form
      action={deleteAdByAdmin.bind(null, adId)}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this ad?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="w-full rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
      >
        Delete Ad
      </button>
    </form>
  );
}
