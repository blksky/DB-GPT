import { useEffect, useState } from 'react';
import Locale from './chatLocales';
import { showToast } from './components/ui-lib';

export function trimTopic(topic: string) {
  return topic.replace(/[，。！？”“"、,.!?]*$/, '');
}

export async function copyToClipboard(text: string) {
  try {
    // @ts-ignore
    if (window.__TAURI__) {
      // @ts-ignore
      window.__TAURI__.writeText(text);
    } else if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(text);
    }

    showToast(Locale.Copy.Success);
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export async function downloadAs(text: string, filename: string) {
  if (window.__TAURI__) {
    const result = await window.__TAURI__.dialog.save({
      defaultPath: `${filename}`,
      filters: [
        {
          name: `${filename.split('.').pop()} files`,
          extensions: [`${filename.split('.').pop()}`],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    if (result !== null) {
      try {
        await window.__TAURI__.fs.writeBinaryFile(result, new Uint8Array([...text].map(c => c.charCodeAt(0))));
        showToast(Locale.Download.Success);
      } catch (error) {
        showToast(Locale.Download.Failed);
      }
    } else {
      showToast(Locale.Download.Failed);
    }
  } else {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

export function readFromFile() {
  return new Promise<string>((res, rej) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        res(e.target.result);
      };
      fileReader.onerror = e => rej(e);
      fileReader.readAsText(file);
    };

    fileInput.click();
  });
}

export function isIOS() {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: typeof window === 'undefined' ? 0 : window.innerWidth,
        height: typeof window === 'undefined' ? 0 : window.innerHeight,
      });
    };

    typeof window !== 'undefined' && window.addEventListener('resize', onResize);

    return () => {
      typeof window !== 'undefined' && window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}

export const MOBILE_MAX_WIDTH = 600;

export function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}

export function isFirefox() {
  return typeof window !== 'undefined' && /firefox/i.test(navigator.userAgent);
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = typeof window !== 'undefined' && window.getSelection();

  if (currentSelection?.type === 'Range') {
    return false;
  }

  copyToClipboard(content);

  return true;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = (typeof window !== 'undefined' && window.getComputedStyle(dom)) as any;
  const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);

  if (!dom) {
    dom = document.createElement('span');
    dom.style.position = 'absolute';
    dom.style.wordBreak = 'break-word';
    dom.style.fontSize = '14px';
    dom.style.transform = 'translateY(-200vh)';
    dom.style.pointerEvents = 'none';
    dom.style.opacity = '0';
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }

  return dom!;
}

export function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom('__measure');
  const singleLineDom = getOrCreateMeasureDom('__single_measure', dom => {
    dom.innerText = 'TEXT_FOR_MEASURE';
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + 'px';
  measureDom.innerText = dom.value !== '' ? dom.value : '1';
  measureDom.style.fontSize = dom.style.fontSize;
  const endWithEmptyLine = dom.value.endsWith('\n');
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(window.getComputedStyle(singleLineDom).height);

  const rows = Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

/**
 * Detects Macintosh
 */
export function isMacOS(): boolean {
  if (typeof window !== 'undefined') {
    let userAgent = window.navigator.userAgent.toLocaleLowerCase();
    const macintosh = /iphone|ipad|ipod|macintosh/.test(userAgent);
    return !!macintosh;
  }
  return false;
}
