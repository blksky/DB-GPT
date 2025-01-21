import lottie from 'lottie-web';
import { useEffect, useRef } from 'react';
import { useChatWrapperStore } from '../../store/chatWrapper';
import styles from './index.module.less';

function Reminder() {
  const { showChat } = useChatWrapperStore();
  const refContainer = useRef<any>();
  const refAnimationItem = useRef<any>();
  // const list = [
  //   {
  //     id: 'jueSe',
  //     name: '角色扮演',
  //     desc: '与不同领域AI专家互动，快速了解和学习',
  //   },
  //   {
  //     id: 'zhiBiao',
  //     name: '指标问答',
  //     desc: '快读在海量文档中快速找到需要的内容',
  //   },
  //   {
  //     id: 'duoLun',
  //     name: '多轮对话',
  //     desc: '模拟真实对话场景，提供更准确回答',
  //   },
  //   {
  //     id: 'tuPu',
  //     name: '图谱联想',
  //     desc: '借助知识图谱，快速找到相关领域文档',
  //   },
  // ];
  useEffect(() => {
    refAnimationItem.current = lottie.loadAnimation({
      loop: false,
      autoplay: false,
      renderer: 'svg',
      path: '/logo-animate.json', // the path to the animation json
      container: refContainer.current, // the dom element that will contain the animation
    });
  }, []);
  useEffect(() => {
    if (showChat) {
      if (refAnimationItem.current?.currentFrame) {
        refAnimationItem.current?.resetSegments();
      }
      refAnimationItem.current?.play();
    }
  }, [showChat]);
  return (
    <div className={styles.reminder}>
      <h2 className={styles.reminder_title}>
        <div ref={refContainer} />
        {/*<img alt="" src={ICONS_GENAI} />*/}
      </h2>
      {/*<p className={styles.reminder_message}>提供以下能力</p>*/}
      {/*<div className={styles.reminder_question}>*/}
      {/*  {list.map((item: any) => {*/}
      {/*    return (*/}
      {/*      <div key={item.id} className={styles.reminder_question_item}>*/}
      {/*        <h3>{item.name}</h3>*/}
      {/*        <p>{item.desc}</p>*/}
      {/*      </div>*/}
      {/*    );*/}
      {/*  })}*/}
      {/*</div>*/}
    </div>
  );
}

export default Reminder;
