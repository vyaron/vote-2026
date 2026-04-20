export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube
    if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
      const id =
        u.hostname === 'youtu.be'
          ? u.pathname.slice(1)
          : u.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    // Vimeo
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }

    return null;
  } catch {
    return null;
  }
}
