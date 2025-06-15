import {
  Calendar,
  DollarSign,
  ExternalLink,
  Globe,
  Link,
  Search,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface GoogleSearchResult {
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

interface GoogleSearchResultsProps {
  results: GoogleSearchResult[];
  metadata?: {
    request_id: string;
    total_results: number;
    additional_data?: {
      places?: any[];
      peopleAlsoAsk?: any[];
      relatedSearches?: any[];
      searchParameters?: any;
    };
  };
}

export default function GoogleSearchResults(
  { results, metadata }: GoogleSearchResultsProps,
) {
  return (results && results.length > 0)
    ? (
      <div className="space-y-4">
        {/* Search Header */}
        <div className="flex items-center justify-between pb-2 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            <span className="font-medium">Google Search Results</span>
            {metadata && (
              <Badge variant="secondary" className="ml-2">
                {metadata.total_results} results
              </Badge>
            )}
          </div>
        </div>

        {/* Results List */}
        <ScrollArea className="h-[400px]">
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
                  {result.position && (
                    <Badge variant="outline" className="ml-2">
                      Position: {result.position}
                    </Badge>
                  )}
                </div>

                {/* Result Title */}
                <h3 className="text-lg font-medium mb-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {result.title}
                </h3>

                {/* Result Snippet */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {result.snippet}
                </p>

                {/* Additional Information */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.date && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{result.date}</span>
                    </div>
                  )}
                  {result.price && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <DollarSign className="w-3 h-3" />
                      <span>{result.price} {result.currency}</span>
                    </div>
                  )}
                  {result.priceRange && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <DollarSign className="w-3 h-3" />
                      <span>{result.priceRange}</span>
                    </div>
                  )}
                </div>

                {/* Sitelinks */}
                {result.sitelinks && result.sitelinks.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Link className="w-3 h-3" />
                      <span>Related Links:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.sitelinks.map((sitelink, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => window.open(sitelink.link, "_blank")}
                        >
                          {sitelink.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* Additional Data Section */}
        {metadata?.additional_data && (
          <div className="pt-4 border-t dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">Additional Information</h4>
            {metadata.additional_data.peopleAlsoAsk &&
              metadata.additional_data.peopleAlsoAsk.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium mb-1">People Also Ask</h5>
                <div className="space-y-1">
                  {metadata.additional_data.peopleAlsoAsk.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-gray-600 dark:text-gray-300"
                    >
                      {item.question}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {metadata.additional_data.relatedSearches &&
              metadata.additional_data.relatedSearches.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-1">Related Searches</h5>
                <div className="flex flex-wrap gap-2">
                  {metadata.additional_data.relatedSearches.map((
                    search,
                    idx,
                  ) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
