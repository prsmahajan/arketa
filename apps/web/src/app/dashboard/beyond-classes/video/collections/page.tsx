'use client';

import { 
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui';

export default function CollectionsPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full bg-white">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <Folder className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Curate video collections
      </h3>
      
      <p className="text-gray-500 max-w-md mb-8">
        Group videos into themed collections -- like a beginner series, weekly challenge, or recovery playlist.
      </p>
      
      <Button className="bg-[#374151] hover:bg-[#4B5563] text-white px-6">
        Add Collection
      </Button>
      
      <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
        <Folder size={16} />
        <span>Video Collections</span>
      </div>
    </div>
  );
}
