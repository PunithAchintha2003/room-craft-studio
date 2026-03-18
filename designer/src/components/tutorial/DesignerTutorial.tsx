import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride';
import { useLocation } from 'react-router-dom';

const TUTORIAL_STORAGE_KEY = 'roomcraft_tutorial_completed';

export const DesignerTutorial: React.FC = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const location = useLocation();

  // Check if user has completed the tutorial before
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    
    // Only run tutorial on editor page for first-time users
    if (!hasCompletedTutorial && location.pathname.includes('/editor')) {
      // Delay tutorial start to let page load
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div>
          <h3>Welcome to RoomCraft Studio Designer! 👋</h3>
          <p>Let's take a quick tour to help you get started with creating amazing furniture designs.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="room-config"]',
      content: (
        <div>
          <h4>Room Configuration</h4>
          <p>Start by setting up your room dimensions, wall colors, and floor colors here.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '[data-tour="canvas-2d"]',
      content: (
        <div>
          <h4>2D Canvas Editor</h4>
          <p>This is where you'll design your room layout. Drag furniture from the library and position them in the room.</p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '[data-tour="furniture-library"]',
      content: (
        <div>
          <h4>Furniture Library</h4>
          <p>Browse and search for furniture items here. Click to add to room center, or drag to position precisely.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="furniture-properties"]',
      content: (
        <div>
          <h4>Furniture Properties</h4>
          <p>Select any furniture item to edit its color, scale, rotation, and other properties.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '[data-tour="grid-toggle"]',
      content: (
        <div>
          <h4>Grid & Tools</h4>
          <p>Toggle the grid for precise alignment. Use the measurement tool (M key) to measure distances.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="3d-preview"]',
      content: (
        <div>
          <h4>3D Preview</h4>
          <p>Click here to see your design in realistic 3D. You can rotate, zoom, and even edit furniture directly in 3D!</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="save-button"]',
      content: (
        <div>
          <h4>Save Your Work</h4>
          <p>Remember to save your designs regularly. Use Cmd/Ctrl+S for quick save.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '[data-tour="help-button"]',
      content: (
        <div>
          <h4>Need Help?</h4>
          <p>Press '?' anytime to view all keyboard shortcuts. You can also restart this tutorial from the help menu.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: 'body',
      content: (
        <div>
          <h3>You're All Set! 🎉</h3>
          <p>Start creating beautiful furniture designs. Remember:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>Press <strong>M</strong> to measure distances</li>
            <li>Press <strong>G/R/S</strong> in 3D mode to move/rotate/scale</li>
            <li>Press <strong>?</strong> for keyboard shortcuts</li>
            <li>Use <strong>Shift+Click</strong> to multi-select furniture</li>
          </ul>
        </div>
      ),
      placement: 'center',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      // Mark tutorial as completed
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      setRun(false);
      setStepIndex(0);
    } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.NEXT) {
      setStepIndex(index + 1);
    } else if (type === EVENTS.STEP_AFTER && action === ACTIONS.PREV) {
      setStepIndex(index - 1);
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#1976d2',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: 14,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#1976d2',
          fontSize: 14,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#666',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#999',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tutorial',
      }}
    />
  );
};

// Function to manually restart the tutorial
export const restartTutorial = () => {
  localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  window.location.reload();
};

export default DesignerTutorial;
