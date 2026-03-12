"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filter, ChevronDown, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown = ({ options, value, onChange }: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selectedIndex = useMemo(
    () => options.findIndex(option => option.value === value),
    [options, value],
  );

  const hasFilterApplied = value !== options[0]?.value;

  const openDropdown = useCallback(() => {
    if (!open) {
      setOpen(true);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (option: FilterOption) => {
      onChange(option.value);
      closeDropdown();
      buttonRef.current?.focus();
    },
    [onChange, closeDropdown],
  );

  const handleToggle = useCallback(() => {
    if (open) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [open, openDropdown, closeDropdown]);

  const handleClearFilter = useCallback(() => {
    if (options[0]) {
      onChange(options[0].value);
    }
    closeDropdown();
    buttonRef.current?.focus();
  }, [closeDropdown, onChange, options]);

  const moveHighlight = useCallback(
    (direction: 1 | -1) => {
      setHighlightedIndex(prev => {
        if (!open) return prev;
        const maxIndex = options.length - 1;
        if (maxIndex < 0) return -1;
        let next = prev;
        if (next < 0) {
          next = direction === 1 ? 0 : maxIndex;
        } else {
          next = next + direction;
          if (next > maxIndex) next = 0;
          if (next < 0) next = maxIndex;
        }
        return next;
      });
    },
    [open, options.length],
  );

  const handleButtonKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else {
          moveHighlight(event.key === "ArrowDown" ? 1 : -1);
        }
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!open) {
          openDropdown();
        } else if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex]);
        }
      } else if (event.key === "Escape") {
        if (open) {
          event.stopPropagation();
          closeDropdown();
        }
      }
    },
    [open, openDropdown, closeDropdown, highlightedIndex, options, moveHighlight, handleSelect],
  );

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        moveHighlight(event.key === "ArrowDown" ? 1 : -1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex]);
        }
      } else if (event.key === "Escape") {
        event.stopPropagation();
        closeDropdown();
      }
    },
    [closeDropdown, highlightedIndex, options, moveHighlight, handleSelect],
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeDropdown]);

  const selectedLabel =
    options.find(option => option.value === value)?.label ?? options[0]?.label ?? "Tất cả danh mục";

  return (
    <div
      ref={rootRef}
      className="relative inline-flex w-full flex-col items-end gap-1"
    >
      <button
        type="button"
        ref={buttonRef}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        className="inline-flex items-center justify-between gap-2 rounded-2xl bg-card/90 border border-border px-3 py-2 text-xs sm:text-sm text-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2d7a] focus-visible:ring-offset-0"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Lọc theo danh mục giao dịch viên"
      >
        <div className="flex items-center gap-2">
          <Filter
            size={16}
            className={hasFilterApplied ? "text-[#ff2d7a]" : "text-muted-foreground"}
            aria-hidden="true"
          />
          <span className="font-medium truncate max-w-[120px] sm:max-w-[160px]">
            {selectedLabel}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full mt-2 z-50 w-full md:w-56 rounded-2xl border border-border bg-card p-1 shadow-xl backdrop-blur-lg"
            role="listbox"
            aria-label="Danh sách danh mục giao dịch viên"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => {
                const isActive = option.value === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm text-left transition-colors ${
                      isHighlighted
                        ? "bg-[#ff2d7a]/15 text-foreground"
                        : "text-muted-foreground hover:bg-[rgba(148,163,184,0.12)] hover:text-foreground"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-[#ff2d7a]/20 via-[#ff2d7a]/10 to-transparent text-foreground"
                        : ""
                    }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="truncate">{option.label}</span>
                    {isActive && (
                      <span className="ml-2 rounded-full bg-[#ff2d7a]/20 px-2 py-0.5 text-[10px] font-semibold text-[#ff2d7a]">
                        Đang chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {hasFilterApplied && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium text-muted-foreground hover:bg-[rgba(148,163,184,0.12)] hover:text-foreground transition-colors"
              >
                <XCircle size={12} />
                Xóa bộ lọc
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;

