import { Composition } from 'remotion';
import { QuickStart } from './QuickStart';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuickStart"
        component={QuickStart}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Chukfi CMS',
          subtitle: 'Ship a CMS in 30 Seconds',
        }}
      />
    </>
  );
};
