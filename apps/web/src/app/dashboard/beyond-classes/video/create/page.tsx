'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Code,
  Italic,
  Link as LinkIcon,
  Plus,
  Search,
  Smile,
  Strikethrough,
  Underline,
  X,
} from 'lucide-react';
import { Button, Input, Select, Switch } from '@/components/ui';
import DatePicker from '@/components/dashboard/filters/date-picker';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg'];
const VIDEO_EXTENSIONS = ['mp4', 'mov'];
const DIGITAL_EXTENSIONS = [...IMAGE_EXTENSIONS, 'pdf'];
const ON_DEMAND_VIDEO_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_VIDEO_BUCKET || 'on-demand-videos';

type EmojiCategory = 'smileys' | 'gestures' | 'hearts' | 'animals' | 'food' | 'travel';
type EmojiItem = { emoji: string; name: string; category: EmojiCategory };

const EMOJI_ITEMS: EmojiItem[] = [
  { emoji: '😀', name: 'grinning', category: 'smileys' },
  { emoji: '😃', name: 'smiley', category: 'smileys' },
  { emoji: '😄', name: 'smile', category: 'smileys' },
  { emoji: '😁', name: 'grin', category: 'smileys' },
  { emoji: '😅', name: 'sweat smile', category: 'smileys' },
  { emoji: '😂', name: 'joy', category: 'smileys' },
  { emoji: '🤣', name: 'rolling laugh', category: 'smileys' },
  { emoji: '😊', name: 'blush', category: 'smileys' },
  { emoji: '🙂', name: 'slight smile', category: 'smileys' },
  { emoji: '😉', name: 'wink', category: 'smileys' },
  { emoji: '😍', name: 'heart eyes', category: 'smileys' },
  { emoji: '😘', name: 'kiss', category: 'smileys' },
  { emoji: '😎', name: 'cool', category: 'smileys' },
  { emoji: '🤩', name: 'star eyes', category: 'smileys' },
  { emoji: '🤔', name: 'thinking', category: 'smileys' },
  { emoji: '😴', name: 'sleepy', category: 'smileys' },
  { emoji: '😭', name: 'cry', category: 'smileys' },
  { emoji: '😡', name: 'angry', category: 'smileys' },
  { emoji: '👍', name: 'thumbs up', category: 'gestures' },
  { emoji: '👎', name: 'thumbs down', category: 'gestures' },
  { emoji: '👏', name: 'clap', category: 'gestures' },
  { emoji: '🙌', name: 'raise hands', category: 'gestures' },
  { emoji: '🙏', name: 'pray', category: 'gestures' },
  { emoji: '💪', name: 'muscle', category: 'gestures' },
  { emoji: '👌', name: 'ok hand', category: 'gestures' },
  { emoji: '✌️', name: 'victory', category: 'gestures' },
  { emoji: '🤝', name: 'handshake', category: 'gestures' },
  { emoji: '❤️', name: 'red heart', category: 'hearts' },
  { emoji: '🧡', name: 'orange heart', category: 'hearts' },
  { emoji: '💛', name: 'yellow heart', category: 'hearts' },
  { emoji: '💚', name: 'green heart', category: 'hearts' },
  { emoji: '💙', name: 'blue heart', category: 'hearts' },
  { emoji: '💜', name: 'purple heart', category: 'hearts' },
  { emoji: '🖤', name: 'black heart', category: 'hearts' },
  { emoji: '🤍', name: 'white heart', category: 'hearts' },
  { emoji: '💖', name: 'sparkle heart', category: 'hearts' },
  { emoji: '🔥', name: 'fire', category: 'hearts' },
  { emoji: '✨', name: 'sparkles', category: 'hearts' },
  { emoji: '🎉', name: 'party popper', category: 'hearts' },
  { emoji: '🐶', name: 'dog', category: 'animals' },
  { emoji: '🐱', name: 'cat', category: 'animals' },
  { emoji: '🐭', name: 'mouse', category: 'animals' },
  { emoji: '🐼', name: 'panda', category: 'animals' },
  { emoji: '🦊', name: 'fox', category: 'animals' },
  { emoji: '🐸', name: 'frog', category: 'animals' },
  { emoji: '🦁', name: 'lion', category: 'animals' },
  { emoji: '🐵', name: 'monkey', category: 'animals' },
  { emoji: '🦄', name: 'unicorn', category: 'animals' },
  { emoji: '🍎', name: 'apple', category: 'food' },
  { emoji: '🍌', name: 'banana', category: 'food' },
  { emoji: '🍕', name: 'pizza', category: 'food' },
  { emoji: '🍔', name: 'burger', category: 'food' },
  { emoji: '🍣', name: 'sushi', category: 'food' },
  { emoji: '🍩', name: 'donut', category: 'food' },
  { emoji: '☕', name: 'coffee', category: 'food' },
  { emoji: '🍵', name: 'tea', category: 'food' },
  { emoji: '🍷', name: 'wine', category: 'food' },
  { emoji: '✈️', name: 'airplane', category: 'travel' },
  { emoji: '🚗', name: 'car', category: 'travel' },
  { emoji: '🚕', name: 'taxi', category: 'travel' },
  { emoji: '🚌', name: 'bus', category: 'travel' },
  { emoji: '🚆', name: 'train', category: 'travel' },
  { emoji: '🚢', name: 'ship', category: 'travel' },
  { emoji: '🏖️', name: 'beach', category: 'travel' },
  { emoji: '🏝️', name: 'island', category: 'travel' },
  { emoji: '🌍', name: 'globe', category: 'travel' },
  { emoji: '🗺️', name: 'map', category: 'travel' },
];

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isAllowedFile(file: File, allowedExtensions: string[]) {
  return allowedExtensions.includes(getFileExtension(file.name));
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function toSpotifyEmbedUrl(input: string) {
  try {
    const url = new URL(input);
    if (!url.hostname.includes('spotify.com')) return null;

    const match = url.pathname.match(/\/(playlist|track|album)\/([a-zA-Z0-9]+)/);
    if (match) {
      const [, type, id] = match;
      return `https://open.spotify.com/embed/${type}/${id}`;
    }

    if (url.pathname.includes('/embed/')) {
      return `${url.origin}${url.pathname}${url.search}`;
    }
  } catch {
    return null;
  }

  return null;
}

function toAppleMusicEmbedUrl(input: string) {
  try {
    const url = new URL(input);
    if (!url.hostname.includes('music.apple.com')) return null;
    url.hostname = 'embed.music.apple.com';
    return url.toString();
  } catch {
    return null;
  }
}

function getPlaylistEmbedUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return toSpotifyEmbedUrl(trimmed) ?? toAppleMusicEmbedUrl(trimmed);
}

const detailsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M5.5 16c.9-1.7 2.2-2.5 3.7-2.5 1.5 0 2.9.8 3.8 2.5" />
    <path d="M14 10h5" />
    <path d="M14 13h5" />
  </svg>
);

const categoriesIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

const pricingIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </svg>
);

function SectionHeader({ title, icon, isOpen, onClick }: { title: string; icon: React.ReactNode; isOpen: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between text-left">
      <div className="flex items-center gap-3">
        <span className="text-[#6b7280]">{icon}</span>
        <span className="text-lg font-semibold text-[#2f3640]">{title}</span>
      </div>
      {isOpen ? <ChevronUp className="h-5 w-5 text-[#6b7280]" /> : <ChevronDown className="h-5 w-5 text-[#6b7280]" />}
    </button>
  );
}

function UploadCard({
  size = 'large',
  onClick,
  onDropFile,
  fileName,
}: {
  size?: 'large' | 'small';
  onClick?: () => void;
  onDropFile?: (file: File) => void;
  fileName?: string;
}) {
  const isSmall = size === 'small';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile && onDropFile) onDropFile(droppedFile);
      }}
      className={[
        'flex cursor-pointer items-center justify-center border border-dashed border-[#d0d5dd] bg-[#fafbfc] text-[#23262b]',
        isSmall ? 'h-[156px] w-[274px]' : 'min-h-[260px] w-full',
      ].join(' ')}
    >
      {isSmall ? (
        <div className="text-center">
          <div className="mb-2 text-6xl leading-none text-[#c8ced8]">↓</div>
          <p className="text-base">
            Drop here or <span className="font-medium text-[#3370d4]">upload</span>
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg">
            Drop files here or <span className="font-medium text-[#3370d4]">browse files</span>
          </p>
          {fileName && <p className="mt-3 text-sm text-[#4b5563]">{fileName}</p>}
        </div>
      )}
    </div>
  );
}

type UploadPanelProps = {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'uploaded' | 'cancelled';
  onCancel: () => void;
  previewUrl?: string | null;
};

