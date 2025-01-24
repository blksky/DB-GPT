import { FC, useEffect, useRef, useState } from 'react';
import { ITerminalAddon, Terminal } from 'xterm';
// import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';
// @ts-ignore
import elementResizeEvent from 'element-resize-event';
import 'xterm/css/xterm.css';
import styles from './PipelineLog.module.less';

/**
 * 延时等待若干毫秒
 * @param ms
 */
export async function waitTimeout(ms: number) {
  await new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

type PipelineLogProps = {
  log?: string;
};

const PipelineLog: FC<PipelineLogProps> = props => {
  const breakRef = useRef<boolean>(false);
  const terminalRef = useRef<Terminal>();
  const terminalDomRef = useRef<HTMLElement | any>();
  const [logInfo, setLogInfo] = useState<{ list: string[]; curIndex: number; initMsg: boolean }>({
    list: [],
    curIndex: 0,
    initMsg: false,
  });
  const logInfoRef = useRef(logInfo);

  const handleUpdateLogInfo = (value: { list: string[]; curIndex: number; initMsg: boolean }) => {
    logInfoRef.current = value;
    setLogInfo(value);
  };

  const refreshLog = () => {
    if (!terminalRef.current) return;
    const logList = props.log?.split('\n') || [];
    const { curIndex } = logInfoRef.current;
    const writeList = logList.slice(curIndex);
    // if (!initMsg) {
    //   terminalRef.current?.writeln('\x1B[43;31m日志内容\x1B[0m');
    // }
    writeList.forEach(d => terminalRef.current?.writeln(d));
    handleUpdateLogInfo({ list: logList, curIndex: logList.length, initMsg: true });
  };

  useEffect(() => refreshLog(), [props.log]);

  useEffect(() => {
    const isWindows =
      ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(typeof window !== 'undefined' ? navigator.platform : 'Windows') >=
      0;
    const terminal = new Terminal({
      windowsMode: isWindows,
      rows: 10,
      fontFamily: 'Fira Code, courier-new, courier, monospace',
    });
    terminalRef.current = terminal;
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    // const attachAddon = new AttachAddon(new WebSocket('127.0.0.1', '9000'));
    terminal.loadAddon(fitAddon as ITerminalAddon);
    // terminal.loadAddon(attachAddon as ITerminalAddon);
    terminal.loadAddon(searchAddon as ITerminalAddon);
    terminal.loadAddon(new WebLinksAddon() as ITerminalAddon);
    const terminalDom = terminalDomRef.current as HTMLElement;
    if (terminalDom) {
      terminal.open(terminalDom);
      fitAddon.fit();
      refreshLog();
    }
    elementResizeEvent(terminalDomRef.current, () =>
      setTimeout(() => {
        fitAddon.fit();
      }, 1000),
    );
    return () => {
      breakRef.current = true;
    };
  }, []);
  return <div ref={terminalDomRef} className={styles['pipeline-log-text']} />;
};

export default PipelineLog;
