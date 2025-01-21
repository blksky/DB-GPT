import Iconfont from '../../../../dbpages/components/Iconfont';
import { useConnectionStore } from '@/dbpages/store/connection';
import { Button, Col, Flex, Form, Input, Row, Select } from 'antd';
import { databaseMap } from '../../../../dbpages/constants';

type IGoldSqlSearchProps = {
  onSearch: (condition: Record<string, any>) => void;
  dbSchemaInfo?: {
    tableName?: string;
    dataSourceId: number;
    dataSourceName: string;
    dataSchemaName: string;
  };
};

function GoldenSqlSearch(props: IGoldSqlSearchProps) {
  const [form] = Form.useForm();
  const { connectionList } = useConnectionStore();
  const searchInDb = !!props.dbSchemaInfo?.dataSourceId;
  const colSpan = searchInDb ? 8 : 5;

  const handleSearch = () => {
    const values = form.getFieldsValue();
    props.onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    handleSearch();
  };

  return (
    <div className='common-search'>
      <Form form={form} layout='inline' labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Row className='common-width' gutter={12}>
          <Col span={colSpan}>
            <Form.Item label='问题' name='question'>
              <Input allowClear={true} placeholder='问题' />
            </Form.Item>
          </Col>
          <Col span={colSpan}>
            <Form.Item label='问题难度' name='difficulty'>
              <Select
                allowClear={true}
                placeholder='问题难度'
                options={[
                  { label: '简单', value: 'simple' },
                  { label: '中等', value: 'moderate' },
                  { label: '困难', value: 'challanging' },
                ]}
              />
            </Form.Item>
          </Col>
          {!searchInDb && (
            <Col span={colSpan}>
              <Form.Item label='数据源' name='db_id'>
                <Select
                  allowClear={true}
                  placeholder='数据库'
                  options={connectionList?.map((d: any) => ({
                    value: d.alias,
                    label: (
                      <Flex align='center' gap={4} className='chatConnection'>
                        <Iconfont className='chatConnectionIcon' code={databaseMap[d.type]?.icon} />
                        {d.alias}
                      </Flex>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={24 - (searchInDb ? 2 : 3) * colSpan}>
            <Flex gap={8} align='center' justify='flex-end' className='common-search-btn'>
              <Button type='default' onClick={handleReset}>
                重置
              </Button>
              <Button type='primary' onClick={handleSearch}>
                查询
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default GoldenSqlSearch;
