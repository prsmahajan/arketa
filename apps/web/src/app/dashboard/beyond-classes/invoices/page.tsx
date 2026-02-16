'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { FileText } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Create and send professional invoices.
          </p>
          <div className="mt-6">
            <Button>Create Invoice</Button>
          </div>
        </div>
    </div>
  );
}
