import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLASS_OPTIONS,
  SUBJECTS_BY_CLASS,
  type ClassOption,
  getChapterOptions,
  requiresChapter,
} from "@/lib/classSubjectOptions";
import { cn } from "@/lib/utils";

const PILL_TRIGGER =
  "h-8 gap-1.5 text-xs font-medium rounded-full border-border bg-secondary/70 w-auto min-w-[120px] max-w-[220px] hover:bg-secondary transition-colors";

type Props = {
  selectedClass: string | null;
  selectedSubject: string | null;
  selectedChapter: string | null;
  onClassChange: (cls: string) => void;
  onSubjectChange: (subject: string) => void;
  onChapterChange: (chapter: string) => void;
};

export function ClassSubjectSelector({
  selectedClass,
  selectedSubject,
  selectedChapter,
  onClassChange,
  onSubjectChange,
  onChapterChange,
}: Props) {
  const subjects =
    selectedClass && selectedClass in SUBJECTS_BY_CLASS
      ? SUBJECTS_BY_CLASS[selectedClass as ClassOption]
      : [];

  const chapters = getChapterOptions(selectedClass, selectedSubject);
  const showChapter = requiresChapter(selectedClass, selectedSubject);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={selectedClass ?? ""}
        onValueChange={(val) => {
          onClassChange(val);
          onSubjectChange("");
          onChapterChange("");
        }}
      >
        <SelectTrigger className={PILL_TRIGGER}>
          <Lock className="h-3 w-3 shrink-0 opacity-60" />
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {CLASS_OPTIONS.map((cls) => (
            <SelectItem key={cls} value={cls} className="text-xs">
              {cls}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedSubject ?? ""}
        onValueChange={(val) => {
          onSubjectChange(val);
          onChapterChange("");
        }}
        disabled={!selectedClass}
      >
        <SelectTrigger className={cn(PILL_TRIGGER, "disabled:opacity-40")}>
          <SelectValue placeholder="Select subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((sub) => (
            <SelectItem key={sub} value={sub} className="text-xs">
              {sub}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showChapter && (
        <Select
          value={selectedChapter ?? ""}
          onValueChange={onChapterChange}
        >
          <SelectTrigger className={cn(PILL_TRIGGER, "min-w-[140px] max-w-[260px]")}>
            <SelectValue placeholder="Select chapter" />
          </SelectTrigger>
          <SelectContent>
            {chapters.map((ch) => (
              <SelectItem key={ch} value={ch} className="text-xs">
                {ch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
