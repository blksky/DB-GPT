import { create } from 'zustand';

/**
 * 对话状态
 */
export interface IChatWrapperState {
  showChat?: boolean;
  chatFullscreen?: boolean;
  toggleShowChat: (nextValue?: boolean) => Promise<void>;
  toggleFullscreen: (nextValue?: boolean) => Promise<void>;
}

export const useChatWrapperStore = create<IChatWrapperState>((set, get) => {
  return {
    showChat: false,
    chatFullscreen: false,
    toggleShowChat: async (nextValue?: boolean): Promise<void> => {
      const { showChat, chatFullscreen } = get();
      const nextShowChat = nextValue === undefined ? !showChat : nextValue;
      const updateState = { showChat: nextShowChat, chatFullscreen };
      if (!nextShowChat) {
        updateState.chatFullscreen = false;
      }
      set(updateState);
    },
    toggleFullscreen: async (nextValue?: boolean): Promise<void> => {
      const { chatFullscreen } = get();
      const nextFullscreen = nextValue === undefined ? !chatFullscreen : nextValue;
      // if (nextFullscreen) {
      //   document.body.classList.add('site-chat-fullscreen');
      // } else {
      //   document.body.classList.remove('site-chat-fullscreen');
      // }
      set({ chatFullscreen: nextFullscreen });
    },
  };
});
