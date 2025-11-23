import type { ContentResult, PostMetadata } from './types.js';
/**
 * 게시글 HTML 파일 생성
 */
export declare function generatePost(contentResult: ContentResult, date?: Date): Promise<string>;
/**
 * 배치로 여러 게시글 생성
 */
export declare function generatePosts(contentResults: ContentResult[], date?: Date): Promise<string[]>;
/**
 * 게시글 메타데이터 목록 생성 (index.html 생성에 사용)
 */
export declare function getPostsMetadata(): Promise<PostMetadata[]>;
//# sourceMappingURL=postGenerator.d.ts.map