import Dexie from 'dexie';
import { templateSeeds } from './seeds';

export const db = new Dexie('chatbi_er');

db.version(6).stores({
  diagrams: '++id, dataSourceId, dataSchemaName, lastModified, loadedFromGistId',
  templates: '++id, custom',
});

db.on('populate', transaction => {
  transaction.templates.bulkAdd(templateSeeds).catch(e => console.log(e));
});
