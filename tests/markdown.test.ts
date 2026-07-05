import { describe, it, expect } from 'vitest';
import { renderInlineBold } from '../src/lib/markdown';

describe('renderInlineBold', () => {
  it('renders **bold** as <strong>', () => {
    expect(renderInlineBold('a **strong** word')).toBe(
      'a <strong>strong</strong> word',
    );
  });

  it('escapes HTML BEFORE bolding, so author text cannot inject markup', () => {
    // The escape order is the security boundary: `<` and `&` must become
    // entities before the ** replacement can wrap anything in real tags.
    expect(renderInlineBold('<script>alert(1)</script>')).toBe(
      '&lt;script>alert(1)&lt;/script>',
    );
    expect(renderInlineBold('AT&T **wins**')).toBe(
      'AT&amp;T <strong>wins</strong>',
    );
  });

  it('trims surrounding whitespace', () => {
    expect(renderInlineBold('  hello  ')).toBe('hello');
  });

  it('leaves text without marks unchanged (after escaping)', () => {
    expect(renderInlineBold('plain text')).toBe('plain text');
  });
});
