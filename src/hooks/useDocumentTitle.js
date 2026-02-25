import { useEffect } from 'react';

/**
 * Hook to set the document title
 * @param {string} title - The title to set
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    /* Preserve the original title roughly, or just set it. 
       Usually for a dashboard, we want "Page Name | App Name" */
    const originalTitle = document.title;
    document.title = `${title} | Be Positive Admin`;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
