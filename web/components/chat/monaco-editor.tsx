import { ChatContext } from '@/app/chat-context';
import { formatSql } from '@/utils';
import Editor, { OnChange, loader } from '@monaco-editor/react';
import { useLatest } from 'ahooks';
import classNames from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { ForwardedRef, forwardRef, useContext, useImperativeHandle, useMemo, useRef } from 'react';
import { register } from './ob-editor/ob-plugin';
import { getModelService } from './ob-editor/service';
import { github, githubDark } from './ob-editor/theme';

loader.config({ monaco });

export interface ISession {
  getTableList: (schemaName?: string) => Promise<string[]>;
  getTableColumns: (tableName: string) => Promise<{ columnName: string; columnType: string }[]>;
  getSchemaList: () => Promise<string[]>;
}

interface MonacoEditorProps {
  className?: string;
  value: string;
  language: string;
  onChange?: OnChange;
  thoughts?: string;
  session?: ISession;
  onEditorMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

monaco.editor.defineTheme('github', github as any);
monaco.editor.defineTheme('githubDark', githubDark as any);

// text 需要添加的文本
// range 添加到的位置
// 'end' 末尾
// 'front' 开头
// 'cover' 覆盖掉原有的文字
// 自定义位置数组 new monaco.Range []
export type IRangeType = 'end' | 'front' | 'cover' | 'reset' | any;

export interface IExportRefFunction {
  editorRef: any;
  appendMonacoValue: any;
  getCurrentSelectContent: () => string;
  getAllContent: () => string;
  setValue: (text: any, range?: IRangeType) => void;
  // toFocus: () => void;
}

const MonacoEditor = (
  { className, value, language = 'mysql', onChange, thoughts, session, onEditorMount }: MonacoEditorProps,
  ref: ForwardedRef<IExportRefFunction>,
) => {
  const editorRef = useRef<any>(null);

  // merge value and thoughts

  const editorValue = useMemo(() => {
    if (language !== 'mysql') {
      return value;
    }
    if (thoughts && thoughts.length > 0) {
      return formatSql(`-- ${thoughts} \n${value}`);
    }
    return formatSql(value);
  }, [value, thoughts]);

  const sessionRef = useLatest(session);

  const context = useContext(ChatContext);

  async function pluginRegister(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    const plugin = await register();
    plugin.setModelOptions(
      editor.getModel()?.id || '',
      getModelService(
        {
          modelId: editor.getModel()?.id || '',
          delimiter: ';',
        },
        () => sessionRef.current || null,
      ),
    );
  }

  /**
   * 获取当前选中的内容
   * @returns
   */
  const getCurrentSelectContent = () => {
    const selection = editorRef.current?.getSelection();
    if (!selection || selection.isEmpty()) {
      return '';
    } else {
      const selectedText = editorRef.current?.getModel()?.getValueInRange(selection);
      return selectedText || '';
    }
  };

  /** 获取文本所有内容 */
  const getAllContent = () => {
    const model = editorRef.current?.getModel();
    const value = model?.getValue();
    return value || '';
  };

  const setValue = (text: any, range?: IRangeType) => {
    appendMonacoValue(editorRef.current, text, range);
  };

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    onEditorMount?.(editor);
    pluginRegister(editor);
  };

  useImperativeHandle(ref, () => ({
    editorRef: editorRef,
    appendMonacoValue,
    getCurrentSelectContent,
    getAllContent,
    setValue,
  }));

  return (
    <Editor
      className={classNames(className)}
      onMount={handleEditorMount}
      value={editorValue}
      defaultLanguage={language}
      onChange={onChange}
      theme={context?.mode !== 'dark' ? 'github' : 'githubDark'}
      options={{
        minimap: {
          enabled: false,
        },
        wordWrap: 'on',
      }}
    />
  );
};

export const appendMonacoValue = (editor: any, text: any, range: IRangeType = 'end') => {
  if (!editor) {
    return;
  }
  const model = editor?.getModel && editor.getModel(editor);
  // 创建编辑操作，将当前文档内容替换为新内容
  let newRange: IRangeType = range;
  if (range === 'reset') {
    editor.setValue(text || '');
    return;
  }
  let newText = text;
  const lastLine = editor.getModel().getLineCount();
  const lastLineLength = editor.getModel().getLineMaxColumn(lastLine);

  switch (range) {
    // 覆盖所有内容
    case 'cover':
      newRange = model.getFullModelRange();
      editor.revealLine(lastLine);
      break;
    // 在开头添加内容
    case 'front':
      newRange = new monaco.Range(1, 1, 1, 1);
      editor.revealLine(1);
      editor.setPosition({ lineNumber: 1, column: 1 });
      break;
    // 格式化选中区域的sql
    case 'select': {
      const selection = editor.getSelection();
      if (selection) {
        newRange = new monaco.Range(
          selection.startLineNumber,
          selection.startColumn,
          selection.endLineNumber,
          selection.endColumn,
        );
      }
      break;
    }
    // 在末尾添加内容
    case 'end':
      newRange = new monaco.Range(lastLine, lastLineLength, lastLine, lastLineLength);
      newText = `${text}`;
      break;
    // 在光标处添加内容
    case 'cursor':
      {
        const position = editor.getPosition();
        if (position) {
          newRange = new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column);
        }
      }
      break;
    default:
      break;
  }

  const op = {
    range: newRange,
    text: newText,
  };

  // decorations?: IModelDeltaDecoration[]: 一个数组类型的参数，用于指定插入的文本的装饰。可以用来设置文本的样式、颜色、背景色等。如果不需要设置装饰，可以忽略此参数。
  const decorations = [{}]; // 解决新增的文本默认背景色为灰色
  editor.executeEdits('setValue', [op], decorations);
  const addedLastLine = editor.getModel().getLineCount();
  // const addedLastLineLength = editor.getModel().getLineMaxColumn(lastLine);

  if (range === 'end') {
    setTimeout(() => {
      editor.revealLine(addedLastLine + 1);
      // editor.setPosition({ lineNumber: addedLastLine, column: addedLastLineLength });
      // editor.focus();
    }, 0);
  }
};

export default forwardRef(MonacoEditor);
