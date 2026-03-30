'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

type ClientsPaginationProps = {
  totalClients: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function ClientsPagination({
  totalClients,
  currentPage,
  pageSize,
  onPageChange,
}: ClientsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalClients / pageSize));
  const start = totalClients === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalClients);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2">
      {/* Left: count */}
      <span className="text-xs text-gray-500">
        {totalClients === 0
          ? 'No clients'
          : `Showing ${start} - ${end} out of ${totalClients} clients`}
      </span>

      {/* Right: pagination controls */}
      <div className="flex items-center gap-1">
        <span className="mr-2 text-xs text-gray-500">
          {currentPage} of {totalPages} page
        </span>

        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <input
          type="text"
          value={currentPage}
          readOnly
          className="h-7 w-8 rounded border border-gray-300 bg-white text-center text-xs text-gray-700 focus:outline-none"
        />

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
