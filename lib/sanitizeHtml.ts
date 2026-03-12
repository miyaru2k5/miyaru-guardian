export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove <script>, <style>, <iframe> tags completely
  doc.querySelectorAll("script, style, iframe").forEach(node => node.remove());

  // Remove dangerous attributes like on*, javascript: urls
  const walk = (node: Element | ChildNode) => {
    if (!(node instanceof Element)) return;

    // Remove event handlers and javascript: href/src
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        continue;
      }
      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        node.removeAttribute(attr.name);
      }
    }

    node.childNodes.forEach(walk);
  };

  doc.body.childNodes.forEach(walk);
  return doc.body.innerHTML;
}

