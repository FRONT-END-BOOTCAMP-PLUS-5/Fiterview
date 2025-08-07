export interface TextExtractor {
  extractFromFile(file: Buffer, fileName: string): Promise<string>;
}
