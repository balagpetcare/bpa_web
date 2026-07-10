'use client';

import React from 'react';

const socialProviders = [
  { id: 'google', name: 'Google', icon: 'https://www.svgrepo.com/show/475656/google-color.svg', enabled: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true' },
  { id: 'facebook', name: 'Facebook', icon: 'https://www.svgrepo.com/show/475647/facebook-color.svg', enabled: process.env.NEXT_PUBLIC_AUTH_FACEBOOK_ENABLED === 'true' },
  { id: 'instagram', name: 'Instagram', icon: 'https://www.svgrepo.com/show/475658/instagram-color.svg', enabled: process.env.NEXT_PUBLIC_AUTH_INSTAGRAM_ENABLED === 'true' },
  { id: 'twitter', name: 'Twitter / X', icon: 'https://www.svgrepo.com/show/513008/twitter-154.svg', enabled: process.env.NEXT_PUBLIC_AUTH_TWITTER_ENABLED === 'true' },
];
import { getApiOrigin } from '@/lib/utils/api-url';

export default function SocialLoginButtons() {
  const handleSocialLogin = (provider: string) => {
    window.location.href = `${getApiOrigin()}/api/v1/auth/oauth/${provider}/start`;
  };

  return (
    <div className="grid grid-cols-2 gap-3 mt-5">
      {socialProviders.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleSocialLogin(provider.id)}
          disabled={!provider.enabled}
          className={`flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white transition-all ${!provider.enabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-(--bpa-navy)'}`}
        >
          <img src={provider.icon} alt={provider.name} className="w-5 h-5 mr-2.5 opacity-90" />
          <span className="truncate">{provider.name}</span>
          {!provider.enabled && <span className="text-[10px] ml-1.5 uppercase tracking-wider text-gray-400 font-bold hidden sm:inline">(Soon)</span>}
        </button>
      ))}
    </div>
  );
}
