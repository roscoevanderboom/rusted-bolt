import { ExternalLink, Globe, Shield, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DuckDuckGoSearchResult {
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

interface DuckDuckGoSearchResultsProps {
  results: DuckDuckGoSearchResult[];
  metadata?: {
    request_id: string;
    total_results: number;
  };
}

export default function DuckDuckGoSearchResults(
  { results, metadata }: DuckDuckGoSearchResultsProps,
) {
  return (results && results.length > 0)
    ? (
      <div className="space-y-4">
        {/* Search Header */}
        <div className="flex items-center justify-between pb-2 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="font-medium">DuckDuckGo Search Results</span>
            {metadata && (
              <Badge variant="secondary" className="ml-2">
                {metadata.total_results} results
              </Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
          >
            <Shield className="w-3 h-3 mr-1" />
            Privacy Protected
          </Badge>
        </div>

        {/* Results List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {results.map((result, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg border dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors group"
              >
                {/* Result Header */}
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{result.domain}</span>
                </div>

                {/* Result Title */}
                <h3 className="text-lg font-medium mb-2 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                  {result.title}
                </h3>

                {/* Result Snippet */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {result.snippet}
                </p>

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
        </ScrollArea>

        {/* Footer */}
        {metadata && (
          <div className="pt-2 border-t dark:border-gray-700 text-xs text-gray-500">
            <span>Request ID: {metadata.request_id}</span>
          </div>
        )}
      </div>
    )
    : <div className="text-sm text-gray-500">No results found</div>;
}
