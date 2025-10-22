import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const NoiseModelLoader = ({ setNoiseModel }) => {
  useEffect(() => {
    const loadModel = async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const speechCommands = await import('@tensorflow-models/speech-commands');
        
        await tf.ready();
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        setNoiseModel(recognizer);
        console.log('Noise cancellation model loaded');
      } catch (error) {
        console.error('Failed to load noise model:', error);
      }
    };

    loadModel();

    return () => {
      // Dispose of the model if the component unmounts
      setNoiseModel(null);
    };
  }, [setNoiseModel]);

  return null; // This component doesn't render anything
};

export default dynamic(() => Promise.resolve(NoiseModelLoader), { ssr: false });