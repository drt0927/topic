import { GoogleGenAI } from '@google/genai';
/**
 * Gemini API를 사용하여 트렌드 주제에 대한 상세 분석 콘텐츠를 생성합니다.
 */
// Gemini API 클라이언트
let genAI = null;
export function initializeGemini(apiKey) {
    if (!apiKey) {
        throw new Error('Gemini API key is required');
    }
    genAI = new GoogleGenAI({ apiKey });
    console.log('✅ Gemini API initialized');
}
/**
 * 트렌드 주제에 대한 상세 분석 콘텐츠 생성
 */
export async function generateContent(trend) {
    if (!genAI) {
        throw new Error('Gemini API not initialized. Call initializeGemini() first.');
    }
    const prompt = createPrompt(trend);
    try {
        console.log(`🤖 Generating content for: ${trend.title}`);
        // generateContent 메서드 사용
        const result = await genAI.models.generateContent({
            model: 'gemini-3-pro-preview', // 무료 티어에서 안정적으로 사용 가능
            contents: prompt
        });
        const text = result.text || '';
        console.log(`✅ Content generated (${text.length} characters)`);
        return {
            content: text,
            summary: extractSummary(text),
            keywords: extractKeywords(trend)
        };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to generate content:', message);
        throw error;
    }
}
/**
 * Gemini를 위한 프롬프트 생성
 */
function createPrompt(trend) {
    return `당신은 전문 기술 및 트렌드 분석가입니다. 다음 트렌딩 주제에 대해 상세하고 심층적인 분석 기사를 작성해주세요.

**트렌딩 주제:** ${trend.title}
${trend.description ? `**설명:** ${trend.description}` : ''}
${trend.traffic ? `**검색량:** ${trend.traffic}` : ''}
${trend.relatedQueries?.length > 0 ? `**관련 검색어:** ${trend.relatedQueries.join(', ')}` : ''}

다음 구조로 작성해주세요:

## 📊 개요
이 트렌드가 무엇인지, 왜 지금 인기를 끌고 있는지 간단히 설명합니다.

## 🔍 배경 및 맥락
이 주제의 배경, 역사적 맥락, 관련 사건들을 상세히 설명합니다.

## 💡 주요 이슈 및 논점
현재 이 주제와 관련된 주요 이슈, 논쟁점, 다양한 관점들을 분석합니다.

## 📈 영향 및 의미
이 트렌드가 사회, 경제, 기술, 문화 등에 미치는 영향을 분석합니다.

## 🔮 전망 및 예측
향후 이 트렌드가 어떻게 발전할지, 앞으로의 전망을 제시합니다.

## 💭 결론
핵심 내용을 요약하고 최종 의견을 제시합니다.

**요구사항:**
- 전문적이고 객관적인 톤 유지
- 구체적인 예시와 데이터 활용 (가능한 경우)
- 최소 1000단어 이상의 심층 분석
- 한국어로 작성
- Markdown 형식 사용
- 과장되거나 선정적인 표현 지양
`;
}
/**
 * 생성된 콘텐츠에서 요약 추출 (첫 번째 섹션 또는 처음 200자)
 */
function extractSummary(content) {
    // "개요" 섹션 찾기
    const overviewMatch = content.match(/##\s*📊\s*개요\s*\n([\s\S]*?)(?=\n##|$)/);
    if (overviewMatch && overviewMatch[1]) {
        const overview = overviewMatch[1].trim();
        return overview.length > 250 ? overview.substring(0, 247) + '...' : overview;
    }
    // 개요 섹션이 없으면 처음 200자 사용
    const plainText = content.replace(/[#*_`]/g, '').trim();
    return plainText.length > 250 ? plainText.substring(0, 247) + '...' : plainText;
}
/**
 * 트렌드에서 키워드 추출
 */
function extractKeywords(trend) {
    const keywords = new Set();
    // 제목에서 단어 추출
    trend.title.split(/\s+/).forEach(word => {
        if (word.length > 2) {
            keywords.add(word.toLowerCase());
        }
    });
    // 관련 검색어 추가
    if (trend.relatedQueries) {
        trend.relatedQueries.forEach(query => {
            keywords.add(query.toLowerCase());
        });
    }
    return Array.from(keywords).slice(0, 10);
}
/**
 * 배치로 여러 트렌드에 대한 콘텐츠 생성
 */
export async function generateBatchContent(trends) {
    const results = [];
    for (const trend of trends) {
        try {
            const generated = await generateContent(trend);
            results.push({
                trend,
                content: generated.content,
                summary: generated.summary,
                keywords: generated.keywords,
                success: true
            });
            // API 레이트 리밋 방지를 위한 짧은 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Failed to generate content for "${trend.title}":`, message);
            results.push({
                trend,
                content: null,
                success: false,
                error: message
            });
        }
    }
    return results;
}
//# sourceMappingURL=contentGenerator.js.map