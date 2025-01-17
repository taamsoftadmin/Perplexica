'use client';

import ChatWindow from '@/components/ChatWindow';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ClientPage = () => {
  useEffect(() => {
    try {
      // Use Next.js searchParams hook instead of window.location
      const searchParams = new URLSearchParams(window.location.search);
      const apiKey = searchParams.get('key');
      const baseURL = searchParams.get('url');
      const model = searchParams.get('model');

      console.log('URL Parameters:', { apiKey: '***', baseURL, model }); // Debug log

      if (apiKey) {
        localStorage.setItem('openAIApiKey', apiKey);
        console.log('API Key set');
      }
      
      if (baseURL) {
        // Ensure baseURL is properly formatted
        const formattedBaseURL = baseURL.endsWith('/v1') ? baseURL : `${baseURL}/v1`;
        localStorage.setItem('openAIBaseURL', formattedBaseURL);
        console.log('Base URL set:', formattedBaseURL);
      }
      
      if (model) {
        localStorage.setItem('chatModel', model);
        console.log('Model set:', model);
      }

      // Always set provider to Taam API when URL params are present
      if (apiKey || baseURL) {
        localStorage.setItem('chatModelProvider', 'custom_openai');
        console.log('Provider set to custom_openai');
        
        // Force page reload to apply settings
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to parse URL parameters:', error);
    }
  }, []);

  return <ChatWindow />;
};

export default ClientPage;
