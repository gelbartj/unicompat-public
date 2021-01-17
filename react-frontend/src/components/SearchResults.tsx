import React, { useEffect, useReducer } from "react";
import { apiHost, Params } from "./globalSettings";
import axios from "axios";
import { Layout } from "./Layout";
import { useParams, Link } from "react-router-dom";
import Loading from "./Loading";
import { Helmet } from "react-helmet-async";

interface SearchProps {}

interface SearchResult {
  name?: string;
  officialName?: string;
  slug?: string;
  codePoint?: number;
  cpList?: number[];
}

interface InitialState {
  isLoading: boolean;
  searchData: SearchResult[] | null;
  isError: boolean;
  count: number;
  errorCode?: number;
  title: string;
}

const initialState: InitialState = {
  isLoading: false,
  searchData: null,
  isError: false,
  count: 0,
  title: "unicompat ~ Search"
};

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const SearchResults: React.FC<SearchProps> = () => {
  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  let { searchTerm, page } = useParams<Params>();

  const parsedPage = parseInt(page || "1", 10);
  const pageNum = isNaN(parsedPage) ? 1 : parsedPage;

  const SEARCH_PAGE_SIZE = 20; // This limit is actually defined at the Django query level

  let forwardLink =
    dataState?.count && pageNum * SEARCH_PAGE_SIZE < dataState?.count
      ? `/search/${searchTerm}/${pageNum + 1}`
      : undefined;

  let backwardLink =
    dataState?.count && dataState?.count > SEARCH_PAGE_SIZE && pageNum > 1
      ? `/search/${searchTerm}/${pageNum - 1}`
      : undefined;

  function dbReducer(state: typeof initialState, action: any) {
    switch (action.type) {
      case "FETCH_SEARCH": {
        return {
          ...state,
          isLoading: true,
        };
      }

      case "FETCH_SEARCH_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          searchData: action.payload?.data?.results,
          isError: false,
          count: action.payload?.data?.count,
          errorCode: undefined,
          title: "unicompat ~ Search results: " + (action.payload?.searchTerm || "")
        };
      }

      case "FETCH_SEARCH_ERROR": {
        return {
          ...state,
          isLoading: false,
          searchData: null,
          isError: true,
          errorCode: action.payload?.response?.status,
          title: `unicompat ~ Server Error ${action.payload?.response?.status || ""}`
        };
      }

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  useEffect(() => {
    let mounted = true;

    const getSearch = async (searchTerm: string) => {
      if (searchTerm) {
        dispatch({ type: "FETCH_SEARCH", payload: searchTerm });
        await axios
          .get(`${apiHost}/api/search/${searchTerm}/?page=${pageNum}`)
          .then((res) => {
            dispatch({ type: "FETCH_SEARCH_SUCCESS", payload: {
              data: res.data, searchTerm: searchTerm } });
          })
          .catch((e) => {
            dispatch({ type: "FETCH_SEARCH_ERROR", payload: e });
            console.error(e);
          });
      }
    };

    if (mounted && searchTerm) {
      getSearch(searchTerm);
    }

    return () => {
      mounted = false;
    };
  }, [searchTerm, pageNum]);

  const message500 =
    "Sorry, we seem to be having some trouble with our server. Please try again in a moment.";

  const PageNav = () =>
    dataState?.searchData && dataState?.count > SEARCH_PAGE_SIZE ? (
      <div className="searchPageWrap">
        <span className="blockPageNum">Page {pageNum}</span>
        {forwardLink && (
          <div style={{ float: "right" }}>
            <Link to={forwardLink} className="btn btn-light">
              &gt;
            </Link>
          </div>
        )}

        {backwardLink && (
          <div style={{ float: "left" }}>
            <Link to={backwardLink} className="btn btn-light">
              &lt;
            </Link>
          </div>
        )}
      </div>
    ) : (
      <></>
    );
  return (
    <>
    <Helmet>
      <title>{dataState.title}</title>
      <meta name="description" content={`Search results for "${searchTerm}"${ dataState.count ? " (" + dataState.count + " hits)" : ""}`} />
      <link rel="canonical" href={`https://www.unicompat.com/search/${encodeURIComponent(searchTerm || "")}`} />
    </Helmet>

    <Layout>
      <h2 style={{ textAlign: "center", margin: "5px auto 10px" }}>
        {!dataState.isError && `Search Results for "${searchTerm}"`}
        {dataState.isLoading ? (
          <div style={{ fontSize: "1.2rem", marginTop: "15px" }}>
            <Loading />
          </div>
        ) : dataState.isError ? (
          <>
            <span
              className="colorEmoji"
              style={{ padding: 0, fontSize: "2em" }}
              role="img"
              aria-label="warning"
            >
              &#x26A0;&#xFE0F;
            </span>
            <br />
            {`Server Error${
              dataState?.errorCode ? " " + dataState.errorCode : ""
            }`}
          </>
        ) : (
          ""
        )}
      </h2>
      {!dataState.searchData && !dataState.isLoading && (
        <h5 style={{ margin: "20px auto", textAlign: "center" }}>
          {dataState.isError ? message500 : "Please enter a search term."}
        </h5>
      )}

      {dataState?.count && dataState?.count > SEARCH_PAGE_SIZE ? (
        <div className="largeBlockNotice">
          Got {numberWithCommas(dataState?.count)} results.
          {` Showing ${SEARCH_PAGE_SIZE} per page.`}
        </div>
      ) : (
        ""
      )}

      <div style={{ textAlign: "center" }}>
      <PageNav />
        {dataState?.searchData?.length > 0 ? (dataState?.isLoading ? <Loading dotsOnly={true} /> : (
          <div id="searchResultsWrap">
            {dataState.searchData.map((result: any, idx: number) => {
              const cpListLink = result?.cpList
                ? `/${result.cpList
                    .map((cp: number) => cp.toString(16).toUpperCase())
                    .join("-")}`
                : "";
              const cpLink = result?.codePoint
                ? `/${result.codePoint.toString(16).toUpperCase()}`
                : "";
              const blockLink = result?.slug ? `/block/${result.slug}` : "";
              return (
                <Link key={result?.cpList || result?.codePoint || result?.slug} to={cpListLink || cpLink || blockLink}>
                  <div className="searchResult">
                    <span className="searchNumber">
                      {idx + 1 + (pageNum - 1) * SEARCH_PAGE_SIZE + "."}
                    </span>
                    <div className="searchResultsImg">
                      {result?.cpList
                        ? result.cpList.map((cp: number) =>
                            String.fromCodePoint(cp)
                          ).join("")
                        : String.fromCodePoint(
                            result?.codePoint || result?.start || 0
                          )}
                    </div>
                    <div className="searchResultsName">
                      <div style={{ fontSize: "1rem", color: "initial" }}>
                        {result?.name
                          ? "Unicode block"
                          : result?.cpList
                          ? "Unicode sequence"
                          : result?.codePoint 
                          ? `U+${result.codePoint.toString(16).toUpperCase()} `
                          : ""}
                      </div>

                      {result?.name ||
                        result?.officialName
                          .split(" ")
                          .map(
                            (word: string) => {
                              if (word === "CJK") { return word; }
                              if (word.includes("IDEOGRAPH-")) {
                                return "Ideograph-" + word.split("-")[1];
                              }
                              return word[0].toUpperCase() +
                              word.slice(1).toLowerCase()
                            }
                          )
                          .join(" ")}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )) : searchTerm ? (
          dataState?.isLoading ? (
            <Loading dotsOnly={true} />
          ) : (
            <>
              No results found for "{searchTerm}." Please try again with a
              different search term.
            </>
          )
        ) : (
          ""
        )}
        <PageNav />
      </div>
    </Layout>
    </>
  );
};
