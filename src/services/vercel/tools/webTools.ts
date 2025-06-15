import { z } from "zod";
import { tool } from "ai";
import { fetch } from "@tauri-apps/plugin-http";

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  domain: string;
  position?: number;
  sitelinks?: Array<{ title: string; link: string }>;
  date?: string;
  price?: number;
  currency?: string;
  priceRange?: string;
}

export interface SearchResponse {
  status: string;
  request_id: string;
  data: SearchResult[];
}

export interface SearchToolResult {
  results: SearchResult[];
  summary: string;
  metadata: {
    request_id: string;
    total_results: number;
    additional_data?: any;
  };
  error?: string;
  details?: string;
}

export interface AggregateSearchResult {
  web_search: SearchToolResult;
  duck_duck_go_search: SearchToolResult;
  google_search: SearchToolResult;
  summary: string;
  metadata: {
    request_id: string;
    total_results: number;
    source_counts: {
      web_search: number;
      duck_duck_go_search: number;
      google_search: number;
    };
  };
  error?: string;
  details?: string;
  partial_results?: {
    web_search: SearchToolResult | null;
    duck_duck_go_search: SearchToolResult | null;
    google_search: SearchToolResult | null;
  };
}

export interface ScrapingResult {
  title: string;
  content: string;
  markdown: string;
  error?: string;
}

