import { useEffect } from 'react';

function setMeta(selector, attribute, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, content);
    document.head.appendChild(el);
  } else {
    el.setAttribute(attribute, content);
  }
  return el;
}

export function usePageMeta({ title, description, ogImage } = {}) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;
    if (description) setMeta('meta[name="description"]', 'content', description);
    if (ogImage) setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[property="og:title"]', 'content', title || document.title);
    if (description) setMeta('meta[property="og:description"]', 'content', description);
    return () => {
      document.title = previousTitle;
    };
  }, [title, description, ogImage]);
}
