export const apiHost = "https://s.unicompat.com"; 

// mediaHost is only necessary when Django serializer returns with model_to_dict
// rather than returning a model instance directly
export const mediaHost = "https://static-s3.unicompat.com"; 

export interface Params {
  codePoint?: string;
  searchTerm?: string;
  sequencePoints?: string;
  blockSlug?: string;
  page?: string;
}

// Important to keep this synced with Django globals.py file
export const ErrorCodes = {
  noSearchResults: "NO_SEARCH_RESULTS",
  invalidCodePoint: "INVALID_CODE_POINT",
  ok: "OK",
};
