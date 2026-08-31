declare module 'inquirer' {
  export type Answers = Record<string, unknown>;
  export interface Question {
    type: string;
    name: string;
    message: string;
    default?: unknown;
    choices?: unknown[];
  }
  export function prompt(questions: Question[]): Promise<Answers>;
}
