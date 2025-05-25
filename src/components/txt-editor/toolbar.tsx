import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft,
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  List, 
  ListOrdered,
  Strikethrough,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editor: Editor;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) {
    return null;
  }

  const toolbarItems = [
    {
      icon: <Bold className="h-5 w-5" />,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      icon: <Italic className="h-5 w-5" />,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      icon: <Underline className="h-5 w-5" />,
      title: 'Underline',
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
    },
    {
      icon: <Strikethrough className="h-5 w-5" />,
      title: 'Strikethrough',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
    },
    { type: 'divider' },
    {
      icon: <List className="h-5 w-5" />,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      icon: <ListOrdered className="h-5 w-5" />,
      title: 'Numbered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
    },
    { type: 'divider' },
    {
      icon: <AlignLeft className="h-5 w-5" />,
      title: 'Align Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
    },
    {
      icon: <AlignCenter className="h-5 w-5" />,
      title: 'Align Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
    },
    {
      icon: <AlignRight className="h-5 w-5" />,
      title: 'Align Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
    },
    {
      icon: <AlignJustify className="h-5 w-5" />,
      title: 'Justify',
      action: () => editor.chain().focus().setTextAlign('justify').run(),
      isActive: editor.isActive({ textAlign: 'justify' }),
    },
    { type: 'divider' },
    {
      icon: <Undo className="h-5 w-5" />,
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
      isDisabled: () => !editor.can().undo(),
    },
    {
      icon: <Redo className="h-5 w-5" />,
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
      isDisabled: () => !editor.can().redo(),
    },
  ];

  return (
    <div className="toolbar bg-muted/30 border-input border-b p-1 flex flex-wrap gap-1 sticky top-0 z-10 mb-2">
      {toolbarItems.map((item, index) => (
        item.type === 'divider' ? (
          <div key={index} className="h-6 w-px bg-muted mx-1" />
        ) : (
          <Button
            key={index}
            onClick={item.action}
            size="sm"
            variant="ghost"
            className={cn(
              "h-8 w-8 p-0",
              item.isActive && "bg-muted",
              item.isDisabled?.() && "opacity-50 cursor-not-allowed"
            )}
            disabled={item.isDisabled?.()}
            title={item.title}
          >
            {item.icon}
          </Button>
        )
      ))}
    </div>
  );
};

export default Toolbar;