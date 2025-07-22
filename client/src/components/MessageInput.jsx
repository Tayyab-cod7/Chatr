import React, { useState } from "react";

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-4 bg-white/70 backdrop-blur-lg rounded-xl shadow-md gap-2">
      <input
        type="text"
        className="flex-1 border-2 border-blue-200 rounded-l-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 transition"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-r-xl shadow font-semibold hover:from-green-600 hover:to-blue-600 transition disabled:opacity-50"
        disabled={disabled || !message.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput; 