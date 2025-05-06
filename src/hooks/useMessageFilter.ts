
import { useState, useCallback } from 'react';

export function useMessageFilter() {
  const [filteredMessage, setFilteredMessage] = useState<string>('');
  
  // Patterns to detect
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phonePattern = /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g;
  const urlPattern = /(?:https?:\/\/|www\.)[^\s.]+\.[^\s]{2,}/g;
  
  // Off-platform keywords
  const offPlatformKeywords = [
    'text me',
    'call me',
    'email me',
    'contact me',
    'off platform',
    'outside app',
    'chat outside',
    'my number',
    'my email',
    'my contact',
    'whatsapp',
    'telegram',
    'signal',
    'offline',
    'direct contact'
  ];
  
  const filterMessage = useCallback((message: string): {
    filteredText: string;
    containsFilteredContent: boolean;
    detectedPatterns: string[];
  } => {
    let filteredText = message;
    const detectedPatterns: string[] = [];
    
    // Check for email addresses
    const emails = message.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        filteredText = filteredText.replace(email, '***EMAIL REMOVED***');
        detectedPatterns.push('email');
      });
    }
    
    // Check for phone numbers
    const phones = message.match(phonePattern);
    if (phones) {
      phones.forEach(phone => {
        filteredText = filteredText.replace(phone, '***PHONE NUMBER REMOVED***');
        detectedPatterns.push('phone');
      });
    }
    
    // Check for URLs (excluding the platform's own domain)
    const urls = message.match(urlPattern);
    if (urls) {
      urls.forEach(url => {
        // Only filter out URLs that aren't our own domain
        if (!url.includes('donezo.com')) {
          filteredText = filteredText.replace(url, '***URL REMOVED***');
          detectedPatterns.push('url');
        }
      });
    }
    
    // Check for off-platform keywords
    let keywordsDetected = false;
    offPlatformKeywords.forEach(keyword => {
      if (message.toLowerCase().includes(keyword.toLowerCase())) {
        keywordsDetected = true;
        detectedPatterns.push('off-platform communication');
      }
    });
    
    setFilteredMessage(filteredText);
    
    return {
      filteredText,
      containsFilteredContent: filteredText !== message,
      detectedPatterns: [...new Set(detectedPatterns)] // Remove duplicates
    };
  }, []);
  
  return {
    filterMessage,
    filteredMessage
  };
}
