'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { Pin } from 'lucide-react';

export default function BulletinBoardPage() {
  return (
    <div className="flex-1 p-6 flex items-center justify-center">
      <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Pin size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Bulletin Board</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Share news and updates with your members.
          </p>
          <div className="mt-6">
            <Button>Create Post</Button>
          </div>
        </div>
    </div>
  );
}
