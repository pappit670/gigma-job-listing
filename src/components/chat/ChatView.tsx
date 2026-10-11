import { ArrowLeft, Send, Phone, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

interface ChatViewProps {
  onClose: () => void;
}

export function ChatView({ onClose }: ChatViewProps) {
  const { state, sendMessage } = useApp();
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);

  // Derive conversations from jobs that have a worker assigned
  const myJobs = state.jobs.filter(j => 
    (j.clientId === state.currentUser?.id || j.workerId === state.currentUser?.id) &&
    j.status !== 'ready'
  );

  const conversations = myJobs.map(job => {
    const isClient = job.clientId === state.currentUser?.id;
    const otherPartyId = isClient ? job.workerId : job.clientId;
    const otherParty = state.workers.find(w => w.id === otherPartyId) || 
                       (state.currentUser?.id === otherPartyId ? state.currentUser : null);
    
    // Get last message for this job
    const jobMessages = state.messages.filter(m => m.jobId === job.id);
    const lastMsg = jobMessages[jobMessages.length - 1];

    return {
      id: job.id,
      name: otherParty?.nickname || otherParty?.realName || 'User',
      photo: otherParty?.photo || 'https://via.placeholder.com/100',
      lastMessage: lastMsg?.content || 'No messages yet',
      time: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      unread: 0, // Simplified for MVP
      jobTitle: job.title,
    };
  });

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    
    try {
      await sendMessage(activeChat, message.trim());
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (activeChat) {
    const chat = conversations.find(c => c.id === activeChat);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3">
          <button 
            onClick={() => setActiveChat(null)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img 
            src={chat?.photo} 
            alt={chat?.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <p className="font-semibold">{chat?.name}</p>
            <p className="text-caption text-gray-500">{chat?.jobTitle}</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {state.messages.filter(m => m.jobId === activeChat).map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.senderId === state.currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  msg.senderId === state.currentUser?.id
                    ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.senderId === state.currentUser?.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-emerald-500"
            />
            <Button 
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 p-0 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-title">Messages</h1>
      </div>

      <div className="p-4">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No messages yet</p>
            <p className="text-caption text-gray-400">
              Messages will appear here when you start chatting
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className="w-full bg-white rounded-xl p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="relative">
                  <img 
                    src={chat.photo} 
                    alt={chat.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold truncate">{chat.name}</p>
                    <span className="text-caption text-gray-400">{chat.time}</span>
                  </div>
                  <p className="text-caption text-gray-500 truncate">{chat.lastMessage}</p>
                  <p className="text-caption text-emerald-600">{chat.jobTitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
