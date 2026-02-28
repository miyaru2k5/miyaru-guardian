import { useEffect, useState, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearchChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar = ({
  onSearchChange,
  placeholder = "Tìm kiếm giao dịch viên...",
  debounceMs = 300,
}: SearchBarProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const id = window.setTimeout(() => {
      onSearchChange(value.trim());
    }, debounceMs);

    return () => window.clearTimeout(id);
  }, [value, onSearchChange, debounceMs]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [],
  );

  const handleClear = useCallback(() => {
    setValue("");
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-2 rounded-full bg-card/80 border border-border px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-md transition-all
        focus-within:border-[#ff2d7a] focus-within:shadow-[0_0_0_1px_rgba(255,45,122,0.7),0_0_18px_rgba(255,45,122,0.25)]"
      >
        <Search
          size={18}
          className="shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          aria-label="Tìm kiếm giao dịch viên"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-[rgba(148,163,184,0.16)] transition-colors"
            aria-label="Xóa nội dung tìm kiếm"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

