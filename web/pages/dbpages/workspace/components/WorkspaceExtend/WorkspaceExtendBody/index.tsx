import { useWorkspaceStore } from '@/pages/dbpages/workspace/store';
import { useMemo } from 'react';
import { extendConfig } from '../config';

export default () => {
  const { currentWorkspaceExtend } = useWorkspaceStore(state => {
    return {
      currentWorkspaceExtend: state.currentWorkspaceExtend,
    };
  });
  const Component = useMemo(() => {
    return extendConfig.find(item => item.code === currentWorkspaceExtend)?.components;
  }, [currentWorkspaceExtend]);

  return Component ? <Component /> : false;
};
