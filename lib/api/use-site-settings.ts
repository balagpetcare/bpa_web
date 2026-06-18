"use client";

import { useState, useEffect } from 'react';
import { PublicSiteSettings, getPublicSiteSettings, DEFAULT_SETTINGS } from './site-settings';

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    getPublicSiteSettings()
      .then((s) => {
        if (active) {
          setSettings(s);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings, loading, error };
}
