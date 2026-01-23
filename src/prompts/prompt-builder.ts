export default class PromptBuilder {
  private prompt: string = '';

  constructor(prompt: string = '') {
    this.prompt = prompt;
  }

  public setPrompt(text: string) {
    this.prompt = text;
    return this;
  }

  public replaceWildCard(wildcard: string, text: string) {
    this.prompt = this.prompt.replace(wildcard, text);
    return this;
  }

  public add(text: string) {
    this.prompt += text;
    return this;
  }

  public addParagraph(text: string, newlines: string = "\n\n") {
    this.prompt += newlines + text;
    return this;
  }

  public get() {
    return this.prompt;
  }

  public resetPrompt() {
    this.prompt = '';
  }
}