'use client';

import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Image as ImageIcon, Mic } from 'lucide-react';
import { Avatar } from '@/components/ui';

const mockChats = [
  { id: 1, name: 'Priya Sharma', msg: 'Hey coach! I finished the morning workout.', time: '10:42 AM', unread: 2 },
  { id: 2, name: 'Arjun Patel', msg: 'Can we reschedule our call?', time: 'Yesterday', unread: 0 },
  { id: 3, name: 'Sarah Wellness', msg: 'Great progress this week!', time: 'Mon', unread: 0 },
];

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState(mockChats[0]);

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-xl mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-3 rounded-2xl cursor-pointer transition-all flex gap-3 ${
                activeChat.id === chat.id ? 'bg-white shadow-sm border border-gray-100' : 'hover:bg-white hover:shadow-sm'
              }`}
            >
              <Avatar name={chat.name} size="md" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-bold text-sm text-gray-900">{chat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.msg}</p>
              </div>
              {chat.unread > 0 && (
                <div className="flex flex-col justify-center">
                  <span className="w-5 h-5 bg-[#D2F05D] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {chat.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="h-16 border-b border-gray-50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={activeChat.name} size="sm" />
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{activeChat.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-gray-400">
            <Phone size={20} className="hover:text-black cursor-pointer" />
            <Video size={20} className="hover:text-black cursor-pointer" />
            <MoreVertical size={20} className="hover:text-black cursor-pointer" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Today</span>
          </div>
          
          <div className="flex gap-3">
            <Avatar name={activeChat.name} size="xs" />
            <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-sm text-sm text-gray-700">
              Hey! I just finished the workout you assigned. It was intense! 💪
            </div>
          </div>

          <div className="flex gap-3 flex-row-reverse">
            <div className="bg-black text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-sm text-sm">
              That's awesome! How are you feeling? Make sure to stretch properly.
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-2 flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-xl transition-colors">
              <ImageIcon size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none px-2"
            />
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-xl transition-colors">
              <Mic size={20} />
            </button>
            <button className="p-2 bg-[#D2F05D] text-black rounded-xl hover:bg-[#c2e04d] transition-colors shadow-sm">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
