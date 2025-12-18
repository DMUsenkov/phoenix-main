import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';

interface RichTextRendererProps {
  content: unknown;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {

  const { parsedContent, isPlainText } = useMemo(() => {
    let parsed: Record<string, unknown> | null = null;
    let plainText = false;

    if (typeof content === 'string') {
      try {

        const jsonParsed = JSON.parse(content);

        if (jsonParsed && typeof jsonParsed === 'object' && jsonParsed.type) {
          parsed = jsonParsed as Record<string, unknown>;
        } else {
          plainText = true;
        }
      } catch {
        plainText = true;
      }
    } else if (content && typeof content === 'object') {
      const obj = content as Record<string, unknown>;
      if (obj.type) {
        parsed = obj;
      } else {
        plainText = true;
      }
    } else if (!content) {
      plainText = true;
    }

    return { parsedContent: parsed, isPlainText: plainText };
  }, [content]);


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-phoenix-400 underline hover:text-phoenix-300 transition-colors',
        },
      }),
      Underline,
    ],
    content: parsedContent,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'max-w-none focus:outline-none',

          '[&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-6 [&_h1]:mt-8 first:[&_h1]:mt-0',
          '[&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mb-4 [&_h2]:mt-8 first:[&_h2]:mt-0',
          '[&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mb-3 [&_h3]:mt-6 first:[&_h3]:mt-0',

          '[&_p]:text-lg [&_p]:text-zinc-300 [&_p]:leading-relaxed [&_p]:mb-4 last:[&_p]:mb-0',

          '[&_a]:text-phoenix-400 [&_a]:underline [&_a]:decoration-phoenix-500/30',
          'hover:[&_a]:text-phoenix-300 hover:[&_a]:decoration-phoenix-400',

          '[&_strong]:text-white [&_strong]:font-bold',
          '[&_em]:text-phoenix-200 [&_em]:italic',
          '[&_u]:underline [&_u]:decoration-phoenix-400/50',

          '[&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:ml-6 [&_ul]:list-disc',
          '[&_ol]:mb-6 [&_ol]:space-y-2 [&_ol]:ml-6 [&_ol]:list-decimal',
          '[&_li]:text-zinc-300 [&_li]:marker:text-phoenix-400',

          '[&_blockquote]:my-6 [&_blockquote]:p-6 [&_blockquote]:rounded-xl',
          '[&_blockquote]:bg-gradient-to-br [&_blockquote]:from-phoenix-500/10',
          '[&_blockquote]:via-purple-500/5 [&_blockquote]:to-transparent',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-phoenix-500',
          '[&_blockquote]:italic [&_blockquote]:text-zinc-200',

          '[&_code]:text-phoenix-300 [&_code]:bg-black/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
          '[&_pre]:my-6 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:bg-black/50',
          '[&_pre]:border [&_pre]:border-white/10 [&_pre]:overflow-x-auto',
          className
        ),
      },
    },
  });


  useEffect(() => {
    if (editor && parsedContent) {
      editor.commands.setContent(parsedContent);
    }
  }, [editor, parsedContent]);


  if (isPlainText || !editor) {
    const text = typeof content === 'string' ? content : '';
    if (!text) return null;
    return (
      <div className="text-lg text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  }

  return <EditorContent editor={editor} />;
}
