/**
 * Dependency-free XML reader.
 *
 * The Worker runtime has no DOMParser, and provider payloads are large
 * (OSG topology is ~2.4 MB), so this is a single-pass tokenizer that
 * produces a small tree we can walk in the adapters.
 */

export interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  text: string;
  children: XmlNode[];
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

export function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }
    if (code.startsWith("#")) return String.fromCodePoint(parseInt(code.slice(1), 10));
    return ENTITIES[code] ?? match;
  });
}

function parseAttrs(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w:.-]+)\s*=\s*"([^"]*)"|([\w:.-]+)\s*=\s*'([^']*)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const key = m[1] ?? m[3];
    const value = m[2] ?? m[4] ?? "";
    if (key) attrs[key] = decodeEntities(value);
  }
  return attrs;
}

export function parseXml(xml: string): XmlNode {
  const root: XmlNode = { tag: "#root", attrs: {}, text: "", children: [] };
  const stack: XmlNode[] = [root];
  const tagRe = /<([!?/]?)([\w:.-]*)([^>]*?)(\/?)>/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(xml))) {
    const [full, prefix, tag, rest, selfClose] = m;
    const current = stack[stack.length - 1]!;
    const text = xml.slice(lastIndex, m.index);
    if (text.trim()) current.text += decodeEntities(text);
    lastIndex = m.index + full.length;

    if (prefix === "!" || prefix === "?") continue;
    if (prefix === "/") {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node: XmlNode = { tag: tag ?? "", attrs: parseAttrs(rest ?? ""), text: "", children: [] };
    current.children.push(node);
    if (!selfClose) stack.push(node);
  }
  return root;
}

export function findAll(node: XmlNode, tag: string, out: XmlNode[] = []): XmlNode[] {
  for (const child of node.children) {
    if (child.tag === tag) out.push(child);
    findAll(child, tag, out);
  }
  return out;
}

export function child(node: XmlNode | undefined, tag: string): XmlNode | undefined {
  return node?.children.find((c) => c.tag === tag);
}

export function textOf(node: XmlNode | undefined, tag: string): string {
  return child(node, tag)?.text.trim() ?? "";
}
