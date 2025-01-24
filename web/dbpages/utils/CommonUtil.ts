/**
 * 停止事件冒泡
 * @param e
 * @param prevent
 */
export function cancelEvent(e: any, prevent = false) {
  if (prevent) {
    e?.preventDefault?.();
  }
  e?.stopPropagation?.();
  return e;
}

export function getHistoryList(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('historyList') || '[]');
}

export function clearHistoryList(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('historyList', '[]');
}

export function setHistoryList(list: any[]): void {
  if (typeof window === 'undefined') return;
  const str = JSON.stringify(list);
  localStorage.setItem('historyList', str);
}
