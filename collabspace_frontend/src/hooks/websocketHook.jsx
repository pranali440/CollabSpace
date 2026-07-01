// src/hooks/websocketHook.jsx
import { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const useWebSocket = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [toolContent, setToolContent] = useState("");
  const stompClientRef = useRef(null); // ✅ keep one persistent client

  useEffect(() => {
    const socket = new SockJS("http://localhost:8081/ws");
    const stompClient = Stomp.over(socket);
    stompClient.debug = null; // suppress console noise

    stompClient.connect({}, () => {
      stompClientRef.current = stompClient; // ✅ store after connected

      stompClient.subscribe(`/topic/session/${sessionId}/tool-update`, (message) => {
        const update = JSON.parse(message.body);
        setToolContent(update.content);
      });

      stompClient.subscribe(`/topic/session/${sessionId}/message`, (message) => {
        const msg = JSON.parse(message.body);
        setMessages((prev) => [...prev, msg]);
      });
    });

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const sendToolUpdate = (toolName, content) => {
    if (stompClientRef.current?.connected) { // ✅ reuse same connection
      stompClientRef.current.send(
        `/app/session/${sessionId}/tool-update`,
        {},
        JSON.stringify({ sessionId, toolName, content })
      );
    }
  };

  const sendMessage = (sender, content) => {
    if (stompClientRef.current?.connected) { // ✅ reuse same connection
      stompClientRef.current.send(
        `/app/session/${sessionId}/message`,
        {},
        JSON.stringify({ sessionId, sender, content })
      );
    }
  };

  return { messages, toolContent, sendToolUpdate, sendMessage };
};

export default useWebSocket;