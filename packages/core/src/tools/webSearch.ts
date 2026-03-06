export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export type WebSearchProvider = 'MOCK' | 'WIKIPEDIA';

export interface WebSearchOptions {
  provider?: WebSearchProvider;
  maxResults?: number;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function wikipediaSearch(query: string, maxResults: number): Promise<WebSearchResult[]> {
  const endpoint = new URL('https://en.wikipedia.org/w/api.php');
  endpoint.searchParams.set('action', 'query');
  endpoint.searchParams.set('list', 'search');
  endpoint.searchParams.set('format', 'json');
  endpoint.searchParams.set('utf8', '1');
  endpoint.searchParams.set('srlimit', String(maxResults));
  endpoint.searchParams.set('srsearch', query);

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'User-Agent': 'workflowos-starter/0.1'
    }
  });

  if (!response.ok) {
    throw new Error(`Wikipedia search failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    query?: {
      search?: Array<{ title: string; snippet: string; pageid: number }>;
    };
  };

  const items = payload.query?.search ?? [];
  return items.map((item) => ({
    title: item.title,
    url: `https://en.wikipedia.org/?curid=${item.pageid}`,
    snippet: stripHtml(item.snippet)
  }));
}

function mockSearch(query: string): WebSearchResult[] {
  return [
    {
      title: `Stub Result 1 for ${query}`,
      url: 'https://example.com/stub-1',
      snippet: 'Web search is running in MOCK mode. Set provider to WIKIPEDIA for live results.'
    },
    {
      title: `Stub Result 2 for ${query}`,
      url: 'https://example.com/stub-2',
      snippet: 'No external network call was executed in MOCK mode.'
    }
  ];
}

export async function webSearch(
  query: string,
  options: WebSearchOptions = {}
): Promise<WebSearchResult[]> {
  const provider = options.provider ?? 'MOCK';
  const maxResults = options.maxResults ?? 5;

  if (provider === 'MOCK') {
    return mockSearch(query);
  }

  try {
    return await wikipediaSearch(query, maxResults);
  } catch (error) {
    return [
      {
        title: `Wikipedia search unavailable for ${query}`,
        url: 'https://en.wikipedia.org/wiki/Main_Page',
        snippet: `Fallback to empty result set due to error: ${(error as Error).message}`
      }
    ];
  }
}
