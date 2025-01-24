import axios from 'axios';
import { FC, useEffect, useState } from 'react';
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './PipelineTemplate.module.less';

type PipelineResultProps = {
  template?: string;
};

const PipelineTemplate: FC<PipelineResultProps> = props => {
  const [content, setContent] = useState<string>('');

  const loadFile = async () => {
    if (!props.template) {
      setContent('');
      return;
    }
    const filePath = `${window.location.origin}/esql_templates/${props.template}`;
    const response = await axios.get(filePath);
    setContent(response.data);
  };

  useEffect(() => {
    loadFile();
  }, [props.template]);

  return (
    <SyntaxHighlighter className={styles['pipeline-result-template']} language='text' style={solarizedlight}>
      {content}
    </SyntaxHighlighter>
  );
};

export default PipelineTemplate;
