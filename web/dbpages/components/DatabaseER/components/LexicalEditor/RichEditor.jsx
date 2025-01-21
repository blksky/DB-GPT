import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import AutoLinkPlugin from './AutoLinkPlugin';
import CodeHighlightPlugin from './CodeHighlightPlugin';
import ListMaxIndentLevelPlugin from './ListMaxIndentLevelPlugin';
import ToolbarPlugin from './ToolbarPlugin';
import './styles/index.css';

function Placeholder({ text }) {
  return <div className='editor-placeholder'>{text || ''}</div>;
}

export default function RichEditor({ theme, placeholder }) {
  return (
    <div className='editor-container'>
      <ToolbarPlugin theme={theme} />
      <div className='editor-inner'>
        <RichTextPlugin
          contentEditable={<ContentEditable className='editor-input' />}
          placeholder={<Placeholder text={placeholder} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <ClearEditorPlugin />
      </div>
    </div>
  );
}
