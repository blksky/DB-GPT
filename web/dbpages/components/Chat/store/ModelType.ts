import { useChatStore } from '@/dbpages/components/Chat/store/chat';
import { useChatBIStore } from '@/dbpages/components/Chat/store/chatBI';
import { useChatReadingStore } from '@/dbpages/components/Chat/store/chatReading';
import { useChatScopeStore } from '@/dbpages/components/Chat/store/chatScope';
import { EnumChatStoreType } from '@/dbpages/components/Chat/store/storeBase';

export function getChatStoreMethod(chatType?: EnumChatStoreType) {
  switch (chatType) {
    case EnumChatStoreType.CHAT:
      return useChatStore;
    case EnumChatStoreType.CHAT_SCOPE:
      return useChatScopeStore;
    case EnumChatStoreType.CHAT_BI:
      return useChatBIStore;
    case EnumChatStoreType.CHAT_READING:
      return useChatReadingStore;
    default:
      return useChatStore;
  }
}
