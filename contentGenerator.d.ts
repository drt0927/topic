import type { Trend, GeneratedContent, ContentResult } from './types.js';
export declare function initializeGemini(apiKey: string): void;
/**
 * 트렌드 주제에 대한 상세 분석 콘텐츠 생성
 */
export declare function generateContent(trend: Trend): Promise<GeneratedContent>;
/**
 * 배치로 여러 트렌드에 대한 콘텐츠 생성
 */
export declare function generateBatchContent(trends: Trend[]): Promise<ContentResult[]>;
//# sourceMappingURL=contentGenerator.d.ts.map