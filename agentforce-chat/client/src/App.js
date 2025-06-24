import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const modules = ["WednesdAI", "B Y Proto", "Config", "Cafe"];

function App() {
  const [activeModule, setActiveModule] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isByProtoOpen, setIsByProtoOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedSketch, setSelectedSketch] = useState(1); // Index of focused sketch
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');

  const chatEndRef = useRef(null);
  const handleModuleClick = (moduleName) => {
    if (moduleName === "B Y Proto") {
      setIsByProtoOpen(true);
      setActiveModule(null);
      return;
    }

    setIsByProtoOpen(false);
    setActiveModule(moduleName);
    setMessages([
      {
        sender: "agent",
        text: `👋 Welcome to the ${moduleName} module! How can I assist you?`,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const closeProtoWindow = () => {
    setIsByProtoOpen(false);
  };
  const closeChat = () => {
    setActiveModule(null);
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setInput("");
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    // Show loader
    setMessages((prev) => [
      ...prev,
      { sender: "agent", text: "...", isLoading: true },
    ]);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      // Remove loader and add actual response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "agent", text: data.text },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: "agent", text: "Error connecting to server." },
      ]);
    }
  };
  const recognitionRef = useRef(null);
  useEffect(() => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscriptText(transcript);
      sendVoiceToSalesforce(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }
}, []);

 const toggleVoiceRecording = () => {
  if (!recognitionRef.current) {
    alert('Speech Recognition not supported in this browser.');
    return;
  }

  if (!isRecording) {
    setIsRecording(true);
    recognitionRef.current.start();
  } else {
    recognitionRef.current.stop();
    setIsRecording(false);
  }
};

