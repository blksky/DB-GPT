import { IModalData } from '@/dbpages/components/Modal/BaseModal';
import { useCommonStore } from './index';

export interface IComponentsContent {
  openModal: ((params: IModalData) => void) | null;
}

export const initComponentsContent = {
  openModal: null,
};

export const injectOpenModal = (openModal: IComponentsContent['openModal']) => {
  return useCommonStore.setState({ openModal });
};

export const openModal = (modal: IModalData) => {
  return useCommonStore.getState().openModal?.(modal);
};
