/**
 * Normalizes image URLs to ensure they work correctly
 * Converts full URLs to relative URLs to use Vite proxy
 * This avoids CORS issues and ensures proper path handling
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's a full URL, extract the path to use with Vite proxy
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const url = new URL(imageUrl);
      // Return the pathname (e.g., /media/foods/image.jpg)
      // Vite proxy will forward this to the backend
      return url.pathname;
    } catch (e) {
      console.warn('Failed to parse image URL:', imageUrl);
      // If parsing fails, try to extract path manually
      const match = imageUrl.match(/\/media\/.*/);
      if (match) {
        return match[0];
      }
      return imageUrl;
    }
  }
  
  // If it's already a relative URL starting with /media/, return as is
  if (imageUrl.startsWith('/media/')) {
    return imageUrl;
  }
  
  // If it's a relative URL without leading slash, add /media/ prefix
  if (!imageUrl.startsWith('/')) {
    return `/media/${imageUrl}`;
  }
  
  return imageUrl;
};