const webTools = {
  web_search: tool({
    description:
      "Search the web using a real-time search API. Best for current information and news. Returns relevant URLs and snippets. Use this when you need up-to-date information or news articles.",
    parameters: z.object({
      query: z.string().describe("The search query to look up"),
      limit: z
        .number()
        .optional()
        .default(5)
        .describe("Maximum number of results to return (1-10)"),
    }),
    execute: async ({ query, limit = 5 }) => {
      try {
        const url = new URL(
          "https://real-time-web-search.p.rapidapi.com/search",
        );
        url.searchParams.set("q", query);
        url.searchParams.set(
          "limit",
          Math.min(Math.max(1, limit), 10).toString(),
        );
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "real-time-web-search.p.rapidapi.com",
          },
        });
        const data = await response.json() as SearchResponse;
        if (data.status !== "OK") {
          return {
            error: "Search failed with status: " + data.status,
            details: JSON.stringify(data),
          };
        }
        const results = data.data.map((result) => ({
          title: result.title,
          snippet: result.snippet,
          url: result.url,
          domain: result.domain,
        }));
        return {
          results,
          summary: `Found ${results.length} results for \"${query}\"`,
          metadata: {
            request_id: data.request_id,
            total_results: results.length,
          },
        };
      } catch (error) {
        return {
          error: "Search request failed",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  }),
  duck_duck_go_search: tool({
    description:
      "Search the web using DuckDuckGo. Best for privacy-focused searches and general information. Returns relevant URLs and snippets. Use this when you want to avoid personalized results or need general information about a topic.",
    parameters: z.object({
      query: z.string().describe("The search query to look up"),
    }),
    execute: async ({ query }) => {
      try {
        const url = new URL("https://duckduckgo8.p.rapidapi.com/");
        url.searchParams.set("q", query);
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "duckduckgo8.p.rapidapi.com",
          },
        });
        const data = await response.json();
        if (!data.results || !Array.isArray(data.results)) {
          return {
            error: "DuckDuckGo API returned unexpected response",
            details: JSON.stringify(data),
          };
        }
        const results = data.results.map((result: any) => ({
          title: result.title,
          snippet: result.description,
          url: result.url,
          domain: new URL(result.url).hostname,
        }));
        return {
          results,
          summary: `Found ${results.length} results for \"${query}\"`,
          metadata: {
            request_id: crypto.randomUUID(),
            total_results: results.length,
          },
        };
      } catch (error) {
        return {
          error: "Search request failed",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  }),
  google_search: tool({
    description:
      "Search the web using Google. Best for comprehensive results with rich metadata. Returns URLs, snippets, and additional information like related searches and places. Use this when you need detailed information with related content and local results.",
    parameters: z.object({
      query: z.string().describe("The search query to look up"),
    }),
    execute: async ({ query }) => {
      try {
        const url = new URL(
          "https://google-search-master.p.rapidapi.com/search",
        );
        url.searchParams.set("q", query);
        url.searchParams.set("gl", "us");
        url.searchParams.set("hl", "en");
        url.searchParams.set("autocorrect", "true");
        url.searchParams.set("num", "10");
        url.searchParams.set("page", "1");
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
            "x-rapidapi-host": "google-search-master.p.rapidapi.com",
          },
        });
        const data = await response.json();
        if (!data.organic || !Array.isArray(data.organic)) {
          return {
            error: "Google API returned unexpected response",
            details: JSON.stringify(data),
          };
        }
        const results = data.organic.map((result: any) => ({
          title: result.title,
          snippet: result.snippet,
          url: result.link,
          domain: new URL(result.link).hostname,
          position: result.position,
          sitelinks: result.sitelinks || [],
          date: result.date,
          price: result.price,
          currency: result.currency,
          priceRange: result.priceRange,
        }));
        const additionalData = {
          places: data.places || [],
          peopleAlsoAsk: data.peopleAlsoAsk || [],
          relatedSearches: data.relatedSearches || [],
          searchParameters: data.searchParameters,
        };
        return {
          results,
          summary: `Found ${results.length} results for \"${query}\"`,
          metadata: {
            request_id: crypto.randomUUID(),
            total_results: results.length,
            additional_data: additionalData,
          },
        };
      } catch (error) {
        return {
          error: "Search request failed",
          details: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  }),
  aggregate_search: tool({
    description:
      "Perform a comprehensive web search using all available search engines (Web Search, DuckDuckGo, and Google) simultaneously. Best for thorough research and comparing results across different sources. Returns combined results with deduplication and source attribution. Use this when you need the most comprehensive coverage of a topic or want to compare results from different search engines.",
    parameters: z.object({
      query: z.string().describe(
        "The search query to look up across all search engines",
      ),
    }),
    execute: async ({ query }): Promise<AggregateSearchResult> => {
      try {
        // Run all searches in parallel
        const toolOptions = {
          toolCallId: crypto.randomUUID(),
          messages: [],
        };
        const [webResults, duckDuckGoResults, googleResults] = await Promise
          .all([
            webTools.web_search.execute({ query, limit: 10 }, toolOptions),
            webTools.duck_duck_go_search.execute({ query }, toolOptions),
            webTools.google_search.execute({ query }, toolOptions),
          ].map(async (promise) => {
            const result = await promise;
            return {
              results: result.results || [],
              summary: result.summary || "",
              metadata: {
                request_id: result.metadata?.request_id || crypto.randomUUID(),
                total_results: result.metadata?.total_results || 0,
              },
              error: result.error,
              details: result.details,
            };
          }));
        const errors: string[] = [webResults, duckDuckGoResults, googleResults]
          .filter((result) => result.error)
          .map((result) => result.error as string);
        if (errors.length > 0) {
          return {
            error: "Some searches failed",
            details: errors.join(", "),
            partial_results: {
              web_search: webResults.error ? null : webResults,
              duck_duck_go_search: duckDuckGoResults.error
                ? null
                : duckDuckGoResults,
              google_search: googleResults.error ? null : googleResults,
            },
            web_search: webResults,
            duck_duck_go_search: duckDuckGoResults,
            google_search: googleResults,
            summary: "Partial results due to errors",
            metadata: {
              request_id: crypto.randomUUID(),
              total_results: 0,
              source_counts: {
                web_search: 0,
                duck_duck_go_search: 0,
                google_search: 0,
              },
            },
          };
        }
        return {
          web_search: webResults,
          duck_duck_go_search: duckDuckGoResults,
          google_search: googleResults,
          summary: `Found ${
            webResults.results.length + duckDuckGoResults.results.length +
            googleResults.results.length
          } total results across all search engines for "${query}"`,
          metadata: {
            request_id: crypto.randomUUID(),
            total_results: webResults.results.length +
              duckDuckGoResults.results.length + googleResults.results.length,
            source_counts: {
              web_search: webResults.results.length,
              duck_duck_go_search: duckDuckGoResults.results.length,
              google_search: googleResults.results.length,
            },
          },
        };
      } catch (error) {
        return {
          error: "Aggregate search failed",
          details: error instanceof Error ? error.message : "Unknown error",
          web_search: {
            results: [],
            summary: "",
            metadata: { request_id: "", total_results: 0 },
          },
          duck_duck_go_search: {
            results: [],
            summary: "",
            metadata: { request_id: "", total_results: 0 },
          },
          google_search: {
            results: [],
            summary: "",
            metadata: { request_id: "", total_results: 0 },
          },
          summary: "Search failed",
          metadata: {
            request_id: crypto.randomUUID(),
            total_results: 0,
            source_counts: {
              web_search: 0,
              duck_duck_go_search: 0,
              google_search: 0,
            },
          },
        };
      }
    },
  }),
};

export default webTools;
