import { describe, it, expect, beforeEach } from 'vitest';
import PromptBuilder from '../prompts/prompt-builder.js';

describe('PromptBuilder', () => {
  let builder: PromptBuilder;

  beforeEach(() => {
    builder = new PromptBuilder();
  });

  describe('constructor', () => {
    it('should initialize with empty string by default', () => {
      expect(builder.get()).toBe('');
    });

    it('should initialize with provided prompt', () => {
      const initialPrompt = 'Hello, world!';
      builder = new PromptBuilder(initialPrompt);
      expect(builder.get()).toBe(initialPrompt);
    });
  });

  describe('setPrompt', () => {
    it('should set the prompt text', () => {
      builder.setPrompt('New prompt');
      expect(builder.get()).toBe('New prompt');
    });

    it('should return this for chaining', () => {
      const result = builder.setPrompt('Test');
      expect(result).toBe(builder);
    });

    it('should overwrite existing prompt', () => {
      builder = new PromptBuilder('Original');
      builder.setPrompt('Replaced');
      expect(builder.get()).toBe('Replaced');
    });
  });

  describe('replaceWildCard', () => {
    it('should replace wildcard with text', () => {
      builder.setPrompt('Hello, {{name}}!');
      builder.replaceWildCard('{{name}}', 'World');
      expect(builder.get()).toBe('Hello, World!');
    });

    it('should return this for chaining', () => {
      builder.setPrompt('Test');
      const result = builder.replaceWildCard('x', 'y');
      expect(result).toBe(builder);
    });

    it('should only replace first occurrence', () => {
      builder.setPrompt('{{x}} and {{x}}');
      builder.replaceWildCard('{{x}}', 'value');
      expect(builder.get()).toBe('value and {{x}}');
    });

    it('should handle no match gracefully', () => {
      builder.setPrompt('No wildcards here');
      builder.replaceWildCard('{{missing}}', 'value');
      expect(builder.get()).toBe('No wildcards here');
    });
  });

  describe('add', () => {
    it('should append text to prompt', () => {
      builder.setPrompt('Hello');
      builder.add(' World');
      expect(builder.get()).toBe('Hello World');
    });

    it('should return this for chaining', () => {
      const result = builder.add('Test');
      expect(result).toBe(builder);
    });

    it('should work with empty initial prompt', () => {
      builder.add('First');
      expect(builder.get()).toBe('First');
    });
  });

  describe('addParagraph', () => {
    it('should add text with default double newline', () => {
      builder.setPrompt('First paragraph');
      builder.addParagraph('Second paragraph');
      expect(builder.get()).toBe('First paragraph\n\nSecond paragraph');
    });

    it('should add text with custom newlines', () => {
      builder.setPrompt('Line 1');
      builder.addParagraph('Line 2', '\n');
      expect(builder.get()).toBe('Line 1\nLine 2');
    });

    it('should return this for chaining', () => {
      const result = builder.addParagraph('Test');
      expect(result).toBe(builder);
    });

    it('should work with empty initial prompt', () => {
      builder.addParagraph('Paragraph');
      expect(builder.get()).toBe('\n\nParagraph');
    });
  });

  describe('get', () => {
    it('should return current prompt', () => {
      builder.setPrompt('Current value');
      expect(builder.get()).toBe('Current value');
    });
  });

  describe('resetPrompt', () => {
    it('should reset prompt to empty string', () => {
      builder.setPrompt('Some content');
      builder.resetPrompt();
      expect(builder.get()).toBe('');
    });
  });

  describe('method chaining', () => {
    it('should support chaining multiple methods', () => {
      const result = builder
        .setPrompt('Hello {{name}}')
        .replaceWildCard('{{name}}', 'User')
        .add('!')
        .addParagraph('Welcome')
        .get();

      expect(result).toBe('Hello User!\n\nWelcome');
    });

    it('should support complex chaining scenarios', () => {
      const result = new PromptBuilder('Template: {{a}} {{b}}')
        .replaceWildCard('{{a}}', 'First')
        .replaceWildCard('{{b}}', 'Second')
        .addParagraph('Extra content', '\n---\n')
        .add(' appended')
        .get();

      expect(result).toBe('Template: First Second\n---\nExtra content appended');
    });
  });
});