const sendVoiceToSalesforce = async (text) => {
  try {
      const res = await fetch('https://api.salesforce.com/einstein/ai-agent/v1/sessions/e9746f0b-0a7b-408b-b5f9-39d72792e891/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJ0bmsiOiJjb3JlL3Byb2QvMDBESG8wMDAwMDdFWFNWTUE0IiwidmVyIjoiMS4wIiwia2lkIjoiQ09SRV9BVEpXVC4wMERIbzAwMDAwN0VYU1YuMTc1MDI2MjIxNTMwNSIsInR0eSI6InNmZGMtY29yZS10b2tlbiIsInR5cCI6IkpXVCIsImFsZyI6IlJTMjU2In0.eyJzY3AiOiJzZmFwX2FwaSBjaGF0Ym90X2FwaSBhcGkiLCJzdWIiOiJ1aWQ6MDA1SG8wMDAwMDkzZlJxSUFJIiwicm9sZXMiOltdLCJpc3MiOiJodHRwczovL2luMTc1MDI1NzIyOTIyMy5teS5zYWxlc2ZvcmNlLmNvbSIsImNsaWVudF9pZCI6IjNNVkc5UnIwRVoyWU9WTWFVaWlNMl81TzlMem5PUmc2TVZMRk9QbFZxaElTLnNGYVpEUzRRbDBRa0xfWUloNGVsci51QW5sSE40RGV1MzFXUFh2X00iLCJhdWQiOlsiaHR0cHM6Ly9hcGkuc2FsZXNmb3JjZS5jb20iLCJodHRwczovL2luMTc1MDI1NzIyOTIyMy5teS5zYWxlc2ZvcmNlLmNvbSJdLCJuYmYiOjE3NTA3NTE4OTksIm10eSI6Im9hdXRoIiwic2ZhcF9yaCI6ImJvdC1zdmMtbGxtOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluLGJvdC1zdmMtbGxtL0Zsb3dHcHQ6YXdzLXByb2QxLXVzZWFzdDEvZWluc3RlaW4sZWluc3RlaW4tdHJhbnNjcmliZS9FaW5zdGVpbkdQVDphd3MtcHJvZDgtY2FjZW50cmFsMS9laW5zdGVpbixlaW5zdGVpbi1haS1nYXRld2F5L0VpbnN0ZWluR1BUOmF3cy1wcm9kOC1jYWNlbnRyYWwxL2VpbnN0ZWluIiwic2ZpIjoiYTVhMTM4Y2Y1MTZiMzU1MDhjZGIwMmY1YmM5ZmExOWZhZmNlN2Q5MzNhNzhmMTVhMDg2MjBmNzkxYjRkYTZiYSIsInNmYXBfb3AiOiJFaW5zdGVpbkhhd2tpbmdDMkNFbmFibGVkLEVHcHRGb3JEZXZzQXZhaWxhYmxlLEVpbnN0ZWluR2VuZXJhdGl2ZVNlcnZpY2UsVGFibGVhdU1ldHJpY0Jhc2ljcyxTYWxlc2ZvcmNlQ29uZmlndXJhdG9yRW5naW5lIiwiaHNjIjpmYWxzZSwiZXhwIjoxNzUwNzUzNzE0LCJpYXQiOjE3NTA3NTE5MTR9.DsnO3FDXeFpgMAoDvAZiYw5tZ4uIjKuacLXcaG3B5HPmUJfyelmfuNPL1Ex7c-gMuctnF13qWsnCRPAYpXLk8sSqoVLK1PisVNv4eEl_ffVge8iGERaM8obmqGoGYAKU2tsmHjCC053vpKoTaukUxV7eyY5v7fEcm8qeTMRxgPSQntnevtTeaA773-yzxDS9JX1gRWv0pdFhNf-w_Zn5NxAtQRNrQiAHUEfg_IIEVd_jmK4IqpM0rhVhKUQ1qAwLS5tqC4YV2C2B-12P9sSbuFbB_CHZ6ZOiprk-YWGdHh4-Tpjc7YoZXI7eiuCtePdNzg24Zh1viEEUBxH4Rd7vHQ` // Replace this dynamically if needed
        },
        body: JSON.stringify({
          user_input: 'Hi' // Adjust key name to match what the agent expects
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data.response); // Adjust key depending on agent response
    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Failed to get response from agent.');
    } finally {
      console.log('FInally');
    }
  };


  return (
    <div className="app-wrapper">
      <h1 className="title">3D Printing Modules</h1>

      <div className="module-grid">
        {modules.map((name) => (
          <div
            key={name}
            className="module-card"
            onClick={() => handleModuleClick(name)}
          >
            <div className="icon-circle" />
            <p>{name}</p>
          </div>
        ))}
      </div>

      {activeModule && (
        <div className="chat-overlay">
          <div className="chat-box-window">
            <div className="chat-header">
              <h2>{activeModule} Assistant</h2>
              <button onClick={closeChat} className="close-btn">
                ×
              </button>
            </div>

            <div className="chat-body">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.sender}`}>
                  {msg.isLoading ? (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
      
      {isByProtoOpen && (
        <div className="chat-overlay">
          <div className="chat-box-window2">
            <div className="chat-header2">
              <h2>🧪 B Y Proto Module</h2>
              <button onClick={closeProtoWindow} className="close-btn">
                ×
              </button>
            </div>

            <div className="carousel-container">
              <div className="carousel-track">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`carousel-item ${
                      selectedSketch === i ? "focused" : "blurred"
                    }`}
                    onClick={() => setSelectedSketch(i)}
                  >
                    <img
                      src={`/sketches/sketch${i + 1}.png`}
                      alt={`Sketch ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="open-editor-btn"
                onClick={() => {
                  setIsEditorOpen(true);
                  closeProtoWindow();
                }}
              >
                ✍️ Open Design Editor
              </button>
            </div>
          </div>
        </div>
      )}
      {isEditorOpen && (
        <div className="editor-overlay">
          <div className="editor-window">
            <div className="editor-header">
              <h3>🖊️ Design Editor</h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <div className="editor-body">
              <div className="editor-image">
                <img
                  src={`/sketches/sketch${selectedSketch + 1}.png`}
                  alt="Selected Sketch"
                />
              </div>

              <div className="editor-divider" />

              <div className="editor-input">
                <textarea placeholder="Describe your design requirements here..." />
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button
                    className="open-editor-btn"
                    onClick={() => {
                      
                    }}
                  >
                    Show Suggestions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeModule === "Cafe" && (
  <div className="chat-overlay">
    <div className="chat-box-window">
      <div className="chat-header">
        <h2>☕ Cafe Module</h2>
        <button onClick={closeChat} className="close-btn">
          ×
        </button>
      </div>

      <div className="cafe-body">
        <button
          className={`mic-button ${isRecording ? "recording" : ""}`}
          onClick={toggleVoiceRecording}
        >
          🎙️
        </button>
        <p className="mic-status">
          {isRecording
            ? "🎙️ Listening... Tap again to finish."
            : "Tap 🎙️ to Order"}
        </p>
        {transcriptText && (
          <div className="transcript-display">
            <p><strong>You said:</strong> {transcriptText}</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default App;
