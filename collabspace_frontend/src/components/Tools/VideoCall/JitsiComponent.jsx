import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api/api';

const JitsiComponent = ({ roomName, displayName, password, userEmail, isModerator = false }) => {
  const jitsiContainerRef = useRef(null);
  const screenShareContainerRef = useRef(null);
  const apiRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [isJitsiReady, setIsJitsiReady] = useState(false);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [jaasToken, setJaasToken] = useState(null);
  const [appId, setAppId] = useState(null);

  // Step 1: Load Jitsi external API script
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setIsJitsiReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-971f6203b8da42e58efe9f2e37356a95/external_api.js';
    script.async = true;
    script.onload = () => setIsJitsiReady(true);
    script.onerror = () => toast.error('Failed to load video call. Check your internet connection.');
    document.body.appendChild(script);
  }, []);

  // Step 2: Fetch JWT token from Spring Boot backend
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await api.post('/jaas/token', {
          email: userEmail || 'guest@collabspace.com',
          name: displayName || 'Guest',
          moderator: isModerator,
        });
        setJaasToken(response.data.token);
        setAppId(response.data.appId);
      } catch (error) {
        console.error('Failed to fetch JaaS token:', error);
        toast.error('Failed to initialize video call.');
      }
    };
    fetchToken();
  }, [userEmail, displayName, isModerator]);

  // Step 3: Initialize Jitsi once script + token are ready
  useEffect(() => {
    if (!isJitsiReady || !jitsiContainerRef.current || !roomName || !jaasToken || !appId) return;

    // Clean up previous instance
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    jitsiContainerRef.current.innerHTML = '';

    const options = {
      roomName: `${appId}/${roomName}`,  // JaaS format: appId/roomName
      width: '100%',
      height: 600,
      parentNode: jitsiContainerRef.current,
      jwt: jaasToken,  // JaaS JWT token
      userInfo: {
        displayName: displayName || 'Guest',
        email: userEmail || 'guest@collabspace.com',
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup', 'chat',
          'raisehand', 'videoquality', 'tileview', 'settings',
        ],
      },
    };

    try {
      const api = new window.JitsiMeetExternalAPI('8x8.vc', options);
      apiRef.current = api;

      api.addEventListener('videoConferenceJoined', () => {
        setIsJitsiLoaded(true);
        // Set password after joining if provided
        if (password && isModerator) {
          api.executeCommand('password', password);
        }
      });

      api.addEventListener('videoConferenceLeft', () => {
        setIsJitsiLoaded(false);
      });

      api.addEventListener('readyToClose', () => {
        setIsJitsiLoaded(false);
      });

      api.addEventListener('connectionFailed', () => {
        toast.error('Connection failed. Please try again.');
      });

    } catch (error) {
      console.error('Failed to initialize Jitsi:', error);
      toast.error('Failed to start video call. Please try again.');
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      setIsJitsiLoaded(false);
    };
  }, [isJitsiReady, roomName, jaasToken, appId, displayName, userEmail, password, isModerator]);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
      if (screenShareContainerRef.current) {
        screenShareContainerRef.current.innerHTML = '';
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        if (screenShareContainerRef.current) {
          const videoElement = document.createElement('video');
          videoElement.srcObject = stream;
          videoElement.autoplay = true;
          videoElement.className = 'w-full h-full object-contain';
          screenShareContainerRef.current.innerHTML = '';
          screenShareContainerRef.current.appendChild(videoElement);
        }
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          if (screenShareContainerRef.current) {
            screenShareContainerRef.current.innerHTML = '';
          }
        };
      } catch (error) {
        if (error.name !== 'NotAllowedError') {
          console.error('Error sharing screen:', error);
          toast.error('Failed to share screen.');
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-pink-600 dark:text-pink-400">
          Video Call
        </h3>
        <button
          onClick={handleScreenShare}
          disabled={!isJitsiLoaded}
          className={`px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isScreenSharing
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-pink-600 dark:bg-pink-500 hover:bg-pink-700 dark:hover:bg-pink-600'
          }`}
        >
          {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        </button>
      </div>

      {/* Loading state */}
      {(!isJitsiReady || !jaasToken) && (
        <div className="w-full h-[600px] rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {!jaasToken ? 'Authenticating...' : 'Loading video call...'}
            </p>
          </div>
        </div>
      )}

      <div
        ref={jitsiContainerRef}
        className={`w-full h-[600px] rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gradient-to-r dark:from-pink-200 dark:to-purple-200 ${
          (!isJitsiReady || !jaasToken) ? 'hidden' : ''
        }`}
      />

      {isScreenSharing && (
        <div className="bg-white dark:bg-gradient-to-r dark:from-pink-200 dark:to-purple-200 p-4 rounded-xl shadow-xl">
          <h4 className="text-lg font-semibold text-pink-600 dark:text-pink-400 mb-2">
            Screen Share
          </h4>
          <div
            ref={screenShareContainerRef}
            className="w-full h-[300px] bg-black rounded-lg overflow-hidden"
          />
        </div>
      )}
    </div>
  );
};

export default JitsiComponent;