"use client";

type AdminTablePaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  className?: string;
  /** When false, hide if only one page (articles default). */
  hideWhenSinglePage?: boolean;
  /** Show "{n} {itemLabel}" on the left (default true). */
  showItemCount?: boolean;
};

/**
 * Shared Prev / Next pager — same UI as dashboard articles table.
 */
export default function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemLabel,
  onPageChange,
  className = "",
  hideWhenSinglePage = true,
  showItemCount = true,
}: AdminTablePaginationProps) {
  const pages = Math.max(1, totalPages);

  if (hideWhenSinglePage && pages <= 1) {
    return null;
  }

  return (
    <div
      className={`flex items-center ${
        showItemCount ? "justify-between" : "justify-end"
      } px-4 py-3 border-t border-gray-100 dark:border-[#2a3344] text-sm ${className}`}
    >
      {showItemCount ? (
        <span className="text-gray-500">
          {totalItems} {itemLabel}
        </span>
      ) : (
        <span className="sr-only">
          {totalItems} {itemLabel}
        </span>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2a3344] disabled:opacity-40"
        >
          Prev
        </button>
        <span className="px-2 py-1.5 text-gray-600 dark:text-gray-300">
          {currentPage}/{pages}
        </span>
        <button
          type="button"
          disabled={currentPage >= pages}
          onClick={() => onPageChange(Math.min(pages, currentPage + 1))}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2a3344] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
