import Editor, { IExportRefFunction, IRangeType } from '@/components/chat/monaco-editor';
import { DatabaseTypeCode } from '@/dbpages/constants';
import cs from 'classnames';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useTheme } from '../../hooks';

import styles from './index.module.less';

export type IEditorIns = monaco.editor.IStandaloneCodeEditor;
export type IEditorOptions = monaco.editor.IStandaloneEditorConstructionOptions;
export type IEditorContentChangeEvent = monaco.editor.IModelContentChangedEvent;

export type IAppendValue = {
  text: any;
  range?: IRangeType;
};

const databaseTypeList = Object.keys(DatabaseTypeCode).map(d => ({
  type: d,
  id: d,
  label: d,
}));

interface IProps {
  id: string;
  language?: string;
  className?: string;
  options?: IEditorOptions;
  needDestroy?: boolean;
  addAction?: Array<{ id: string; label: string; action: (selectedText: string, ext?: string) => void }>;
  defaultValue?: string;
  appendValue?: IAppendValue;
  didMount?: (editor: IEditorIns) => any;
  shortcutKey?: (editor, monaco, isActive: boolean) => void;
  focusChange?: (isActive: boolean) => void;
}

function MonacoEditor(props: IProps, ref: ForwardedRef<any>) {
  const { id, className, language = 'sql', didMount, options, defaultValue, appendValue, shortcutKey } = props;
  const editorRef = useRef<any>();
  const editorFuncRef = useRef<IExportRefFunction | any>();
  const quickInputCommand = useRef<any>();
  const [appTheme] = useTheme();
  const [isActive, setIsActive] = React.useState(false);

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    didMount && didMount(editorRef.current);
    createAction(editorRef.current);

    const focus = () => {
      setIsActive(true);
      props.focusChange && props.focusChange(true);
    };
    const blur = () => {
      setIsActive(false);
      props.focusChange && props.focusChange(false);
    };
    editorRef.current?.onDidFocusEditorText(focus);
    editorRef.current?.onDidBlurEditorText(blur);
  };

  useEffect(() => {
    if (editorRef.current) {
      // eg:
      // editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL, () => {
      // });
      shortcutKey?.(editorRef.current, monaco, isActive);
    }
  }, [editorRef.current, isActive]);

  useEffect(() => {
    // 监听浏览器窗口大小变化，重新渲染编辑器
    const resize = () => {
      editorRef.current?.layout();
    };
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 设置报表里面的编辑器的主题
  useEffect(() => {
    if (options?.theme) {
      monaco.editor.setTheme(options.theme);
    }
  }, [options?.theme]);

  useImperativeHandle(ref, () => ({
    getCurrentSelectContent: editorFuncRef.current?.getCurrentSelectContent,
    getAllContent: editorFuncRef.current?.getAllContent,
    setValue: editorFuncRef.current?.setValue,
    // toFocus,
  }));

  useEffect(() => {
    if (appendValue) {
      editorFuncRef.current?.appendMonacoValue(editorRef.current, appendValue?.text, appendValue?.range);
    }
  }, [appendValue]);

  const createAction = (editor: IEditorIns) => {
    // 用于控制切换该菜单键的显示
    editor.createContextKey('shouldShowSqlRunnerAction', true);

    if (!props.addAction || !props.addAction.length) {
      return;
    }

    props.addAction.forEach(action => {
      const { id: _id, label, action: runFn } = action;
      editor.addAction({
        id: _id,
        label,
        // 控制该菜单键显示
        precondition: 'shouldShowSqlRunnerAction',
        // 该菜单键位置
        contextMenuGroupId: 'navigation',
        contextMenuOrder: 1.5,
        // 点击该菜单键后运行
        run: (ed: IEditorIns) => {
          const selectedText = editor.getModel()?.getValueInRange(editor.getSelection()!) || '';
          if (_id === 'changeSQL') {
            ed.trigger('', quickInputCommand.current, quickInput => {
              quickInput.pick(databaseTypeList).then(selected => {
                runFn(selectedText, selected?.label);
              });
            });
          } else {
            runFn(selectedText);
          }
        },
      });
    });
  };

  return (
    <Editor
      ref={editorFuncRef}
      value={defaultValue || ''}
      language={language}
      onEditorMount={handleEditorMount}
      className={cs(className, styles.editorContainer)}
    />
  );
}

export default forwardRef(MonacoEditor);
