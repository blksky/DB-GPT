import { useChatTreeStore } from '../treeStore';

export const useChatTreeNodeFocus = treeId => {
  const focusId = useChatTreeStore(state => state.focusId);
  return focusId === treeId;
};
