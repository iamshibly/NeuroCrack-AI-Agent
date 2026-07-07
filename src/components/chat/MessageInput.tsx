import { Send, X, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { ClassSubjectSelector } from "@/components/chat/ClassSubjectSelector";
import { ImageUploadButton, validateImageFile } from "@/components/chat/ImageUpload";
import { requiresChapter } from "@/lib/classSubjectOptions";

type Props = {
  onSend: (text: string, image?: File | null) => void;
  disabled?: boolean;
  selectedClass: string | null;
  selectedSubject: string | null;
  selectedChapter: string | null;
  onClassChange: (cls: string) => void;
  onSubjectChange: (subject: string) => void;
  onChapterChange: (chapter: string) => void;
  presetText?: string;
  presetKey?: number;
};

function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.round(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MessageInput({
  onSend,
  disabled,
  selectedClass,
  selectedSubject,
  selectedChapter,
  onClassChange,
  onSubjectChange,
  onChapterChange,
  presetText,
  presetKey,
}: Props) {
  const [value, setValue] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Welcome-screen suggestion card selected — prefill the composer and focus it
  useEffect(() => {
    if (presetKey === undefined) return;
    setValue(presetText ?? "");
    ref.current?.focus();
  }, [presetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const chapterRequired = requiresChapter(selectedClass, selectedSubject);
  const chapterReady = !chapterRequired || !!selectedChapter;
  const hasContent = !!value.trim() || !!image;
  const canSend = !!selectedClass && !!selectedSubject && chapterReady && hasContent;
  const inputDisabled = !selectedClass || !selectedSubject || !chapterReady || disabled;

  const placeholder = !selectedClass
    ? "Select your class first"
    : !selectedSubject
      ? "Select your subject"
      : chapterRequired && !selectedChapter
        ? "Select your chapter"
        : "Ask your doubt…";

  const clearImage = () => {
    setImage(null);
    setPreviewUrl(null);
    setImageError(null);
  };

  const handleImageSelect = (file: File | null) => {
    setImage(file);
    setImageError(null);
  };

  const handleImageError = (msg: string | null) => {
    setImageError(msg);
    if (msg) setImage(null);
  };

  // Capture images pasted from clipboard into the textarea
  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imgItem = items.find((item) => item.type.startsWith("image/"));
    if (!imgItem) return;
    e.preventDefault();
    const file = imgItem.getAsFile();
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setImageError(error);
      return;
    }
    setImageError(null);
    setImage(file);
  };

  const submit = () => {
    if (!canSend || disabled) return;
    onSend(value.trim(), image);
    setValue("");
    clearImage();
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 md:pb-6">
      {/* Class / Subject / Chapter selectors */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <ClassSubjectSelector
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          selectedChapter={selectedChapter}
          onClassChange={onClassChange}
          onSubjectChange={onSubjectChange}
          onChapterChange={onChapterChange}
        />
      </div>

      {/* Input card */}
      <div
        className="relative flex flex-col bg-card border border-border rounded-3xl p-2 transition-shadow focus-within:ring-2 focus-within:ring-ring/40"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {/* Image preview row */}
        {previewUrl && image && (
          <div className="px-2 pt-1 pb-2 flex items-start gap-2">
            <div className="relative inline-block shrink-0">
              <img
                src={previewUrl}
                alt="Attached image"
                className="h-16 w-auto max-w-[120px] rounded-xl object-cover border border-border"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-col justify-center min-w-0 mt-1">
              <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                {image.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatBytes(image.size)}
              </span>
            </div>
          </div>
        )}

        {/* Textarea + actions row */}
        <div className="flex items-end gap-1 pl-2">
          <ImageUploadButton
            onImageSelect={handleImageSelect}
            onError={handleImageError}
            disabled={inputDisabled}
          />
          <textarea
            ref={ref}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 200) + "px";
            }}
            onKeyDown={onKey}
            onPaste={onPaste}
            rows={1}
            placeholder={placeholder}
            disabled={inputDisabled}
            className="flex-1 resize-none bg-transparent outline-none py-2.5 text-sm placeholder:text-muted-foreground max-h-[200px] disabled:cursor-not-allowed"
          />
          <Button
            type="button"
            size="icon"
            onClick={submit}
            disabled={disabled || !canSend}
            className="h-10 w-10 rounded-2xl shrink-0 text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image validation error */}
      {imageError && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-destructive px-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{imageError}</span>
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground mt-2">
        <img src="/bytestone-icon.svg" alt="" className="h-3 w-auto shrink-0" />
        1 ByteStone per prompt · Always verify important answers
      </p>
    </div>
  );
}
