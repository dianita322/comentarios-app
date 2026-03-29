"use client";

import React from "react";

type PostContentProps = {
  content: string;
  emptyMessage?: string;
};

type ParsedBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "quote"; text: string };

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|`([^`]+)`|\*(.+?)\*/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] && match[2]) {
      tokens.push({
        type: "link",
        label: match[1],
        href: match[2],
      });
    } else if (match[3]) {
      tokens.push({
        type: "bold",
        value: match[3],
      });
    } else if (match[4]) {
      tokens.push({
        type: "code",
        value: match[4],
      });
    } else if (match[5]) {
      tokens.push({
        type: "italic",
        value: match[5],
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return tokens;
}

function renderInline(text: string) {
  const lines = text.split("\\n");

  return lines.map((line, lineIndex) => {
    const tokens = parseInline(line);

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {tokens.map((token, tokenIndex) => {
          const key = `${lineIndex}-${tokenIndex}`;

          if (token.type === "bold") {
            return (
              <strong key={key} className="font-semibold">
                {token.value}
              </strong>
            );
          }

          if (token.type === "italic") {
            return (
              <em key={key} className="italic">
                {token.value}
              </em>
            );
          }

          if (token.type === "code") {
            return (
              <code
                key={key}
                className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.95em]"
              >
                {token.value}
              </code>
            );
          }

          if (token.type === "link") {
            return (
              <a
                key={key}
                href={token.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/30 underline-offset-4 transition hover:decoration-white/70"
              >
                {token.label}
              </a>
            );
          }

          return <React.Fragment key={key}>{token.value}</React.Fragment>;
        })}

        {lineIndex < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });
}

function parseBlocks(content: string): ParsedBlock[] {
  const normalized = content.replace(/\\r\\n/g, "\\n").trim();

  if (!normalized) return [];

  const lines = normalized.split("\\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i].trimEnd();

    if (!currentLine.trim()) {
      i += 1;
      continue;
    }

    const headingMatch = currentLine.match(/^(#{1,3})\\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^-\\s+/.test(currentLine)) {
      const items: string[] = [];

      while (i < lines.length && /^-\\s+/.test(lines[i].trimEnd())) {
        items.push(lines[i].trimEnd().replace(/^-\\s+/, "").trim());
        i += 1;
      }

      blocks.push({
        type: "unordered-list",
        items,
      });
      continue;
    }

    if (/^\\d+\\.\\s+/.test(currentLine)) {
      const items: string[] = [];

      while (i < lines.length && /^\\d+\\.\\s+/.test(lines[i].trimEnd())) {
        items.push(lines[i].trimEnd().replace(/^\\d+\\.\\s+/, "").trim());
        i += 1;
      }

      blocks.push({
        type: "ordered-list",
        items,
      });
      continue;
    }

    if (/^>\\s?/.test(currentLine)) {
      const quoteLines: string[] = [];

      while (i < lines.length && /^>\\s?/.test(lines[i].trimEnd())) {
        quoteLines.push(lines[i].trimEnd().replace(/^>\\s?/, ""));
        i += 1;
      }

      blocks.push({
        type: "quote",
        text: quoteLines.join("\\n").trim(),
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (i < lines.length) {
      const line = lines[i].trimEnd();

      if (!line.trim()) break;
      if (/^(#{1,3})\\s+/.test(line)) break;
      if (/^-\\s+/.test(line)) break;
      if (/^\\d+\\.\\s+/.test(line)) break;
      if (/^>\\s?/.test(line)) break;

      paragraphLines.push(line);
      i += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join("\\n").trim(),
    });
  }

  return blocks;
}

export default function PostContent({
  content,
  emptyMessage = "Todavía no hay contenido para mostrar.",
}: PostContentProps) {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-5 text-sm text-white/55">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-5 text-sm leading-7 text-white/85 md:text-base">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h2 key={index} className="text-2xl font-bold tracking-tight text-white">
                {renderInline(block.text)}
              </h2>
            );
          }

          if (block.level === 2) {
            return (
              <h3 key={index} className="text-xl font-semibold tracking-tight text-white">
                {renderInline(block.text)}
              </h3>
            );
          }

          return (
            <h4 key={index} className="text-lg font-semibold tracking-tight text-white">
              {renderInline(block.text)}
            </h4>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={index} className="list-disc space-y-2 pl-6">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="list-decimal space-y-2 pl-6">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="rounded-r-2xl border-l-4 border-white/20 bg-white/5 px-4 py-3 text-white/75"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        return (
          <p key={index} className="text-white/85">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}