import EmojiPicker, { Emoji, EmojiStyle, Theme as EmojiTheme } from 'emoji-picker-react';

import { ModelType } from '../store';

import BlackBotIcon from '../icons/black-bot.svg';
import BotIcon from '../icons/bot.svg';

import RobotIcon from '../images/icons_avatar_robot.svg';

import { UserAvatar } from './UserAvatar';

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: { onEmojiClick: (emojiId: string) => void }) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={e => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: { model?: ModelType; avatar?: string }) {
  if (props.model) {
    return (
      <div className='no-dark'>
        {props.model?.startsWith('gpt-4') ? (
          <BlackBotIcon className='user-avatar' />
        ) : (
          <BotIcon className='user-avatar' />
        )}
      </div>
    );
  }

  return <div className='user-avatar'>{props.avatar && <EmojiAvatar avatar={props.avatar} />}</div>;
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return <Emoji unified={props.avatar} size={props.size ?? 18} getEmojiUrl={getEmojiUrl} />;
}

export function CommonAvatar(props: { isUser: boolean }) {
  const styles: any = {
    width: 43,
    height: 43,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(-5px)',
  };

  return (
    <div className='user-avatar' style={styles}>
      {props.isUser ? (
        <UserAvatar
          // @ts-ignore
          workNo=''
          style={{ width: 28, height: 28, boxShadow: '0 1px 10px 0 #2d2f3319' }}
        />
      ) : (
        <RobotIcon />
      )}
    </div>
  );
}
