export const fileUrl = (path?: string | null): string => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    try {
      const parsedUrl = new URL(path);

      if (
        parsedUrl.hostname === "192.168.2.246" &&
        parsedUrl.port === "8080"
      ) {
        return `${window.location.origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      return path;
    } catch {
      return path;
    }
  }

  return path.startsWith("/") ? path : `/${path}`;
};