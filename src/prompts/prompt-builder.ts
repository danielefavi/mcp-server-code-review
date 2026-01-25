/**
 * A builder class for constructing prompts with fluent method chaining.
 */
export default class PromptBuilder {
  private prompt: string = '';

  /**
   * Creates a new PromptBuilder instance.
   * @param prompt - Initial prompt text (defaults to empty string)
   */
  constructor(prompt: string = '') {
    this.prompt = prompt;
  }

  /**
   * Sets the prompt to the specified text, replacing any existing content.
   * @param text - The text to set as the prompt
   * @returns The builder instance for method chaining
   */
  public setPrompt(text: string) {
    this.prompt = text;
    return this;
  }

  /**
   * Replaces the first occurrence of a wildcard string with the specified text.
   * @param wildcard - The wildcard string to search for
   * @param text - The text to replace the wildcard with
   * @returns The builder instance for method chaining
   */
  public replaceWildCard(wildcard: string, text: string) {
    this.prompt = this.prompt.replace(wildcard, text);
    return this;
  }

  /**
   * Appends text to the end of the current prompt.
   * @param text - The text to append
   * @returns The builder instance for method chaining
   */
  public add(text: string) {
    this.prompt += text;
    return this;
  }

  /**
   * Appends text as a new paragraph with preceding newlines.
   * @param text - The text to append as a paragraph
   * @param newlines - The newline characters to prepend (defaults to '\n\n')
   * @returns The builder instance for method chaining
   */
  public addParagraph(text: string, newlines: string = '\n\n') {
    this.prompt += newlines + text;
    return this;
  }

  /**
   * Returns the constructed prompt string.
   * @returns The current prompt text
   */
  public get() {
    return this.prompt;
  }

  /**
   * Resets the prompt to an empty string.
   */
  public resetPrompt() {
    this.prompt = '';
  }
}
