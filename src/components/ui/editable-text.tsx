import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}

export const EditableText = ({
  value,
  onSave,
  className,
  inputClassName,
  placeholder = "Click to edit...",
  multiline = false,
  disabled = false,
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? "textarea" : "input";
    return (
      <div className="flex items-start gap-2">
        <InputComponent
          ref={inputRef as any}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-secondary border border-primary/30 rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none",
            multiline && "min-h-[80px]",
            inputClassName
          )}
          rows={multiline ? 3 : undefined}
        />
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group inline-flex items-center gap-2 cursor-pointer rounded-lg transition-colors",
        !disabled && "hover:bg-secondary/50 -mx-2 px-2 py-0.5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      title={disabled ? undefined : "Double-click to edit"}
    >
      <span className={cn(!value && "text-muted-foreground italic")}>
        {value || placeholder}
      </span>
      {!disabled && isHovered && (
        <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  );
};

interface EditableTagsProps {
  values: string[];
  onSave: (values: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export const EditableTags = ({
  values,
  onSave,
  className,
  disabled = false,
}: EditableTagsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(values.join(", "));
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(values.join(", "));
  }, [values]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const newValues = editValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (JSON.stringify(newValues) !== JSON.stringify(values)) {
      onSave(newValues);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(values.join(", "));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder="Enter tags separated by commas..."
          className="flex-1 bg-secondary border border-primary/30 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleSave}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex flex-wrap items-center gap-2 cursor-pointer rounded-lg transition-colors",
        !disabled && "hover:bg-secondary/50 -mx-2 px-2 py-1",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
      title={disabled ? undefined : "Double-click to edit"}
    >
      {values.length > 0 ? (
        values.map((value) => (
          <span
            key={value}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            {value}
          </span>
        ))
      ) : (
        <span className="text-muted-foreground italic text-sm">No tags</span>
      )}
      {!disabled && isHovered && (
        <Pencil className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
    </div>
  );
};
