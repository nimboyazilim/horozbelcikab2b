'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Quill dynamic import (SSR kapalı)
const QuillWrapper = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return function QuillComponent(props: any) {
      return <RQ {...props} />;
    };
  },
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'İçerik giriniz...',
  height = 400
}) => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dark mode dinleme
  useEffect(() => {
    if (!mounted) return;

    const html = document.documentElement;
    const checkDark = () => setIsDarkMode(html.classList.contains('dark'));

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(html, { attributes: true });

    return () => observer.disconnect();
  }, [mounted]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      [{ color: [] }, { background: [] }],
      ['clean']
    ]
  };

  if (!mounted) return null;

  return (
    <div className={`rich-text-editor ${isDarkMode ? 'dark-theme' : ''}`}>
      <style jsx global>{`
        .rich-text-editor .ql-container {
          height: ${height - 42}px;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Helvetica Neue, Arial, sans-serif;
        }

        .rich-text-editor .ql-editor {
          padding: 16px;
        }

        .rich-text-editor.dark-theme .ql-toolbar {
          background-color: #2d3748;
          border-color: #4a5568;
        }

        .rich-text-editor.dark-theme .ql-container {
          border-color: #4a5568;
        }

        .rich-text-editor.dark-theme .ql-editor {
          background-color: #1a202c;
          color: #e2e8f0;
        }

        .rich-text-editor.dark-theme .ql-stroke {
          stroke: #e2e8f0;
        }

        .rich-text-editor.dark-theme .ql-fill {
          fill: #e2e8f0;
        }

        .rich-text-editor.dark-theme .ql-picker-label {
          color: #e2e8f0;
        }

        .rich-text-editor.dark-theme .ql-picker-options {
          background-color: #2d3748;
          border-color: #4a5568;
        }
      `}</style>

      <QuillWrapper
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
