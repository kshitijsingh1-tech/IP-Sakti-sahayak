import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, Presentation, File as FileIcon } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'pdf' | 'ppt' | 'image' | 'other';
  preview?: string;
}

interface FileUploadTriggerProps {
  onFilesSelect: (newFiles: UploadedFile[]) => void;
  className?: string;
  title?: string;
}

interface FileChipsListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

interface FileUploadButtonProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  compact?: boolean;
}

const ACCEPTED = '.pdf,.ppt,.pptx,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif';
const MAX_MB = 25;

export function getFileType(file: File): UploadedFile['type'] {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['ppt', 'pptx', 'doc', 'docx'].includes(ext)) return 'ppt';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_ICON: Record<UploadedFile['type'], React.ReactNode> = {
  pdf: <FileText className="w-3.5 h-3.5 text-slate-700 shrink-0" />,
  ppt: <Presentation className="w-3.5 h-3.5 text-slate-700 shrink-0" />,
  image: <ImageIcon className="w-3.5 h-3.5 text-slate-700 shrink-0" />,
  other: <FileIcon className="w-3.5 h-3.5 text-slate-700 shrink-0" />,
};

/**
 * Clean Paperclip Trigger Button — shrink-0, zero width overflow
 */
export const FileUploadTrigger: React.FC<FileUploadTriggerProps> = ({
  onFilesSelect,
  className = '',
  title = 'Attach document, PDF, PPT, or image',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (incoming: FileList | null) => {
    if (!incoming) return;
    setError(null);
    const valid: UploadedFile[] = [];

    Array.from(incoming).forEach((file) => {
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`"${file.name}" exceeds ${MAX_MB} MB limit.`);
        return;
      }
      const type = getFileType(file);
      const id = `${file.name}-${Date.now()}`;
      const item: UploadedFile = { id, file, name: file.name, size: formatSize(file.size), type };

      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          item.preview = e.target?.result as string;
          onFilesSelect([item]);
        };
        reader.readAsDataURL(file);
        return;
      }
      valid.push(item);
    });

    if (valid.length > 0) onFilesSelect(valid);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="relative shrink-0 flex items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-9 h-9 rounded-full hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer shrink-0 ${className}`}
        title={title}
      >
        <Paperclip className="w-4 h-4" />
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />

      {error && (
        <span className="absolute bottom-full mb-1 right-0 text-[10px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded shadow-sm whitespace-nowrap z-50">
          {error}
        </span>
      )}
    </div>
  );
};

/**
 * Renderable File Chips Container
 */
export const FileChipsList: React.FC<FileChipsListProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full px-3 py-1 text-xs font-semibold text-slate-800 max-w-[220px] transition-colors shadow-xs"
        >
          {f.type === 'image' && f.preview ? (
            <img src={f.preview} alt={f.name} className="w-4 h-4 rounded object-cover shrink-0" />
          ) : (
            TYPE_ICON[f.type]
          )}
          <span className="truncate">{f.name}</span>
          <span className="text-slate-400 text-[10px] font-mono shrink-0">{f.size}</span>
          <button
            type="button"
            onClick={() => onRemove(f.id)}
            className="ml-0.5 text-slate-400 hover:text-slate-950 transition-colors shrink-0 p-0.5 rounded-full hover:bg-slate-300"
            title="Remove attachment"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Unified Component
 */
export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  files,
  onFilesChange,
}) => {
  const handleAdd = (newItems: UploadedFile[]) => {
    onFilesChange([...files, ...newItems]);
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="flex items-center gap-2">
      <FileUploadTrigger onFilesSelect={handleAdd} />
      <FileChipsList files={files} onRemove={handleRemove} />
    </div>
  );
};
