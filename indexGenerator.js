import fs from 'fs/promises';
import path from 'path';
import { getPostsMetadata } from './postGenerator.js';
/**
 * index.html 정적 생성 모듈
 */
const TEMPLATES_DIR = 'templates';
const OUTPUT_FILE = 'index.html';
/**
 * 메인 index.html 페이지 생성
 */
export async function generateIndexPage(config) {
    // 기본 설정
    const siteConfig = config || {
        title: process.env.SITE_TITLE || 'Trending Topics Daily',
        description: process.env.SITE_DESCRIPTION || 'Daily analysis of top trending topics',
        url: process.env.SITE_URL || 'https://yourusername.github.io/auto-publisher'
    };
    console.log('📄 Generating index.html...');
    // 모든 게시글 메타데이터 가져오기
    const posts = await getPostsMetadata();
    // 게시글 카드 HTML 생성
    const postsHtml = generatePostsListHtml(posts);
    // 템플릿 로드
    const template = await loadTemplate('index.html');
    // 데이터 주입
    const html = template
        .replace(/{{site_title}}/g, siteConfig.title)
        .replace(/{{site_description}}/g, siteConfig.description)
        .replace(/{{site_url}}/g, siteConfig.url)
        .replace(/{{posts_list}}/g, postsHtml)
        .replace(/{{total_posts}}/g, posts.length.toString())
        .replace(/{{last_updated}}/g, new Date().toISOString())
        .replace(/{{year}}/g, new Date().getFullYear().toString());
    // index.html 저장
    await fs.writeFile(OUTPUT_FILE, html, 'utf-8');
    console.log(`✅ index.html generated with ${posts.length} posts`);
}
/**
 * 게시글 목록 HTML 생성 (최신 5개 + 이전 게시글 목록)
 */
function generatePostsListHtml(posts) {
    if (posts.length === 0) {
        return '<p class="no-posts">아직 게시글이 없습니다.</p>';
    }
    let html = '';
    // 최신 5개 게시글 (카드 형식)
    const latestPosts = posts.slice(0, 5);
    if (latestPosts.length > 0) {
        html += `
    <div class="latest-posts-section">
      <h3 class="section-title">🔥 최신 트렌드</h3>
      <div class="posts-grid">
    `;
        latestPosts.forEach(post => {
            html += `
        <article class="post-card">
          <div class="post-rank">#${post.rank}</div>
          ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" class="post-image" onerror="this.style.display='none'">` : ''}
          <div class="post-content">
            <h2 class="post-title">
              <a href="posts/${escapeHtml(post.originalUrl)}">${escapeHtml(post.title)}</a>
            </h2>
            <time class="post-date" datetime="${post.date}">${formatDate(post.date)}</time>
            <p class="post-description">${escapeHtml(post.description)}</p>
            ${post.keywords.length > 0 ? `
              <div class="post-keywords">
                ${post.keywords.slice(0, 5).map(kw => `<span class="keyword">${escapeHtml(kw)}</span>`).join('')}
              </div>
            ` : ''}
            <a href="posts/${escapeHtml(post.originalUrl)}" class="read-more">자세히 읽기 →</a>
          </div>
        </article>
      `;
        });
        html += `
      </div>
    </div>
    `;
    }
    // 이전 게시글 (심플한 목록)
    const olderPosts = posts.slice(5);
    if (olderPosts.length > 0) {
        html += `
    <div class="archive-posts-section">
      <h3 class="section-title">📚 이전 게시글</h3>
      <ul class="archive-list">
    `;
        olderPosts.forEach(post => {
            html += `
        <li class="archive-item">
          <a href="posts/${escapeHtml(post.originalUrl)}" class="archive-link">
            <span class="archive-title">${escapeHtml(post.title)}</span>
            <span class="archive-date">${formatDate(post.date)}</span>
          </a>
        </li>
      `;
        });
        html += `
      </ul>
    </div>
    `;
    }
    return html;
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
 * HTML 이스케이프
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
/**
 * 날짜 포맷팅
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
//# sourceMappingURL=indexGenerator.js.map