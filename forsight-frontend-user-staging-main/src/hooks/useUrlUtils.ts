function useUrlUtils() {
  function isValidURL(url: string): boolean {
    const regex =
      /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|192.168.11.60)(:\d{1,5})?(\/[^\s]*)?$/;
    return regex.test(url);
  }

  function normalizeURL(url: string): string | null {
    if (!isValidURL(url)) {
      return null;
    }

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // Add www. if missing
    if (!/^https?:\/\/www\./i.test(url)) {
      url = url.replace(/^https?:\/\//i, "https://www.");
    }

    return url;
  }

  return { isValidURL, normalizeURL };
}

export default useUrlUtils;
