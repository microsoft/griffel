export interface EvaluationResult {
  confident: boolean;
  value?: unknown;
  error?: Error;
}
