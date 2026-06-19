'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addPostComment, deletePostComment } from '@/lib/api/content';
import type { Comment } from '@/lib/api/content';
import { MessageSquare, Trash2, Send, ShieldAlert } from 'lucide-react';
import LoginToInteract from './LoginToInteract';

interface Props {
  postId: string;
  initialComments?: Comment[];
  allowComments: boolean;
}

export default function CommentSection({ postId, initialComments = [], allowComments }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !body.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newComment = await addPostComment(postId, body.trim());
      setComments(prev => [newComment, ...prev]);
      setBody('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;

    setDeletingId(commentId);
    try {
      await deletePostComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const isAdmin = user && (user.roles?.includes('admin') || user.roles?.includes('super_admin') || user.role === 'admin' || user.role === 'super_admin');

  if (!allowComments) {
    return (
      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6 text-center text-gray-500 font-semibold my-8 flex items-center justify-center gap-2">
        <ShieldAlert size={18} className="text-gray-400" />
        <span>Comments are turned off for this post.</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-10">
      <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
        <MessageSquare size={22} className="text-(--bpa-green)" />
        <h3 className="text-xl font-extrabold text-(--bpa-navy)">
          Comments ({comments.length})
        </h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 text-(--bpa-green) flex items-center justify-center font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                required
                className="w-full rounded-2xl border border-gray-250 p-4 text-sm focus:border-(--bpa-green) focus:ring-1 focus:ring-(--bpa-green) focus:outline-none resize-none pr-12 font-medium"
              />
              <button
                type="submit"
                disabled={submitting || !body.trim()}
                className="absolute right-3 bottom-4 bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white p-2.5 rounded-xl disabled:opacity-40 disabled:hover:bg-(--bpa-green) transition shadow-md"
                aria-label="Submit comment"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <LoginToInteract action="comment" />
      )}

      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-semibold">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-4 items-start bg-white p-4 border border-gray-100 rounded-2xl shadow-sm hover:shadow transition duration-200">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center font-bold shrink-0">
                {comment.user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-sm text-(--bpa-navy)">{comment.user?.name || 'Anonymous User'}</span>
                    <span className="text-[10px] text-gray-400 font-bold block sm:inline sm:ml-2.5">
                      {new Date(comment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {(user?.id === comment.userId || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line break-words font-medium">
                  {comment.body}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
