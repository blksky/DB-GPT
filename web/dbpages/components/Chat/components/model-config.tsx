import { Checkbox, Input, InputNumber, Select } from 'antd';
import Locale from '../chatLocales';
import { ModalConfigValidator, ModelConfig } from '../store';
import { useAllModels } from '../utils/hooks';
import { InputRange } from './input-range';
import { ListItem } from './ui-lib';

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          popupMatchSelectWidth={false}
          value={props.modelConfig.model}
          options={allModels.filter(v => v.available).map(v => ({ label: v.displayName, value: v.name }))}
          onChange={e => {
            props.updateConfig(config => (config.model = ModalConfigValidator.model(e)));
          }}
        />
      </ListItem>
      <ListItem title={Locale.Settings.Temperature.Title} subTitle={Locale.Settings.Temperature.SubTitle}>
        <InputRange
          value={Number(props.modelConfig.temperature?.toFixed(1))}
          min={0}
          max={1} // lets limit it to 0-1
          step={0.1}
          onChange={e => {
            props.updateConfig(config => (config.temperature = ModalConfigValidator.temperature(e)));
          }}
        />
      </ListItem>
      <ListItem title={Locale.Settings.TopP.Title} subTitle={Locale.Settings.TopP.SubTitle}>
        <InputRange
          value={Number((props.modelConfig.top_p ?? 1).toFixed(1))}
          min={0}
          max={1}
          step={0.1}
          onChange={e => {
            props.updateConfig(config => (config.top_p = ModalConfigValidator.top_p(e)));
          }}
        />
      </ListItem>
      <ListItem title={Locale.Settings.MaxTokens.Title} subTitle={Locale.Settings.MaxTokens.SubTitle}>
        <InputNumber
          min={1024}
          max={512000}
          value={props.modelConfig.max_tokens}
          onChange={e => props.updateConfig(config => (config.max_tokens = ModalConfigValidator.max_tokens(e)))}
        />
      </ListItem>
      <ListItem title={Locale.Settings.PresencePenalty.Title} subTitle={Locale.Settings.PresencePenalty.SubTitle}>
        <InputRange
          value={Number(props.modelConfig.presence_penalty?.toFixed(1))}
          min={-2}
          max={2}
          step={0.1}
          onChange={e => {
            props.updateConfig(config => (config.presence_penalty = ModalConfigValidator.presence_penalty(e)));
          }}
        />
      </ListItem>

      <ListItem title={Locale.Settings.FrequencyPenalty.Title} subTitle={Locale.Settings.FrequencyPenalty.SubTitle}>
        <InputRange
          value={Number(props.modelConfig.frequency_penalty?.toFixed(1))}
          min={-2}
          max={2}
          step={0.1}
          onChange={e => {
            props.updateConfig(config => (config.frequency_penalty = ModalConfigValidator.frequency_penalty(e)));
          }}
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.InjectSystemPrompts.Title}
        subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
      >
        <Checkbox
          type='checkbox'
          checked={props.modelConfig.enableInjectSystemPrompts}
          onChange={e => props.updateConfig(config => (config.enableInjectSystemPrompts = e.target.checked))}
        />
      </ListItem>

      <ListItem title={Locale.Settings.InputTemplate.Title} subTitle={Locale.Settings.InputTemplate.SubTitle}>
        <Input
          value={props.modelConfig.template}
          onChange={e => props.updateConfig(config => (config.template = e.currentTarget.value))}
        />
      </ListItem>

      <ListItem title={Locale.Settings.HistoryCount.Title} subTitle={Locale.Settings.HistoryCount.SubTitle}>
        <InputRange
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min={0}
          max={64}
          step={1}
          onChange={e => props.updateConfig(config => (config.historyMessageCount = e))}
        />
      </ListItem>

      <ListItem title={Locale.Settings.CompressThreshold.Title} subTitle={Locale.Settings.CompressThreshold.SubTitle}>
        <InputNumber
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={e => props.updateConfig(config => (config.compressMessageLengthThreshold = e as number))}
        />
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <Checkbox
          checked={props.modelConfig.sendMemory}
          onChange={e => props.updateConfig(config => (config.sendMemory = e.target.checked))}
        />
      </ListItem>
    </>
  );
}
