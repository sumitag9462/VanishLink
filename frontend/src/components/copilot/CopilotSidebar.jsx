import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Plus, Search, Pin, Archive, Trash2, PinOff, ArchiveRestore } from 'lucide-react';
import clsx from 'clsx';

export const CopilotSidebar = ({ conversations, activeId, onSelect, onNew, onUpdate, onDelete, isOpen }) => {
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: isOpen ? 260 : 0, opacity: isOpen ? 1 : 0 }}
      className="h-full bg-slate-900/90 border-r border-white/5 flex flex-col overflow-hidden whitespace-nowrap shrink-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm tracking-wide">History</h3>
        <button
          onClick={onNew}
          className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-colors"
          title="New Conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search history..."
            className="w-full bg-slate-950/50 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div 
        className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain disable-scrollbars"
        data-lenis-prevent="true"
      >
        {sortedConversations.map((conv) => (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={clsx(
              'w-full flex items-center justify-between p-3 rounded-xl transition-all group text-left relative overflow-hidden',
              activeId === conv._id
                ? 'bg-purple-500/20 text-purple-300 shadow-inner'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <MessageSquare className={clsx("w-4 h-4 shrink-0", conv.pinned && "text-amber-400")} />
              <span className={clsx("text-sm truncate font-medium", conv.archived && "line-through opacity-50")}>{conv.title}</span>
            </div>
            
            {/* Action overlay - appears on hover */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 shadow-[-10px_0_10px_rgba(15,23,42,0.9)] p-1 rounded-lg backdrop-blur-sm">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdate(conv._id, { pinned: !conv.pinned }); }}
                className="p-1.5 hover:bg-white/10 rounded-md hover:text-amber-400 transition-colors"
                title={conv.pinned ? "Unpin" : "Pin"}
              >
                {conv.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdate(conv._id, { archived: !conv.archived }); }}
                className="p-1.5 hover:bg-white/10 rounded-md hover:text-purple-400 transition-colors"
                title={conv.archived ? "Unarchive" : "Archive"}
              >
                {conv.archived ? <ArchiveRestore className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(conv._id); }}
                className="p-1.5 hover:bg-white/10 rounded-md hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
