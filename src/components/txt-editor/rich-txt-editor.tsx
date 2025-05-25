import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState } from "react";
import Toolbar from "./toolbar";
import "./editor.css";

interface RichTextEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

const RichTextEditor = ({
  initialContent = "<p>Start writing something brilliant...</p>",
  onChange,
}: RichTextEditorProps) => {
  const [content, setContent] = useState<string>(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== content) {
      editor.commands.setContent(initialContent);
      setContent(initialContent);
    }
  }, [editor, initialContent]);

  return (
    <div className="rich-text-editor bg-white  border max-h-64 flex flex-col overflow-hidden">
      {editor && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        placeholder="Write About Your Company"
        defaultValue={initialContent}
        className="overflow-y-auto min-h-64 editor-content flex-grow prose prose-sm p-2"
      />
    </div>
  );
};

export default RichTextEditor;
