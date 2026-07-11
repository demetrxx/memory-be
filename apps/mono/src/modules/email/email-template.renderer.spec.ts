import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { renderEmailTemplate } from './email-template.renderer';

describe('renderEmailTemplate', () => {
  let templateDir: string;

  beforeEach(() => {
    templateDir = mkdtempSync(join(tmpdir(), 'email-template-'));
  });

  afterEach(() => {
    rmSync(templateDir, { recursive: true, force: true });
  });

  function writeTemplate(name: string, html: string) {
    writeFileSync(join(templateDir, `${name}.html`), html);
  }

  it('replaces placeholders and escapes text values', () => {
    writeTemplate('otp', '<a href="{{url}}">{{code}}</a><p>{{text}}</p>');

    const html = renderEmailTemplate(
      'otp',
      {
        code: '<123>',
        text: 'Tom & "Jane"',
        url: 'https://example.com/confirm?code=1&next=/app',
      },
      { templateDir },
    );

    expect(html).toContain('&lt;123&gt;');
    expect(html).toContain('Tom &amp; &quot;Jane&quot;');
    expect(html).toContain('https://example.com/confirm?code=1&amp;next=/app');
    expect(html).not.toContain('{{');
  });

  it('throws when a placeholder value is missing', () => {
    writeTemplate('otp', '<p>{{code}}</p><a href="{{url}}">Go</a>');

    expect(() =>
      renderEmailTemplate('otp', { code: '123' }, { templateDir }),
    ).toThrow('Missing email template value: url');
  });

  it('throws for non-http URL placeholders', () => {
    writeTemplate(
      'marketing',
      '<img src="{{imgUrl}}" /><a href="{{url}}">Go</a>',
    );

    expect(() =>
      renderEmailTemplate(
        'marketing',
        {
          imgUrl: 'javascript:alert(1)',
          url: 'https://example.com',
        },
        { templateDir },
      ),
    ).toThrow('Invalid email template URL protocol: imgUrl');
  });
});
