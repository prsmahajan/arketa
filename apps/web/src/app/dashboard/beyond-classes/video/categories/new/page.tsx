'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Code,
  Italic,
  Link as LinkIcon,
  Smile,
  Strikethrough,
  Underline,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function isAllowedFile(file: File, allowedExtensions: string[]) {
  return allowedExtensions.includes(getFileExtension(file.name));
}

function PreviewUploadCard({
  onClick,
  onDropFile,
}: {
  onClick: () => void;
  onDropFile: (file: File) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile) onDropFile(droppedFile);
      }}
      className="flex h-[146px] w-[260px] cursor-pointer flex-col items-center justify-center border border-dashed border-[#c4cad3] bg-[#fafbfc] text-center"
    >
      <div className="mb-2 text-6xl leading-none text-[#c8ced8]">↓</div>
      <p className="text-[16px] text-[#23262b]">
        Drop here or <span className="font-medium text-[#3370d4]">upload</span>
      </p>
    </div>
  );
}

export default function NewCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { communityId } = useAuthStore();
  const from = searchParams.get('from');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewImageError, setPreviewImageError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const previewImageInputRef = useRef<HTMLInputElement>(null);

  const goBack = () => {
    if (from) {
      router.push(from);
      return;
    }
    router.push('/dashboard/beyond-classes/video/categories?activeCategoryTab=true');
  };

  const syncDescription = () => {
    const nextHtml = descriptionEditorRef.current?.innerHTML ?? '';
    setDescription(nextHtml);
  };

  const runEditorCommand = (command: string, value?: string) => {
    descriptionEditorRef.current?.focus();
    document.execCommand(command, false, value);
    syncDescription();
  };

  const saveCategory = async () => {
    if (!communityId) {
      setSaveError('Community context is missing. Please refresh and try again.');
      return;
    }

    setSaveError('');
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('video_categories').insert({
        community_id: communityId,
        name: name.trim() || 'Untitled Category',
        description,
        featured,
        hidden,
        preview_image_name: previewImage?.name ?? null,
      });

      if (error) throw error;
      goBack();
    } catch (error) {
      console.error(error);
      setSaveError('Failed to save category. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-[980px] px-8 py-8">
        <Button variant="outline" onClick={goBack} className="mb-8 h-16 rounded-2xl border-[#d0d5dd] px-8">
          <ArrowLeft className="mr-2 h-6 w-6" />
          <span className="text-[16px]">Back</span>
        </Button>

        <div className="space-y-7">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2f3640]">Name</label>
            <Input
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-14 rounded-2xl border-[#cfd4dc] px-4 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2f3640]">Description</label>
            <div className="overflow-hidden rounded-2xl border border-[#cfd4dc] bg-white">
              <div className="flex items-center gap-0.5 border-b border-[#e5e7eb] px-4 py-3 text-[#6b7280]">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('bold')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Bold size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('italic')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Italic size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('underline')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Underline size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('strikeThrough')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Strikethrough size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('formatBlock', '<pre>')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Code size={22} /></button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    const url = window.prompt('Enter URL');
                    if (url) runEditorCommand('createLink', url);
                  }}
                  className="rounded p-1.5 hover:bg-[#f2f4f7]"
                >
                  <LinkIcon size={22} />
                </button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyLeft')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignLeft size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyCenter')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignCenter size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyRight')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignRight size={22} /></button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyFull')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignJustify size={22} /></button>
                <div className="flex-1" />
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('insertText', '🙂')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Smile size={22} /></button>
              </div>
              <div className="relative">
                <div
                  ref={descriptionEditorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncDescription}
                  className="min-h-[220px] w-full whitespace-pre-wrap border-0 px-4 py-3 text-base text-[#4b5563] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-[#4b5563]">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-[#cfd4dc]"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-[#2f3640]">Featured</span>
                Adds this public collection into your featured section
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-[#4b5563]">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-[#cfd4dc]"
                checked={hidden}
                onChange={(event) => setHidden(event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-[#2f3640]">Hidden</span>
                Hides collection from public list, however this will still be accessible via direct link
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#2f3640]">Preview Image</label>
            <PreviewUploadCard
              onClick={() => previewImageInputRef.current?.click()}
              onDropFile={(file) => {
                if (!isAllowedFile(file, IMAGE_EXTENSIONS)) {
                  setPreviewImageError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
                  return;
                }
                setPreviewImageError('');
                setPreviewImage(file);
              }}
            />
            <input
              ref={previewImageInputRef}
              type="file"
              accept={IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!isAllowedFile(file, IMAGE_EXTENSIONS)) {
                  setPreviewImageError(`Invalid file type. Allowed: ${IMAGE_EXTENSIONS.join(', ')}`);
                  return;
                }
                setPreviewImageError('');
                setPreviewImage(file);
              }}
            />
            {previewImage && <p className="text-sm text-[#4b5563]">{previewImage.name}</p>}
            {previewImageError && <p className="text-sm text-red-600">{previewImageError}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#2f3640]">Included Videos & Collections</label>
            <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-4 py-3">
              <div className="flex items-center gap-4 text-[#667085]">
                <button type="button" className="text-sm font-medium">+ Add Video</button>
                <button type="button" className="text-sm font-medium">+ Add Collection</button>
              </div>
              <button type="button" className="text-xl leading-none text-[#667085]">…</button>
            </div>
            <p className="text-sm text-[#7b8390]">Selection of existing videos/collections will be added in a later update.</p>
          </div>

          <div className="pt-1">
            {saveError && <p className="mb-2 text-sm text-red-600">{saveError}</p>}
            <Button disabled={isSaving} onClick={saveCategory} className="h-11 rounded-xl bg-[#4b5563] px-6 text-sm font-semibold text-white hover:bg-[#3f4753]">
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
