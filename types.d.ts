/**
 * 트렌드 데이터 타입 정의
 */
export interface Trend {
    rank: number;
    title: string;
    description: string;
    traffic: string;
    imageUrl: string;
    newsUrl: string;
    relatedQueries: string[];
    region?: string;
}
export interface GeneratedContent {
    content: string;
    summary: string;
    keywords: string[];
}
export interface ContentResult {
    trend: Trend;
    content: string | null;
    summary?: string;
    keywords?: string[];
    success: boolean;
    error?: string;
}
export interface PostMetadata {
    title: string;
    date: string;
    description: string;
    keywords: string[];
    imageUrl: string;
    originalUrl: string;
    rank: number;
}
export interface SiteConfig {
    title: string;
    description: string;
    url: string;
}
//# sourceMappingURL=types.d.ts.map