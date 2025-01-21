import GoldenSqlIndex from '@/pages/dbpages/knowledge/goldSql';
import { Drawer } from 'antd';
import { FC, forwardRef, useImperativeHandle, useState } from 'react';

type GoldenSqlDialogProps = {
  dbSchemaInfo?: {
    tableName?: string;
    dataSourceId: number;
    dataSourceName: string;
    dataSchemaName: string;
  };
};

const GoldenSqlDialog: FC<GoldenSqlDialogProps> = forwardRef((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const { dataSourceName, dataSchemaName, tableName } = (props.dbSchemaInfo || {}) as any;

  useImperativeHandle(ref, () => ({
    open,
    setOpen,
  }));

  const drawerOpt: any = {
    title: `Gold SQL查看：${tableName ? tableName : `${dataSourceName}.${dataSchemaName}`}`,
    open,
    width: 900,
    onClose: () => setOpen(false),
  };

  return (
    <Drawer {...drawerOpt}>
      <GoldenSqlIndex dbSchemaInfo={props.dbSchemaInfo} />
    </Drawer>
  );
});

export default GoldenSqlDialog;
