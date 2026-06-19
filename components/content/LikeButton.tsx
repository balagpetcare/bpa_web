'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toggleLikePost } from '@/lib/api/content';

interface Props {
  postId: string;
  initialLikes: number;
  initialLiked: boolean;
}

export default function LikeButton({ postId, initialLikes, initialLiked }: Props) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const handleLike = async () => {
    if (!user) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 4000);
      return;
    }

    setLoading(true);
    const newLiked = !liked;
    
    // Optimistic update
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const data = await toggleLikePost(postId, newLiked);
      setLikes(data.likeCount);
      setLiked(data.liked);
    } catch (err) {
      // Revert on error
      setLiked(liked);
      setLikes(likes);
      console.error('Failed to update like status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${
          liked
            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
        }`}
        aria-label={liked ? 'Unlike post' : 'Like post'}
      >
        <Heart size={18} className={liked ? 'fill-current' : ''} />
        <span>{likes}</span>
      </button>

      {showLoginMsg && (
        <div className="absolute left-0 bottom-full mb-2 w-48 bg-bpa-navy text-white text-xs p-3 rounded-lg shadow-xl z-10 animate-fade-in">
          Please <a href="/auth/sign-in" className="underline font-bold text-bpa-green">sign in</a> to like posts.
        </div>
      )}
    </div>
  );
}
