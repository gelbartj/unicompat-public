import React, { useEffect, useState, useReducer } from "react";
import { apiHost } from "./globalSettings";
import axios from "axios";
import { TopBlock } from "./TopBlock";
import { OSData } from "./OSData";
import { FAQs } from "./FAQs";
import { InvalidCPBlock } from "./InvalidCPBlock";
import {
  UserPercentBlock,
  SourceCitation,
  EmojiNote,
} from "./UserPercentBlock";
import { DetailTable } from "./DetailTable";
import { Layout } from "./Layout";
import { useParams, withRouter } from "react-router-dom";
import { ServerErrorBlock } from "./ServerErrorBlock";

export interface DBData {
  glyph: any | null;
  decomp: any | null;
  oses: any | null;
  noto: any | null;
}

interface InitialState {
  isLoading: boolean;
  dbData: DBData | null;
  slug: string;
  gotSearchResults: boolean;
  isSearch: boolean;
  fontData?: any;
  osFontData?: any;
  featuredOS?: any;
  newRequest: string | null;
  redirect: string;
  isError: boolean;
  emojiNoteHighlighted: boolean;
}

const GlyphDashboardNoRouter: React.FC<any> = (props) => {
  let { codePoint, searchTerm } = useParams();

  const initialState: InitialState = {
    isLoading: false,
    dbData: null,
    slug: codePoint || searchTerm || "",
    gotSearchResults: false,
    isSearch: false,
    newRequest: null,
    redirect: "",
    isError: false,
    emojiNoteHighlighted: false
  };

  function dbReducer(state: InitialState, action: any): InitialState {
    // const searchSplit = requestedValue.split("search=");
    switch (action.type) {
      case "FETCH_DATA": {
        return {
          ...state,
          isLoading: true,
          dbData: null,
          isSearch: !!searchTerm,
        };
      }

      case "FETCH_DATA_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          dbData: action.payload,
          slug:
            action.payload.glyph.codePoint?.toString(16) ||
            codePoint ||
            searchTerm ||
            "",
          gotSearchResults: !!action.payload.glyph?.codePoint,
          isError: false
        };
      }

      case "FETCH_OS_DATA": {
        return {
          ...state,
          isLoading: true,
          osFontData: null,
          featuredOS: action.payload,
        };
      }

      case "FETCH_OS_DATA_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          osFontData: action.payload,
          isError: false
        };
      }

      case "RESET_FEATURED_OS": {
        return {
          ...state,
          featuredOS: null,
        };
      }

      case "FETCH_FONT_DATA": {
        return {
          ...state,
          isLoading: true,
          fontData: null,
        };
      }

      case "FETCH_FONT_DATA_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          fontData: action.payload,
          isError: false
        };
      }

      case "SEARCH_SUCCESS": {
        return {
          ...state,
          redirect: action.payload.toString(16),
          isError: false
        }
      }

      case "FETCH_DATA_ERROR": {
        return {
          ...state,
          isError: true
        }
      }

      case "HIGHLIGHT_EMOJI_NOTE": {
        return {
          ...state,
          emojiNoteHighlighted: true
        }
      }

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  useEffect(() => {
    let mounted = true;

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestedSlug = codePoint || searchTerm;

    const getObjects = async () => {
      dispatch({ type: "FETCH_DATA" });

      const apiURL =
        `${apiHost}/api/` +
        (searchTerm
          ? `glyphsearch/${requestedSlug}`
          : `glyph/${requestedSlug}`
        ).split("#")[0]; // remove react-router hash

      await axios
        .get(apiURL, {
          cancelToken: source.token,
        })
        .then((res) => {
          if (mounted) {
            // console.log("DATA: ", res.data);
            dispatch({ type: "FETCH_DATA_SUCCESS", payload: res.data });
            const newTitle =
              "unicompat" +
              (res.data.glyph?.codePoint
                ? ` ~ U+${res.data.glyph.codePoint
                    .toString(16)
                    .toUpperCase()}: ` + res.data.glyph?.officialName
                : ` ~ Search: "${decodeURIComponent(searchTerm)}"`);
            window.document.title = newTitle;
            if (res.data.glyph?.codePoint && searchTerm) {
              // Can't use react-router history here because we want to change URL without causing reload
              window.history.pushState({}, "unicompat ~ " + res.data.glyph.officialName, "/" + res.data.glyph.codePoint.toString(16));
            }
          }
        })
        .catch((e) => {
          dispatch({ type: "FETCH_DATA_ERROR", payload: e});
          window.document.title = "unicompat ~ Server Error";
          console.log(e);
        });
    };

    if (requestedSlug) {
      getObjects();
    }

    return () => {
      mounted = false;
      // source.cancel("useEffect stopped");
    };
  }, [
    dataState.newRequest,
    dataState.isSearch,
    codePoint,
    searchTerm,
    props.history,
  ]);

  const [showCharDetails, setShowCharDetails] = useState(false);

  return (
    <>
      <Layout dispatch={dispatch}>
        { dataState.isError ? <ServerErrorBlock /> :
        dataState.dbData?.glyph?.codePoint === null ? (
          <InvalidCPBlock
            slug={dataState.slug}
            gotSearchResults={dataState.gotSearchResults}
            isSearch={dataState.isSearch}
            dispatch={dispatch}
          />
        ) : (
          <>
            <TopBlock
              dbData={dataState.dbData}
              slug={dataState.slug}
              dispatch={dispatch}
            />
            <UserPercentBlock dbData={dataState.dbData} />
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <button
                className="btn showCharBtn"
                onClick={() => setShowCharDetails(!showCharDetails)}
              >
                {showCharDetails ? "Hide" : "Show"} character details
              </button>
            </div>
            <div
              className={
                "detailTableWrap" + (showCharDetails ? " active" : " hidden")
              }
            >
              <DetailTable dbData={dataState.dbData} />
            </div>

            <OSData dbData={dataState.dbData} />

            <div className="bottomWrap">
              <FAQs />
              <SourceCitation />
              {dataState.dbData?.glyph?.isEmoji &&
                dataState.dbData?.glyph?.hasColorEmoji && <EmojiNote highlighted={dataState.emojiNoteHighlighted} />}
            </div>
          </>
        )}
      </Layout>
    </>
  );
};

export const GlyphDashboard = withRouter(GlyphDashboardNoRouter);
