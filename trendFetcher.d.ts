import type { Trend } from './types.js';
/**
 * 트렌드 가져오기
 */
export declare function fetchTrends(): Promise<Trend[]>;
/**
 * 여러 지역의 트렌드를 가져오기 (선택사항)
 */
export declare function fetchMultiRegionTrends(regions?: string[]): Promise<Trend[]>;
//# sourceMappingURL=trendFetcher.d.ts.map