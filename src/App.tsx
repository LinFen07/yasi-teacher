import '@/scss/App.scss';
import routes from './routes/index'
import { useLocation, useRoutes } from 'react-router-dom'
import { Suspense, useEffect, useState } from'react'

import { Spin } from 'antd';
import stores from './stores';
import { observer } from 'mobx-react';

function App() {
  const routeView = useRoutes(routes)
  const [audioSrc, setAudioSrc] = useState('');
  
  useEffect(() => {
    setAudioSrc(stores.ExamStore.listenAudio);
  },[stores.ExamStore.listenAudio])

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith('/listeningExam')) {
      const audioRef = document.querySelector('audio');
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const audioRef = document.querySelector('audio');
    if(audioRef)
      audioRef.volume = stores.ExamStore.audioVolume / 100;
  },[stores.ExamStore.audioVolume])

  return (
    <div className="App">
      <audio src={audioSrc} />
      <Suspense fallback={<Spin/>}>
        {routeView}
      </Suspense>
    </div>
  );
}

export default observer(App);
