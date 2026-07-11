import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

type TemplateValues = Record<string, string | undefined | null>;

interface RenderEmailTemplateOptions {
  templateDir?: string;
}

const URL_PLACEHOLDERS = new Set(['url', 'imgUrl']);
const PLACEHOLDER_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

export function renderEmailTemplate(
  templateName: string,
  values: TemplateValues,
  options: RenderEmailTemplateOptions = {},
) {
  const template = readTemplate(templateName, options.templateDir);

  const html = template.replace(PLACEHOLDER_PATTERN, (_, key: string) => {
    const value = values[key];

    if (value === undefined || value === null) {
      throw new Error(`Missing email template value: ${key}`);
    }

    if (URL_PLACEHOLDERS.has(key)) {
      assertHttpUrl(value, key);
    }

    return escapeHtml(value);
  });

  const leftover = html.match(PLACEHOLDER_PATTERN);
  if (leftover) {
    throw new Error(`Unresolved email template values: ${leftover.join(', ')}`);
  }

  return html;
}

function readTemplate(templateName: string, templateDir?: string) {
  const path = resolveTemplatePath(templateName, templateDir);
  return readFileSync(path, 'utf8');
}

function resolveTemplatePath(templateName: string, templateDir?: string) {
  const filename = `${templateName}.html`;

  if (templateDir) {
    const configuredPath = resolve(templateDir, filename);
    if (!existsSync(configuredPath)) {
      throw new Error(`Email template not found: ${configuredPath}`);
    }
    return configuredPath;
  }

  const candidates = [
    resolve(process.cwd(), 'libs/email/templates', filename),
    resolve(process.cwd(), 'dist/libs/email/templates', filename),
  ];

  const existingPath = candidates.find((candidate) => existsSync(candidate));
  if (!existingPath) {
    throw new Error(`Email template not found: ${candidates.join(', ')}`);
  }

  return existingPath;
}

function assertHttpUrl(value: string, key: string) {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid email template URL value: ${key}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Invalid email template URL protocol: ${key}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
