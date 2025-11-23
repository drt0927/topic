import 'dotenv/config';
import { fetchTrends } from './trendFetcher.js';
import { initializeGemini, generateBatchContent } from './contentGenerator.js';
import { generatePosts } from './postGenerator.js';
import { generateIndexPage } from './indexGenerator.js';
/**
 * 메인 실행 스크립트
 * 전체 워크플로우: 트렌드 수집 → 콘텐츠 생성 → 게시글 HTML 저장 → index.html 재생성
 */
async function main() {
    try {
        console.log('🚀 Starting auto-publisher...\n');
        // 1. 환경 변수 확인
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not found in environment variables');
        }
        // 2. Gemini API 초기화
        initializeGemini(geminiApiKey);
        console.log('');
        // 3. 트렌드 수집
        console.log('📊 Fetching trends...');
        const trends = await fetchTrends();
        console.log(`Found ${trends.length} trending topics:\n`);
        trends.forEach(t => console.log(`  ${t.rank}. ${t.title} (${t.traffic})`));
        console.log('');
        // 4. 콘텐츠 생성
        console.log('✍️  Generating content with Gemini AI...');
        const contentResults = await generateBatchContent(trends);
        const successCount = contentResults.filter(r => r.success).length;
        console.log(`✅ Generated ${successCount}/${contentResults.length} articles\n`);
        // 5. 게시글 HTML 파일 생성
        console.log('📝 Creating post HTML files...');
        const postPaths = await generatePosts(contentResults);
        console.log(`✅ Created ${postPaths.length} post files\n`);
        // 6. index.html 재생성
        console.log('🏠 Regenerating index.html...');
        await generateIndexPage();
        console.log('');
        console.log('🎉 Auto-publisher completed successfully!');
        console.log(`   - ${trends.length} trends fetched`);
        console.log(`   - ${successCount} articles generated`);
        console.log(`   - ${postPaths.length} posts created`);
        console.log(`   - index.html updated`);
    }
    catch (error) {
        console.error('\n❌ Error occurred:', error);
        process.exit(1);
    }
}
// 실행
main();
//# sourceMappingURL=main.js.map