'use client';

import Link from 'next/link';
import { MessageSquare, Heart, ShieldAlert } from 'lucide-react';

interface Props {
  action?: 'comment' | 'like' | 'interact';
}

export default function LoginToInteract({ action = 'interact' }: Props) {
  const getActionDetails = () => {
    switch (action) {
      case 'comment':
        return {
          icon: MessageSquare,
          text: 'Join the Conversation',
          desc: 'Please sign in to write comments, share opinions, or ask questions about this post.',
        };
      case 'like':
        return {
          icon: Heart,
          text: 'Show Your Support',
          desc: 'Please sign in to react to posts and show support for our rescue, clinics, and volunteers.',
        };
      default:
        return {
          icon: ShieldAlert,
          text: 'Sign In Required',
          desc: 'Please sign in to interact, like, comment, or report content on this page.',
        };
    }
  };

  const { icon: Icon, text, desc } = getActionDetails();

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 text-center max-w-xl mx-auto my-6 shadow-inner">
      <div className="w-12 h-12 bg-white text-(--bpa-green) rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-50">
        <Icon size={22} className="stroke-[2.5]" />
      </div>
      <h4 className="text-lg font-extrabold text-(--bpa-navy) mb-2">
        {text}
      </h4>
      <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md mx-auto">
        {desc}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center justify-center bg-(--bpa-green) hover:bg-(--bpa-green-dark) text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-sm w-full sm:w-auto"
        >
          Sign In
        </Link>
        <span className="text-xs text-gray-400 font-bold uppercase">or</span>
        <Link
          href="/auth/sign-up"
          className="inline-flex items-center justify-center bg-white border border-gray-250 text-(--bpa-navy) hover:bg-gray-50 font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 w-full sm:w-auto"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
