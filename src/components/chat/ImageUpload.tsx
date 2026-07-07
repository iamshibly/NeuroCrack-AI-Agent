import { Paperclip } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Props = {
  onImageSelect: (file: File | null) => void;
  onError?: (msg: string | null) => void;
  disabled?: boolean;
};

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are supported.";
  }
  if (file.size > MAX_BYTES) {
    return `Image too large — max 4 MB (this file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  return null;
}

export function ImageUploadButton({ onImageSelect, onError, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = ""; // allow re-selecting the same file
    if (!file) {
      onImageSelect(null);
      return;
    }
    const error = validateImageFile(file);
    if (error) {
      onError?.(error);
      return;
    }
    onError?.(null);
    onImageSelect(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        title="Attach image (JPEG, PNG, WebP, GIF — max 4 MB)"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
    </>
  );
}
