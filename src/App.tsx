import '@/scss/App.scss';
import routes from './routes/index'
import { useLocation, useRoutes } from 'react-router-dom'
import { Suspense, useEffect, useState } from'react'

import { Spin } from 'antd';
import stores from './stores';

function App() {
  const routeView = useRoutes(routes)
  const [audioSrc, setAudioSrc] = useState('')
  useEffect(() => {
    setAudioSrc(stores.ExamStore.listenAudio);
  },[stores.ExamStore.listenAudio])

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith('/listeningExam')) {
      // 取消播放
      const audio = document.querySelector('audio');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [location.pathname]);

  return (
    <div className="App">
      <audio src={audioSrc} />
      <Suspense fallback={<Spin/>}>
        {routeView}
      </Suspense>
    </div>
  );
}

export default App;
