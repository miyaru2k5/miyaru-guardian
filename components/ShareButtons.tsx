"use client";

import { useState } from "react";
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

const shareTargets = [
  {
    label: "Facebook",
    icon: Facebook,
    href: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "Twitter",
    icon: Twitter,
    href: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "LinkedIn",
    icon: Linkedin,
    href: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
];

const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {shareTargets.map((target) => {
          const Icon = target.icon;
          return (
            <a
              key={target.label}
              href={target.href(url, title)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-full border border-border/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300"
            >
              <Icon size={14} />
              {target.label}
            </a>
          );
        })}
      </div>
      <button
        type="button"
        onClick={copyLink}
        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
          copied ? "border-emerald-400 text-emerald-500" : "border-border/70 text-slate-600 hover:border-primary hover:text-primary"
        }`}
      >
        <LinkIcon size={14} />
        {copied ? "Đã sao chép" : "Sao chép liên kết"}
      </button>
    </div>
  );
};

export default ShareButtons;
