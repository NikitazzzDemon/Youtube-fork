import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { CommentItem } from '../types';
import { GlassCard } from './GlassCard';

interface CommentsProps {
  comments: CommentItem[];
  onAddComment?: (text: string) => void;
}

export const Comments: React.FC<CommentsProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2 text-base sm:text-lg font-bold">
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Add comment box */}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs sm:text-sm shrink-0 border border-zinc-500/30">
          U
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            autoComplete="off"
            placeholder="Add a private comment..."
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl glass-input text-xs sm:text-sm placeholder-zinc-400 focus:outline-none pr-10"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 sm:top-1.5 p-1.5 rounded-full neu-pill-active transition cursor-pointer font-bold"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-2.5 mt-1">
        {comments.length === 0 ? (
          <GlassCard className="!p-6 text-center text-xs opacity-70 font-medium rounded-2xl border border-zinc-500/20">
            Комментарии к этому видео отсутствуют или отключены на YouTube.
          </GlassCard>
        ) : (
          comments.map((comment) => (
            <GlassCard key={comment.id} className="!p-3 sm:!p-4 !rounded-2xl border border-zinc-500/20">
              <div className="flex items-start gap-2.5">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-zinc-500/30 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{comment.author}</span>
                    <span className="text-[10px] opacity-60">{comment.publishedTime}</span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed font-medium opacity-90">{comment.text}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs opacity-70">
                    <button className="flex items-center gap-1 hover:opacity-100 transition font-semibold cursor-pointer">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[11px]">{comment.likeCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
