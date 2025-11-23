import fs from 'fs/promises';
import path from 'path';
/**
 * 게시글 HTML 파일 생성 모듈
 */
const POSTS_DIR = 'posts';
const TEMPLATES_DIR = 'templates';
/**
 * 게시글 HTML 파일 생성
 */
export async function generatePost(contentResult, date = new Date()) {
    const { trend, content, summary, keywords } = contentResult;
    if (!content) {
        throw new Error('Content is null');
    }
    // 날짜 포맷팅
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${dateStr}-trend-${trend.rank}.html`;
    const filePath = path.join(POSTS_DIR, fileName);
    // 메타데이터 생성
    const metadata = {
        title: trend.title,
        date: dateStr,
        description: summary || trend.description,
        keywords: keywords || [],
        imageUrl: trend.imageUrl,
        originalUrl: trend.newsUrl,
        rank: trend.rank
    };
    // HTML 템플릿 로드
    const template = await loadTemplate('post.html');
    // 템플릿에 데이터 주입
    const html = populateTemplate(template, {
        ...metadata,
        content: convertMarkdownToHtml(content),
        year: date.getFullYear().toString()
    });
    // 디렉토리 생성 (없으면)
    await fs.mkdir(POSTS_DIR, { recursive: true });
    // HTML 파일 저장
    await fs.writeFile(filePath, html, 'utf-8');
    console.log(`✅ Post generated: ${filePath}`);
    return filePath;
}
/**
 * 배치로 여러 게시글 생성
 */
export async function generatePosts(contentResults, date = new Date()) {
    const filePaths = [];
    for (const result of contentResults) {
        if (result.success && result.content) {
            try {
                const filePath = await generatePost(result, date);
                filePaths.push(filePath);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                console.error(`❌ Failed to generate post for "${result.trend.title}":`, message);
            }
        }
    }
    return filePaths;
}
/**
 * 템플릿 파일 로드
 */
async function loadTemplate(templateName) {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    try {
        return await fs.readFile(templatePath, 'utf-8');
    }
    catch (error) {
        throw new Error(`Failed to load template: ${templatePath}`);
    }
}
/**
 * 템플릿에 데이터 주입 (간단한 플레이스홀더 치환)
 */
function populateTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        const placeholder = `{{${key}}}`;
        let replacement;
        if (Array.isArray(value)) {
            replacement = value.join(', ');
        }
        else if (typeof value === 'number') {
            replacement = value.toString();
        }
        else {
            replacement = value;
        }
        result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    return result;
}
/**
 * 간단한 Markdown to HTML 변환
 * (실제 프로덕션에서는 marked 같은 라이브러리 사용 권장)
 */
function convertMarkdownToHtml(markdown) {
    let html = markdown;
    // 헤딩
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // 볼드
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 이탤릭
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 링크
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // 줄바꿈 (두 개의 개행을 <p> 태그로)
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs
        .map(p => {
        p = p.trim();
        // 이미 태그로 시작하면 그대로
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol')) {
            return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    })
        .join('\n');
    return html;
}
/**
 * 게시글 메타데이터 목록 생성 (index.html 생성에 사용)
 */
export async function getPostsMetadata() {
    try {
        const files = await fs.readdir(POSTS_DIR);
        const htmlFiles = files.filter((f) => f.endsWith('.html'));
        const metadataList = [];
        for (const file of htmlFiles) {
            const filePath = path.join(POSTS_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');
            // HTML에서 메타데이터 추출
            const metadata = extractMetadataFromHtml(content, file);
            if (metadata) {
                metadataList.push(metadata);
            }
        }
        // 날짜 역순 정렬 (최신이 먼저)
        return metadataList.sort((a, b) => b.date.localeCompare(a.date));
    }
    catch (error) {
        console.error('Failed to get posts metadata:', error);
        return [];
    }
}
/**
 * HTML에서 메타데이터 추출
 */
function extractMetadataFromHtml(html, fileName) {
    try {
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const descMatch = html.match(/<meta name="description" content="(.*?)"/);
        const keywordsMatch = html.match(/<meta name="keywords" content="(.*?)"/);
        const dateMatch = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
        const rankMatch = fileName.match(/trend-(\d+)\.html$/);
        return {
            title: titleMatch?.[1] || 'Untitled',
            date: dateMatch?.[1] || new Date().toISOString().split('T')[0],
            description: descMatch?.[1] || '',
            keywords: keywordsMatch?.[1]?.split(', ') || [],
            imageUrl: '',
            originalUrl: fileName,
            rank: rankMatch?.[1] ? parseInt(rankMatch[1]) : 0
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=postGenerator.js.map