function UploadProgressPanel({ file, progress, status, onCancel, previewUrl }: UploadPanelProps) {
  const fileName = file.name;
  const extension = getFileExtension(fileName);
  const isImage = IMAGE_EXTENSIONS.includes(extension);
  const isVideo = VIDEO_EXTENSIONS.includes(extension);
  const isUploading = status === 'uploading';
  const isUploaded = status === 'uploaded';
  const statusLabel = isUploaded ? 'Uploaded' : 'Uploading';

  return (
    <div className="overflow-hidden rounded-xl border border-[#d6dbe3] bg-[#f4f5f7]">
      <div className="flex items-center justify-between border-b border-[#d6dbe3] bg-white px-4 py-3">
        <button type="button" onClick={onCancel} className="text-base text-[#2563eb]">Cancel</button>
        <span className="text-lg font-semibold text-[#2f3640]">{isUploaded ? 'Upload complete' : 'Uploading 1 file'}</span>
        <span className="w-12" />
      </div>

      <div className="relative min-h-[300px] px-4 py-4">
        <div className="relative h-[420px] w-full overflow-hidden rounded-md border border-[#d6dbe3] bg-[#0f5132]">
          {previewUrl && isImage && (
            <img src={previewUrl} alt={fileName} className="h-full w-full object-cover" />
          )}
          {previewUrl && isVideo && (
            <video src={previewUrl} className="h-full w-full object-cover" muted playsInline controls={isUploaded} />
          )}
          {!previewUrl && (
            <div className="flex h-full w-full items-center justify-center bg-[#e5e7eb] text-sm text-[#6b7280]">
              {fileName}
            </div>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
            aria-label="Cancel upload"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="h-[3px] w-full bg-[#d6dbe3]">
        <div className="h-full bg-[#2563eb] transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between border-t border-[#d6dbe3] bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          {isUploading ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#3b82f6] border-r-transparent" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#dcfce7] text-[#15803d]">✓</span>
          )}
          <span className="text-base text-[#2f3640]">{statusLabel}: {progress}%</span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border-4 border-[#9bbbe8] bg-[#8c939d] p-1 text-white"
          aria-label="Cancel upload"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function DisabledTag() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#eceef1] px-3 py-1 text-sm font-medium text-[#4b5563]">
      Premium Video Disabled
    </span>
  );
}

export default function CreateVideoPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { communityId } = useAuthStore();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    details: true,
    categories: false,
    pricing: false,
  });

  const [formData, setFormData] = useState({
    classId: '',
    name: '',
    instructorId: '',
    videoType: 'video_file',
    videoLink: '',
    playlistLink: '',
    description: '',
    duration: 0,

    allowBuy: false,
    allowRent: false,
    rentalPrice: 10,
    rentalPeriod: 24,
    dropInRentalOnly: false,
    creationDate: new Date(),
    hideCreationDate: false,
    expirationDate: null as Date | null,
    hideExpirationDate: false,
    isHidden: false,
  });

  const [showCreationDatePicker, setShowCreationDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFilePreviewUrl, setVideoFilePreviewUrl] = useState<string | null>(null);
  const [digitalDownloadFile, setDigitalDownloadFile] = useState<File | null>(null);
  const [digitalPreviewUrl, setDigitalPreviewUrl] = useState<string | null>(null);
  const [videoUploadState, setVideoUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'cancelled'>('idle');
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [digitalUploadState, setDigitalUploadState] = useState<'idle' | 'uploading' | 'uploaded' | 'cancelled'>('idle');
  const [digitalUploadProgress, setDigitalUploadProgress] = useState(0);
  const [previewImageError, setPreviewImageError] = useState('');
  const [videoFileError, setVideoFileError] = useState('');
  const [digitalDownloadError, setDigitalDownloadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [pendingLink, setPendingLink] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<EmojiCategory>('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);

  const previewImageInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const digitalDownloadInputRef = useRef<HTMLInputElement>(null);
  const descriptionEditorRef = useRef<HTMLDivElement>(null);
  const videoUploadIntervalRef = useRef<number | null>(null);
  const videoUploadTimeoutRef = useRef<number | null>(null);
  const digitalUploadIntervalRef = useRef<number | null>(null);
  const digitalUploadTimeoutRef = useRef<number | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const creationDateRef = useRef<HTMLDivElement>(null);
  const expirationDateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (creationDateRef.current && !creationDateRef.current.contains(event.target as Node)) {
        setShowCreationDatePicker(false);
      }
      if (expirationDateRef.current && !expirationDateRef.current.contains(event.target as Node)) {
        setShowExpirationDatePicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function closeEmojiOnOutsideClick(event: MouseEvent) {
      if (!emojiPickerRef.current) return;
      const target = event.target as HTMLElement;
      if (emojiPickerRef.current.contains(target)) return;
      if (target.closest('[data-emoji-trigger="true"]')) return;
      setShowEmojiPicker(false);
    }
    document.addEventListener('mousedown', closeEmojiOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeEmojiOnOutsideClick);
  }, []);

  useEffect(() => {
    return () => {
      if (videoUploadIntervalRef.current) window.clearInterval(videoUploadIntervalRef.current);
      if (videoUploadTimeoutRef.current) window.clearTimeout(videoUploadTimeoutRef.current);
      if (digitalUploadIntervalRef.current) window.clearInterval(digitalUploadIntervalRef.current);
      if (digitalUploadTimeoutRef.current) window.clearTimeout(digitalUploadTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    };
  }, [previewImageUrl]);

  useEffect(() => {
    return () => {
      if (videoFilePreviewUrl) URL.revokeObjectURL(videoFilePreviewUrl);
    };
  }, [videoFilePreviewUrl]);

  useEffect(() => {
    return () => {
      if (digitalPreviewUrl) URL.revokeObjectURL(digitalPreviewUrl);
    };
  }, [digitalPreviewUrl]);

  useEffect(() => {
    let active = true;
    async function fetchCategories() {
      if (!communityId) {
        if (active) setCategories([]);
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('video_categories')
          .select('id,name')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (active) setCategories(data ?? []);
      } catch (error) {
        console.error(error);
        if (active) setCategories([]);
      }
    }
    fetchCategories();
    return () => {
      active = false;
    };
  }, [communityId]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      details: section === 'details' ? !prev.details : false,
      categories: section === 'categories' ? !prev.categories : false,
      pricing: section === 'pricing' ? !prev.pricing : false,
    }));
  };

  const handleInputChange = (field: string, value: string | number | boolean | Date | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelection = (
    file: File,
    allowedExtensions: string[],
    onSuccess: (selected: File) => void,
    setError: (error: string) => void
  ) => {
    if (!isAllowedFile(file, allowedExtensions)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }
    setError('');
    onSuccess(file);
  };

  const syncDescription = () => {
    const nextHtml = descriptionEditorRef.current?.innerHTML ?? '';
    setFormData((prev) => ({ ...prev, description: nextHtml }));
  };

  const runEditorCommand = (command: string, value?: string) => {
    descriptionEditorRef.current?.focus();
    document.execCommand(command, false, value);
    syncDescription();
  };

  const playlistEmbedUrl = getPlaylistEmbedUrl(formData.playlistLink);
  const fromPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const saveVideo = async () => {
    if (!communityId) {
      setSaveError('Community context is missing. Please refresh and try again.');
      return;
    }
    if (!formData.name.trim()) {
      setSaveError('Video name is required.');
      return;
    }
    if (!formData.videoType) {
      setSaveError('Please select a video type.');
      return;
    }
    if (formData.videoType === 'video_file' && !videoFile) {
      setSaveError('Please upload a video file before saving.');
      return;
    }
    if ((formData.videoType === 'youtube_link' || formData.videoType === 'vimeo_link') && !formData.videoLink.trim()) {
      setSaveError('Please add a video link before saving.');
      return;
    }

    setSaveError('');
    setIsSaving(true);
    try {
      const supabase = createClient();
      const now = Date.now();

      const uploadToStorage = async (file: File, folder: 'videos' | 'preview-images' | 'digital-downloads') => {
        const safeName = sanitizeFileName(file.name);
        const objectPath = `${communityId}/${folder}/${now}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(ON_DEMAND_VIDEO_BUCKET)
          .upload(objectPath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(ON_DEMAND_VIDEO_BUCKET)
          .getPublicUrl(objectPath);

        return { objectPath, publicUrl: publicUrlData.publicUrl };
      };

      let uploadedVideo: { objectPath: string; publicUrl: string } | null = null;
      let uploadedPreviewImage: { objectPath: string; publicUrl: string } | null = null;

      if (formData.videoType === 'video_file' && videoFile) {
        uploadedVideo = await uploadToStorage(videoFile, 'videos');
      }

      if (previewImageFile) {
        uploadedPreviewImage = await uploadToStorage(previewImageFile, 'preview-images');
      }

      const { data, error } = await supabase
        .from('on_demand_videos')
        .insert({
          community_id: communityId,
          class_id: isUuid(formData.classId) ? formData.classId : null,
          instructor_id: isUuid(formData.instructorId) ? formData.instructorId : null,
          name: formData.name.trim(),
          video_type: formData.videoType,
          video_link: formData.videoType === 'video_file' ? uploadedVideo?.publicUrl ?? null : formData.videoLink || null,
          video_file_name: uploadedVideo?.objectPath ?? (videoFile?.name ?? null),
          preview_image_url: uploadedPreviewImage?.publicUrl ?? null,
          preview_image_name: uploadedPreviewImage?.objectPath ?? (previewImageFile?.name ?? null),
          playlist_link: formData.playlistLink || null,
          description: formData.description || null,
          rental_price_cents: formData.allowRent ? Math.max(0, Math.round(Number(formData.rentalPrice) * 100)) : 0,
          status: formData.isHidden ? 'hidden' : 'live',
        })
        .select('id')
        .single();

      if (error) throw error;

      if (selectedCategoryId && data?.id) {
        const { error: categoryError } = await supabase.from('on_demand_video_categories').insert({
          on_demand_video_id: data.id,
          video_category_id: selectedCategoryId,
        });
        if (categoryError) throw categoryError;
      }

      router.push('/dashboard/beyond-classes/video/videos');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '';
      if (message.toLowerCase().includes('bucket')) {
        setSaveError(`Storage bucket "${ON_DEMAND_VIDEO_BUCKET}" is missing or inaccessible. Create it in Supabase Storage and retry.`);
      } else {
        setSaveError('Failed to save video. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const startUploadProgress = (
    kind: 'video' | 'digital',
    selectedFile: File,
    previewUrl: string
  ) => {
    const setState = kind === 'video' ? setVideoUploadState : setDigitalUploadState;
    const setProgress = kind === 'video' ? setVideoUploadProgress : setDigitalUploadProgress;
    const intervalRef = kind === 'video' ? videoUploadIntervalRef : digitalUploadIntervalRef;
    const timeoutRef = kind === 'video' ? videoUploadTimeoutRef : digitalUploadTimeoutRef;

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    setState('uploading');
    setProgress(0);

    let progress = 0;
    intervalRef.current = window.setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 6;
      if (progress > 97) progress = 97;
      setProgress(progress);
    }, 180);

    timeoutRef.current = window.setTimeout(() => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      setProgress(100);
      setState('uploaded');
    }, 3200);

    if (kind === 'video') {
      setVideoFile(selectedFile);
      if (videoFilePreviewUrl) URL.revokeObjectURL(videoFilePreviewUrl);
      setVideoFilePreviewUrl(previewUrl);
    } else {
      setDigitalDownloadFile(selectedFile);
      if (digitalPreviewUrl) URL.revokeObjectURL(digitalPreviewUrl);
      setDigitalPreviewUrl(previewUrl);
    }
  };

  const cancelUpload = (kind: 'video' | 'digital') => {
    const setState = kind === 'video' ? setVideoUploadState : setDigitalUploadState;
    const setProgress = kind === 'video' ? setVideoUploadProgress : setDigitalUploadProgress;
    const intervalRef = kind === 'video' ? videoUploadIntervalRef : digitalUploadIntervalRef;
    const timeoutRef = kind === 'video' ? videoUploadTimeoutRef : digitalUploadTimeoutRef;
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setState('idle');
    setProgress(0);
    if (kind === 'video') {
      if (videoFilePreviewUrl) URL.revokeObjectURL(videoFilePreviewUrl);
      setVideoFilePreviewUrl(null);
      setVideoFile(null);
    } else {
      if (digitalPreviewUrl) URL.revokeObjectURL(digitalPreviewUrl);
      setDigitalPreviewUrl(null);
      setDigitalDownloadFile(null);
    }
  };

  const beginMockVideoUpload = (selectedFile: File) => {
    const url = URL.createObjectURL(selectedFile);
    startUploadProgress('video', selectedFile, url);
  };

  const beginMockDigitalUpload = (selectedFile: File) => {
    const url = URL.createObjectURL(selectedFile);
    startUploadProgress('digital', selectedFile, url);
  };

  const insertLinkFromModal = () => {
    if (!pendingLink.trim()) return;
    runEditorCommand('createLink', pendingLink.trim());
    setPendingLink('');
    setIsLinkModalOpen(false);
  };

  const visibleEmojiItems = EMOJI_ITEMS.filter((item) => {
    if (item.category !== activeEmojiCategory) return false;
    if (!emojiSearch.trim()) return true;
    const query = emojiSearch.trim().toLowerCase();
    return item.name.includes(query) || item.emoji.includes(query);
  });

  const insertEmoji = (emoji: string) => {
    runEditorCommand('insertText', emoji);
    setRecentEmojis((prev) => [emoji, ...prev.filter((value) => value !== emoji)].slice(0, 16));
  };

  const applyPreviewImage = (selectedFile: File) => {
    setPreviewImageFile(selectedFile);
    setPreviewImageError('');
    if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
    setPreviewImageUrl(URL.createObjectURL(selectedFile));
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto w-full max-w-[1320px] px-6 pb-10 pt-7">
        <div className="mb-9">
          <h1 className="text-[23px] font-bold text-[#1f2937]">Add Video</h1>
          <button type="button" onClick={() => router.back()} className="flex items-center text-[13px] text-[#6b7280] hover:text-[#374151]">
            <ChevronLeft className="mr-0.5 h-4 w-4 text-gray-300" />
            <span className="hover:underline cursor-pointer">Back</span>
          </button>
        </div>

        <div className="border-y border-[#e5e7eb]">
          <div className="border-b border-[#eef0f3] py-2">
            <SectionHeader title="Details" icon={detailsIcon} isOpen={openSections.details} onClick={() => toggleSection('details')} />

            {openSections.details && (
              <div className="max-w-[600px] space-y-7 pb-8">
                <div className="space-y-2 mt-4">
                  <label className="text-sm mt-6 font-medium text-[#2f3640]">Class (optional)</label>
                  <Select value={formData.classId} onChange={(e) => handleInputChange('classId', e.target.value)} className="h-11 border-[#d6dbe3] bg-gray-50">
                    <option value="">None</option>
                    <option value="class1">Morning Yoga</option>
                    <option value="class2">HIIT Workout</option>
                  </Select>
                  <p className="max-w-[500px] text-sm leading-6 text-[#7b8390]">
                    Does this pertain to a class? If so class attendees will be able to access this recording until the expiration date.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2f3640]">Name</label>
                    <Input placeholder="Product Name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className="h-11 border-[#d6dbe3]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#2f3640]">Instructor</label>
                    <Select value={formData.instructorId} onChange={(e) => handleInputChange('instructorId', e.target.value)} className="h-11 border-[#d6dbe3]">
                      <option value="">Select an instructor...</option>
                      <option value="inst1">Jane Doe</option>
                      <option value="inst2">John Smith</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#2f3640]">Preview Image</label>
                  <div className="space-y-3">
                    <div className="flex h-[156px] w-[274px] items-center justify-center overflow-hidden border border-dashed border-[#c4cad3] bg-[#fafbfc]">
                      {previewImageUrl ? (
                        <img src={previewImageUrl} alt={previewImageFile?.name || 'Preview image'} className="h-full w-full object-cover" />
                      ) : (
                        <UploadCard
                          size="small"
                          onClick={() => previewImageInputRef.current?.click()}
                          onDropFile={(file) =>
                            handleFileSelection(file, IMAGE_EXTENSIONS, applyPreviewImage, setPreviewImageError)
                          }
                        />
                      )}
                    </div>
                    {previewImageFile && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
                          setPreviewImageUrl(null);
                          setPreviewImageFile(null);
                        }}
                        className="h-10 rounded-xl bg-[#4b5563] px-6 text-white hover:bg-[#3f4753]"
                      >
                        Remove Image
                      </Button>
                    )}
                  </div>
                  <input
                    ref={previewImageInputRef}
                    type="file"
                    accept={IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleFileSelection(file, IMAGE_EXTENSIONS, applyPreviewImage, setPreviewImageError);
                      }
                    }}
                  />
                  {previewImageError && <p className="text-sm text-red-600">{previewImageError}</p>}
                  <p className="text-sm text-[#7b8390]">Recommended dimensions 637x333px. Anyone can see this image.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Type of video</label>
                  <Select value={formData.videoType} onChange={(e) => handleInputChange('videoType', e.target.value)} className="h-11 border-[#d6dbe3]">
                    <option value="">Select one...</option>
                    <option value="video_file">Video File (.mp4 or .mov)</option>
                    <option value="vimeo_link">Vimeo Link</option>
                    <option value="youtube_link">YouTube Link</option>
                  </Select>
                  <p className="text-sm text-[#7b8390]">Uploading a file or using a video link</p>
                </div>

                {formData.videoType === 'video_file' ? (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-[#2f3640]">Video file</label>
                    <DisabledTag />
                    {videoUploadState === 'idle' ? (
                      <>
                        <UploadCard
                          onClick={() => videoFileInputRef.current?.click()}
                          onDropFile={(file) =>
                            handleFileSelection(file, VIDEO_EXTENSIONS, beginMockVideoUpload, setVideoFileError)
                          }
                          fileName={videoFile?.name}
                        />
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept={VIDEO_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              handleFileSelection(file, VIDEO_EXTENSIONS, beginMockVideoUpload, setVideoFileError);
                            }
                          }}
                        />
                      </>
                    ) : null}
                    {videoFileError && <p className="text-sm text-red-600">{videoFileError}</p>}
                    {videoFile && videoUploadState !== 'idle' && (
                      <UploadProgressPanel
                        file={videoFile}
                        progress={videoUploadProgress}
                        status={videoUploadState}
                        onCancel={() => cancelUpload('video')}
                        previewUrl={videoFilePreviewUrl}
                      />
                    )}
                  </div>
                ) : formData.videoType === 'youtube_link' || formData.videoType === 'vimeo_link' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#2f3640]">
                      {formData.videoType === 'youtube_link' ? 'YouTube Link' : 'Vimeo Link'}
                    </label>
                    <Input
                      placeholder={formData.videoType === 'youtube_link' ? 'Paste YouTube link' : 'Paste Vimeo link'}
                      value={formData.videoLink}
                      onChange={(event) => handleInputChange('videoLink', event.target.value)}
                      className="h-11 border-[#d6dbe3]"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[#d6dbe3] bg-[#fafbfc] px-4 py-3 text-sm text-[#7b8390]">
                    Select a video source type to continue.
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Playlist Link</label>
                  <Input
                    placeholder="Paste your Spotify or Apple Music link here"
                    value={formData.playlistLink}
                    onChange={(e) => handleInputChange('playlistLink', e.target.value)}
                    className="h-11 border-[#d6dbe3]"
                  />
                  <p className="text-sm text-[#7b8390]">
                    Embed your playlist below your video. <span className="underline">Learn More</span>
                  </p>
                  {playlistEmbedUrl && (
                    <div className="overflow-hidden rounded-lg border border-[#d6dbe3]">
                      <iframe
                        src={playlistEmbedUrl}
                        className="h-[152px] w-full"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Playlist embed"
                      />
                    </div>
                  )}
                  {!playlistEmbedUrl && formData.playlistLink.trim().length > 0 && (
                    <p className="text-sm text-[#b45309]">Enter a valid Spotify or Apple Music playlist/track URL to embed.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Description</label>
                  <div className="relative rounded-md border border-[#d6dbe3] bg-white">
                    <div className="flex items-center gap-0.5 border-b border-[#e5e7eb] px-2 py-2 text-[#6b7280]">
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('bold')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Bold size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('italic')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Italic size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('underline')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Underline size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('strikeThrough')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Strikethrough size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('formatBlock', '<pre>')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><Code size={18} /></button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsLinkModalOpen(true)}
                        className="rounded p-1.5 hover:bg-[#f2f4f7]"
                      >
                        <LinkIcon size={18} />
                      </button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyLeft')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignLeft size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyCenter')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignCenter size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyRight')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignRight size={18} /></button>
                      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runEditorCommand('justifyFull')} className="rounded p-1.5 hover:bg-[#f2f4f7]"><AlignJustify size={18} /></button>
                      <div className="flex-1" />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowEmojiPicker((value) => !value)}
                        data-emoji-trigger="true"
                        className="rounded p-1.5 hover:bg-[#f2f4f7]"
                      >
                        <Smile size={18} />
                      </button>
                    </div>
                    <div className="relative">
                      <div
                        ref={descriptionEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={syncDescription}
                        className="min-h-[118px] w-full whitespace-pre-wrap border-0 px-3 py-3 text-base text-[#4b5563] focus:outline-none"
                      />
                      {!formData.description && (
                        <span className="pointer-events-none absolute left-3 top-3 text-base text-[#9ca3af]">
                          Optional. Tell your clients what this is all about
                        </span>
                      )}
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          className="absolute right-0 top-12 z-20 w-[520px] overflow-hidden rounded-2xl border border-[#d6dbe3] bg-white shadow-2xl"
                        >
                          <div className="flex items-center gap-1 border-b border-[#e5e7eb] px-3 py-2">
                            {[
                              { id: 'smileys', icon: '😀', label: 'Smileys' },
                              { id: 'gestures', icon: '👍', label: 'Gestures' },
                              { id: 'hearts', icon: '❤️', label: 'Hearts' },
                              { id: 'animals', icon: '🐶', label: 'Animals' },
                              { id: 'food', icon: '🍕', label: 'Food' },
                              { id: 'travel', icon: '✈️', label: 'Travel' },
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                className={`rounded-lg px-2 py-1.5 text-lg ${activeEmojiCategory === tab.id ? 'bg-[#eef2ff]' : 'hover:bg-[#f3f4f6]'}`}
                                onClick={() => setActiveEmojiCategory(tab.id as EmojiCategory)}
                                aria-label={tab.label}
                                title={tab.label}
                              >
                                {tab.icon}
                              </button>
                            ))}
                          </div>
                          <div className="border-b border-[#e5e7eb] p-3">
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                              <input
                                type="text"
                                value={emojiSearch}
                                onChange={(event) => setEmojiSearch(event.target.value)}
                                placeholder="Search emojis"
                                className="h-10 w-full rounded-xl border border-[#d6dbe3] pl-9 pr-3 text-sm text-[#2f3640] focus:border-[#93c5fd] focus:outline-none"
                              />
                            </div>
                          </div>
                          {recentEmojis.length > 0 && !emojiSearch.trim() && (
                            <div className="border-b border-[#e5e7eb] px-3 py-2">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7b8390]">Recently used</p>
                              <div className="grid grid-cols-10 gap-1">
                                {recentEmojis.map((emoji) => (
                                  <button
                                    key={`recent-${emoji}`}
                                    type="button"
                                    className="rounded-md p-1 text-2xl hover:bg-[#f2f4f7]"
                                    onClick={() => insertEmoji(emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="max-h-[280px] overflow-y-auto p-3">
                            <div className="grid grid-cols-10 gap-1">
                              {visibleEmojiItems.map((item) => (
                                <button
                                  key={`${item.category}-${item.emoji}`}
                                  type="button"
                                  className="rounded-md p-1 text-2xl hover:bg-[#f2f4f7]"
                                  onClick={() => insertEmoji(item.emoji)}
                                  title={item.name}
                                  aria-label={item.name}
                                >
                                  {item.emoji}
                                </button>
                              ))}
                            </div>
                            {visibleEmojiItems.length === 0 && (
                              <p className="px-1 py-3 text-sm text-[#7b8390]">No emoji found.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-[#7b8390]">Embed your playlist below your video.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-[#2f3640]">Digital Download</label>
                  <DisabledTag />
                  <UploadCard
                    onClick={() => digitalDownloadInputRef.current?.click()}
                    onDropFile={(file) =>
                      handleFileSelection(file, DIGITAL_EXTENSIONS, beginMockDigitalUpload, setDigitalDownloadError)
                    }
                    fileName={digitalDownloadFile?.name}
                  />
                  <input
                    ref={digitalDownloadInputRef}
                    type="file"
                    accept={DIGITAL_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleFileSelection(file, DIGITAL_EXTENSIONS, beginMockDigitalUpload, setDigitalDownloadError);
                      }
                    }}
                  />
                  {digitalDownloadError && <p className="text-sm text-red-600">{digitalDownloadError}</p>}
                  {digitalDownloadFile && digitalUploadState !== 'idle' && digitalUploadState !== 'cancelled' && (
                    <UploadProgressPanel
                      file={digitalDownloadFile}
                      progress={digitalUploadProgress}
                      status={digitalUploadState}
                      onCancel={() => cancelUpload('digital')}
                      previewUrl={digitalPreviewUrl}
                    />
                  )}
                  <p className="text-sm text-[#7b8390]">No files uploaded</p>
                  <p className="-mt-2 text-sm text-[#7b8390]">Add an additional resource or PDF to your video content.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-[#eef0f3] py-2">
            <SectionHeader title="Categories & filters" icon={categoriesIcon} isOpen={openSections.categories} onClick={() => toggleSection('categories')} />

            {openSections.categories && (
              <div className="max-w-[860px] space-y-6 pb-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Categories</label>
                  <Select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
                    <option value="">Select existing categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/dashboard/beyond-classes/video/categories/new?activeCategoryTab=true&from=${encodeURIComponent(fromPath)}`
                      )
                    }
                    className="inline-flex items-center text-sm text-[#667085] hover:text-[#111827]"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    <span>Create a new category</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Collections</label>
                  <Select>
                    <option value="">Select existing collections</option>
                    <option value="col1">Beginner Series</option>
                  </Select>
                  <button type="button" className="inline-flex items-center text-sm text-[#667085] hover:text-[#111827]">
                    <Plus className="mr-1 h-3.5 w-3.5" /> Create a new collection
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2f3640]">Workout Types</label>
                    <Select>
                      <option value="">Select existing categories</option>
                      <option value="cardio">Cardio</option>
                      <option value="strength">Strength</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2f3640]">Body Focus</label>
                    <Select>
                      <option value="">Select...</option>
                      <option value="full_body">Full Body</option>
                      <option value="upper_body">Upper Body</option>
                      <option value="lower_body">Lower Body</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2f3640]">Intensity</label>
                    <Select>
                      <option value="">Select...</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2f3640]">Equipment</label>
                    <Select>
                      <option value="">Select...</option>
                      <option value="none">None</option>
                      <option value="dumbbells">Dumbbells</option>
                      <option value="mat">Yoga Mat</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Duration</label>
                  <div className="flex w-full overflow-hidden rounded-lg border border-[#d6dbe3]">
                    <span className="inline-flex h-11 items-center border-r border-[#d6dbe3] bg-[#f9fafb] px-3 text-sm text-[#6b7280]">minutes</span>
                    <input type="number" className="h-11 w-full px-3 text-sm outline-none" value={formData.duration} onChange={(e) => handleInputChange('duration', Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Custom filters</label>
                  <Select>
                    <option value="">Type a new filter here</option>
                  </Select>
                  <p className="text-sm text-[#7b8390]">Can&apos;t find what you&apos;re looking for? Add one here</p>
                </div>
              </div>
            )}
          </div>

          <div className="py-2">
            <SectionHeader title="Pricing options" icon={pricingIcon} isOpen={openSections.pricing} onClick={() => toggleSection('pricing')} />

            {openSections.pricing && (
              <div className="max-w-[860px] space-y-6 pb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Switch id="allow-buy" checked={formData.allowBuy} onCheckedChange={(checked) => handleInputChange('allowBuy', checked)} className="mt-0.5" />
                    <div>
                      <label htmlFor="allow-buy" className="cursor-pointer text-sm font-medium text-[#2f3640]">Allow users to buy</label>
                      <p className="text-sm text-[#7b8390]">Viewers can access and stream this forever</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Switch id="allow-rent" checked={formData.allowRent} onCheckedChange={(checked) => handleInputChange('allowRent', checked)} className="mt-0.5" />
                    <div>
                      <label htmlFor="allow-rent" className="cursor-pointer text-sm font-medium text-[#2f3640]">Allow users to rent</label>
                      <p className="text-sm text-[#7b8390]">Viewers can access and stream this for a limited period of time</p>
                    </div>
                  </div>
                </div>

                {formData.allowRent && (
                  <div className="ml-2 space-y-5 border-l-2 border-[#eef0f3] pl-12">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2f3640]">Rental Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">$</span>
                        <input type="number" className="h-11 w-full rounded-lg border border-[#d6dbe3] pl-7 pr-3 text-sm outline-none" value={formData.rentalPrice} onChange={(e) => handleInputChange('rentalPrice', Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2f3640]">Rental Period</label>
                      <div className="flex overflow-hidden rounded-lg border border-[#d6dbe3]">
                        <span className="inline-flex h-11 items-center border-r border-[#d6dbe3] bg-[#f9fafb] px-3 text-sm text-[#6b7280]">hours</span>
                        <input type="number" className="h-11 w-full px-3 text-sm outline-none" value={formData.rentalPeriod} onChange={(e) => handleInputChange('rentalPeriod', Number(e.target.value))} />
                      </div>
                      <p className="text-sm text-[#7b8390]">In Hours</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Switch id="drop-in" checked={formData.dropInRentalOnly} onCheckedChange={(checked) => handleInputChange('dropInRentalOnly', checked)} className="mt-0.5" />
                  <div>
                    <label htmlFor="drop-in" className="cursor-pointer text-sm font-medium text-[#2f3640]">Drop-in / Rental Only</label>
                    <p className="text-sm text-[#7b8390]">Subscription members will not be able to access this video</p>
                  </div>
                </div>

                <div className="space-y-2" ref={creationDateRef}>
                  <label className="text-sm font-medium text-[#2f3640]">Creation Date</label>
                  <button type="button" onClick={() => setShowCreationDatePicker(!showCreationDatePicker)} className="flex h-11 w-full items-center justify-between rounded-lg border border-[#d6dbe3] bg-white px-3 text-sm text-[#2f3640]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-[#7b8390]" />
                      <span>
                        {formData.creationDate
                          ? formData.creationDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Select date'}
                      </span>
                    </div>
                  </button>
                  {showCreationDatePicker && (
                    <DatePicker selectedDate={formData.creationDate} onSelect={(date) => handleInputChange('creationDate', date)} onClose={() => setShowCreationDatePicker(false)} />
                  )}
                  <p className="text-sm text-[#7b8390]">The library will be sorted by date from newest to oldest</p>
                  <label className="flex items-center gap-2 text-sm text-[#4b5563]">
                    <input type="checkbox" className="rounded border-[#cfd4dc]" checked={formData.hideCreationDate} onChange={(e) => handleInputChange('hideCreationDate', e.target.checked)} />
                    Hide creation date
                  </label>
                </div>

                <div className="space-y-2" ref={expirationDateRef}>
                  <label className="text-sm font-medium text-[#2f3640]">Expiration Date</label>
                  <button type="button" onClick={() => setShowExpirationDatePicker(!showExpirationDatePicker)} className="flex h-11 w-full items-center justify-between rounded-lg border border-[#d6dbe3] bg-white px-3 text-sm text-[#2f3640]">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-[#7b8390]" />
                      <span>
                        {formData.expirationDate
                          ? formData.expirationDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Select date'}
                      </span>
                    </div>
                  </button>
                  {showExpirationDatePicker && (
                    <DatePicker selectedDate={formData.expirationDate || new Date()} onSelect={(date) => handleInputChange('expirationDate', date)} onClose={() => setShowExpirationDatePicker(false)} />
                  )}
                  <p className="text-sm text-[#7b8390]">Set a date for this product to expire (expires at midnight)</p>
                  <label className="flex items-center gap-2 text-sm text-[#4b5563]">
                    <input type="checkbox" className="rounded border-[#cfd4dc]" checked={formData.hideExpirationDate} onChange={(e) => handleInputChange('hideExpirationDate', e.target.checked)} />
                    Hide expiration date
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#2f3640]">Visibility</label>
                  <label className="flex items-start gap-2 text-sm text-[#4b5563]">
                    <input type="checkbox" className="mt-1 rounded border-[#cfd4dc]" checked={formData.isHidden} onChange={(e) => handleInputChange('isHidden', e.target.checked)} />
                    <span>
                      <span className="block font-medium text-[#2f3640]">Hidden</span>
                      Check this box if you don&apos;t want your students to be able to see this product. Students who have previously purchased this product &apos;a la carte&apos; will also not be able to see this product.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e5e7eb] px-1 py-6">
          <Button variant="outline" onClick={() => router.back()} className="h-12 rounded-xl border-[#d0d5dd] px-8 text-base">
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={saveVideo} className="h-12 rounded-xl bg-[#4b5563] px-8 text-base font-semibold text-white hover:bg-[#3f4753]">
            Save
          </Button>
        </div>
        {saveError && <p className="px-1 pb-4 text-sm text-red-600">{saveError}</p>}
      </div>

      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsLinkModalOpen(false)}
            aria-label="Close link modal"
          />
          <div className="relative w-full max-w-md rounded-xl border border-[#d6dbe3] bg-white p-5 shadow-2xl">
            <h3 className="mb-3 text-base font-semibold text-[#2f3640]">Insert Link</h3>
            <Input
              placeholder="https://example.com"
              value={pendingLink}
              onChange={(event) => setPendingLink(event.target.value)}
              className="h-11 border-[#d6dbe3]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsLinkModalOpen(false)} className="h-10 px-4">
                Cancel
              </Button>
              <Button onClick={insertLinkFromModal} className="h-10 px-4">
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
