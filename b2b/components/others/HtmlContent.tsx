'use client';

interface HtmlContentProps {
  content: string;
  className?: string;
}

export default function HtmlContent({ content, className = "" }: HtmlContentProps) {
  if (!content) {
    return (
      <div className={`text-gray-500 italic ${className}`}>
        İçerik bulunamadı.
      </div>
    );
  }

  return (
    <div 
      className={`text-gray-800 leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-sm [&_strong]:font-semibold [&_span]:text-gray-700 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
} 