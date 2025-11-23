import xml2js from 'xml2js';
/**
 * Google Trends RSS Feed에서 트렌딩 토픽을 가져옵니다.
 */
/**
 * Google Trends RSS Feed를 사용하여 트렌드 가져오기
 */
async function getTrendsFromRSS() {
    try {
        console.log('🔍 Fetching trends from Google Trends RSS...');
        const rssUrl = 'https://trends.google.com/trending/rss?geo=KR';
        const response = await fetch(rssUrl);
        if (!response.ok) {
            throw new Error(`RSS fetch failed: ${response.status}`);
        }
        const xmlData = await response.text();
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);
        // RSS 데이터 파싱
        const items = result.rss?.channel?.[0]?.item || [];
        // Top 5 추출
        const trends = items.slice(0, 5).map((item, index) => {
            const title = item.title?.[0] || 'Unknown Title';
            const description = item.description?.[0] || '';
            const traffic = item['ht:approx_traffic']?.[0] || 'Unknown';
            const newsItem = item['ht:news_item']?.[0] || {};
            return {
                rank: index + 1,
                title: title,
                description: description,
                traffic: traffic,
                imageUrl: newsItem['ht:picture']?.[0] || '',
                newsUrl: newsItem['ht:news_item_url']?.[0] || '',
                relatedQueries: []
            };
        });
        console.log(`✅ Successfully fetched ${trends.length} trends from RSS`);
        return trends;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to fetch from RSS Feed:', message);
        throw error;
    }
}
/**
 * 트렌드 가져오기
 */
export async function fetchTrends() {
    return await getTrendsFromRSS();
}
/**
 * 여러 지역의 트렌드를 가져오기 (선택사항)
 */
export async function fetchMultiRegionTrends(regions = ['US', 'GB', 'IN', 'JP', 'KR']) {
    const allTrends = [];
    for (const region of regions) {
        try {
            console.log(`🌍 Fetching trends for ${region}...`);
            const rssUrl = `https://trends.google.com/trending/rss?geo=${region}`;
            const response = await fetch(rssUrl);
            if (!response.ok) {
                console.warn(`⚠️ Failed to fetch for ${region}: ${response.status}`);
                continue;
            }
            const xmlData = await response.text();
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xmlData);
            const items = result.rss?.channel?.[0]?.item || [];
            items.slice(0, 2).forEach((item) => {
                const title = item.title?.[0] || 'Unknown Title';
                const description = item.description?.[0] || '';
                const traffic = item['ht:approx_traffic']?.[0] || 'Unknown';
                const newsItem = item['ht:news_item']?.[0] || {};
                allTrends.push({
                    region: region,
                    rank: 0, // 나중에 정렬 후 업데이트
                    title: title,
                    description: description,
                    traffic: traffic,
                    imageUrl: newsItem['ht:news_item_picture']?.[0] || '',
                    newsUrl: newsItem['ht:news_item_url']?.[0] || '',
                    relatedQueries: []
                });
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`⚠️ Failed to fetch trends for ${region}:`, message);
        }
    }
    // 트래픽 기준으로 정렬하고 top 5 반환
    return allTrends
        .sort((a, b) => {
        const trafficA = parseInt(a.traffic.replace(/[+,]/g, '')) || 0;
        const trafficB = parseInt(b.traffic.replace(/[+,]/g, '')) || 0;
        return trafficB - trafficA;
    })
        .slice(0, 5)
        .map((trend, index) => ({ ...trend, rank: index + 1 }));
}
//# sourceMappingURL=trendFetcher.js.map