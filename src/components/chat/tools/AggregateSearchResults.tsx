import React from "react";
import { ExternalLink, Globe, Search, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchResult {
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

interface SearchResults {
  results: SearchResult[];
  query: string;
  metadata?: {
    request_id: string;
    total_results: number;
    additional_data?: any;
  };
}

interface AggregateSearchResultsProps {
  webSearch: SearchResults;
  duckDuckGoSearch: SearchResults;
  googleSearch: SearchResults;
}

export default function AggregateSearchResults({
  webSearch,
  duckDuckGoSearch,
  googleSearch,
}: AggregateSearchResultsProps) {
  const [activeTab, setActiveTab] = React.useState("all");

  // Combine all results, removing duplicates based on URL
  const allResults = React.useMemo(() => {
    const seen = new Set<string>();
    const combined = [
      ...webSearch.results,
      ...duckDuckGoSearch.results,
      ...googleSearch.results,
    ].filter((result) => {
      if (seen.has(result.url)) return false;
      seen.add(result.url);
      return true;
    });
    return combined;
  }, [webSearch.results, duckDuckGoSearch.results, googleSearch.results]);

  const renderResults = (results: SearchResult[]) => (
    <div className="space-y-4">
      {results.map((result, idx) => (
        <div
          key={idx}
          className="p-4 rounded-lg border dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors group"
        >
          {/* Result Header */}
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{result.domain}</span>
          </div>

          {/* Result Title */}
          <h3 className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
            {result.title}
          </h3>

          {/* Result Snippet */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {result.snippet}
          </p>

          {/* Sitelinks if available */}
          {result.sitelinks && result.sitelinks.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {result.sitelinks.map((link, linkIdx) => (
                <Button
                  key={linkIdx}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(link.link, "_blank")}
                >
                  {link.title}
                </Button>
              ))}
            </div>
          )}

          {/* Additional Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            {result.date && <span>Published: {result.date}</span>}
            {result.price && (
              <span>
                Price: {result.currency || "$"}
                {result.price}
              </span>
            )}
            {result.priceRange && <span>{result.priceRange}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(result.url, "_blank")}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Visit Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Relevant
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between pb-2 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" />
          <span className="font-medium">Aggregate Search Results</span>
          <Badge variant="secondary" className="ml-2">
            {allResults.length} total results
          </Badge>
        </div>
      </div>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            All Results ({allResults.length})
          </TabsTrigger>
          <TabsTrigger value="web" className="flex-1">
            Web Search ({webSearch.results.length})
          </TabsTrigger>
          <TabsTrigger value="duckduckgo" className="flex-1">
            DuckDuckGo ({duckDuckGoSearch.results.length})
          </TabsTrigger>
          <TabsTrigger value="google" className="flex-1">
            Google ({googleSearch.results.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[600px]">
            {renderResults(allResults)}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="web">
          <ScrollArea className="h-[600px]">
            {renderResults(webSearch.results)}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="duckduckgo">
          <ScrollArea className="h-[600px]">
            {renderResults(duckDuckGoSearch.results)}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="google">
          <ScrollArea className="h-[600px]">
            {renderResults(googleSearch.results)}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="pt-2 border-t dark:border-gray-700 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Web Search ID: {webSearch.metadata?.request_id}</span>
          <span>DuckDuckGo ID: {duckDuckGoSearch.metadata?.request_id}</span>
          <span>Google ID: {googleSearch.metadata?.request_id}</span>
        </div>
      </div>
    </div>
  );
}
