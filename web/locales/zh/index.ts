import { ChatZh } from './chat';
import { CommonZh } from './common';
import dbpages from './dbpages';
import { FlowZn } from './flow';

const zh = {
  ...ChatZh,
  ...FlowZn,
  ...CommonZh,
  ...dbpages,
};

export default zh;
