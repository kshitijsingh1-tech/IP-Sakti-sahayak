import React, { useRef, useState } from 'react';
import { Paperclip, X, FileText, Image, Presentation, File } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  type: 'pdf' | 'ppt' | 'image' | 'other';
  preview?: string;
}

interface FileUploadButtonProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  compact?: boolean;
}

const ACCEPTED = '.pdf,.ppt,.pptx,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.webp,.gif';
const MAX_MB = 25;

function getFileType(file: File): UploadedFile['type'] {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  return 'other';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_ICON: Record<UploadedFile['type'], React.ReactNode> = {
  pdf: <FileText className="w-3.5 h-3.5 text-slate-950" />,
  ppt: <Presentation className="w-3.5 h-3.5 text-slate-950" />,
  image: <Image className="w-3.5 h-3.5 text-slate-950" />,
  other: <File className="w-3.5 h-3.5 text-slate-950" />,
};

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFilesChange,
  files,
  compact = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (incoming: FileList | null) => {
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

      // Generate image preview
      if (type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          item.preview = e.target?.result as string;
          onFilesChange([...files, ...valid, item]);
        };
        reader.readAsDataURL(file);
        return; // will be added via reader callback
      }
      valid.push(item);
    });

    if (valid.length > 0) onFilesChange([...files, ...valid]);
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Uploaded File Chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-full px-2.5 py-1 text-xs font-semibold text-slate-800 max-w-[200px] group"
            >
              {f.type === 'image' && f.preview ? (
                <img src={f.preview} alt={f.name} className="w-4 h-4 rounded object-cover shrink-0" />
              ) : (
                <span className="shrink-0">{TYPE_ICON[f.type]}</span>
              )}
              <span className="truncate">{f.name}</span>
              <span className="text-slate-400 font-mono shrink-0">{f.size}</span>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="ml-0.5 text-slate-400 hover:text-slate-950 transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${compact ? 'p-2 rounded-full hover:bg-slate-100' : 'p-2 rounded-full hover:bg-slate-100'} text-slate-600 hover:text-slate-950 transition-colors shrink-0`}
        title="Attach PDF, PPT, image, or document"
      >
        <Paperclip className="w-4 h-4" />
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-[10px] text-red-600 font-bold px-1">{error}</p>
      )}
    </div>
  );
};
