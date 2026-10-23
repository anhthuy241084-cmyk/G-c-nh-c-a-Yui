import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AutoLinkTextProps {
  text?: string | null;
  className?: string;
  linkClassName?: string;
  showIcon?: boolean;
}

// Regex to detect URLs (http://, https://, or www. followed by valid domain)
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s])/gi;

export const AutoLinkText: React.FC<AutoLinkTextProps> = ({
  text,
  className = '',
  linkClassName = 'text-[#1B6E7D] hover:text-[#0E4B56] dark:text-[#7DD8DE] dark:hover:text-[#A9DDE2] underline decoration-[#8CCFD3]/70 hover:decoration-[#1B6E7D] font-medium hover:opacity-95 inline-flex items-center gap-0.5 break-all transition-colors',
  showIcon = true,
}) => {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchedUrl = match[0];

    // Push text before the URL
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // Determine complete href (add https:// if only www. was specified)
    const href = matchedUrl.startsWith('http://') || matchedUrl.startsWith('https://')
      ? matchedUrl
      : `https://${matchedUrl}`;

    parts.push(
      <a
        key={`${matchIndex}-${matchedUrl}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          // Stop propagation so clicking link doesn't trigger card selection or modal closure
          e.stopPropagation();
        }}
        className={linkClassName}
        title={`Mở liên kết: ${href}`}
      >
        <span>{matchedUrl}</span>
        {showIcon && <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80 ml-0.5" />}
      </a>
    );

    lastIndex = matchIndex + matchedUrl.length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <span className={className}>
      {parts}
    </span>
  );
};
