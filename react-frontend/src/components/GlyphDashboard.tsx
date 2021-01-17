import React, { useEffect, useState, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { apiHost, ErrorCodes, Params } from "./globalSettings";
import axios from "axios";
import { TopBlock } from "./TopBlock";
import { OSData } from "./OSData";
import { FAQs } from "./FAQs";
import { BadStatusBlock } from "./BadStatusBlock";
import {
  UserPercentBlock,
  SourceCitation,
  EmojiNote,
} from "./UserPercentBlock";
import { DetailTable } from "./DetailTable";
import { FromSearchBanner, Layout, useQuery } from "./Layout";
import { Link, Redirect, useParams, withRouter } from "react-router-dom";
import { ServerErrorBlock } from "./ServerErrorBlock";
import { SequenceDetailTable } from "./SequenceDetailTable";
import { SequenceTopBlock } from "./SequenceTopBlock";
import { Variants, SequenceObj, VariantObj } from "./Variants";
import Loading from "./Loading";

interface Sequence {
  id: number;
  officialName: string;
  sequenceString: string;
  cpList: number[];
  glyphObjs: any[];
  isEmoji?: boolean;
  isProvisional?: boolean;
  supportPercent: number;
  variants?: SequenceObj[];
}

interface UnicodeVersion {
  number: string;
  releaseDate: string;
}

interface UnicodeBlock {
  name: string;
  slug: string;
}

export interface Glyph {
  abbreviation?: string;
  bitmap?: string;
  cantonese?: string;
  category?: string;
  categoryT?: string;
  codePlane?: number;
  codePlaneT?: string;
  codePoint: number;
  decomposition?: string;
  definition?: string;
  hasBwEmoji?: boolean;
  isEmoji?: boolean;
  japKun?: string;
  japOn?: string;
  mandarin?: string;
  minUnicodeVersion?: UnicodeVersion;
  officialName: string;
  supportPercent: number;
  surrogates?: string[];
  unicodeBlock?: UnicodeBlock;
  variants?: VariantObj[];
  isNonCharacter?: boolean;
}

interface DBBase {
  oses: any | null;
  noto: any | null;
  searchTerm?: string;
}

type GlyphData = DBBase & {
  glyph: Glyph | null;
  decomp: any | null;
};

type SequenceData = DBBase & {
  sequence: Sequence | null;
};

export type DBData = GlyphData | SequenceData;

interface InitialState {
  isLoading: boolean;
  dbData: DBData | null;
  slug: string;
  isSearch: boolean;
  fontData?: any;
  osFontData?: any;
  featuredOS?: any;
  newRequest: string | null;
  redirect: string;
  isServerError: boolean;
  emojiNoteHighlighted: boolean;
  errorMessage: string;
  badStatus: typeof ErrorCodes[keyof typeof ErrorCodes] | null;
  title: string;
}

export function isGlyphData(
  dbDataArg: GlyphData | SequenceData | null
): dbDataArg is GlyphData {
  if (dbDataArg === null) return false;
  return (dbDataArg as GlyphData).glyph !== undefined;
}

function makeSequenceSlug(cpList?: number[]) {
  if (!cpList) return "";
  return cpList
    .map((cp: number) => cp.toString(16).toUpperCase().padStart(4, "0"))
    .join("-");
}

const GlyphDashboardNoRouter: React.FC<any> = (props) => {
  let { codePoint, searchTerm, sequencePoints } = useParams<Params>();

  const initialState: InitialState = {
    isLoading: false,
    dbData: null,
    slug: codePoint || searchTerm || sequencePoints || "",
    isSearch: false,
    newRequest: null,
    redirect: "",
    isServerError: false,
    emojiNoteHighlighted: false,
    errorMessage: "",
    badStatus: null,
    title: "unicompat ~ Check OS compatibility of every Unicode character"
  };

  function dbReducer(state: InitialState, action: any): InitialState {
    // const searchSplit = requestedValue.split("search=");
    switch (action.type) {
      case "FETCH_DATA": {
        return {
          ...state,
          isLoading: true,
          isServerError: false,
          dbData: null,
          isSearch: !!searchTerm,
          badStatus: null,
        };
      }

      case "GLYPH_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          isServerError: false,
          dbData: action.payload,
          slug:
            action.payload?.glyph?.codePoint?.toString(16).toUpperCase() ||
            codePoint?.toUpperCase() ||
            searchTerm ||
            "",
          badStatus: null,
        };
      }

      case "SEQUENCE_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          isServerError: false,
          dbData: action.payload,
          slug: action.payload?.sequence
            ? makeSequenceSlug(action.payload.sequence?.cpList)
            : sequencePoints?.toUpperCase() || "",
          badStatus: null,
        };
      }

      case "FETCH_SUCCESS_BAD_STATUS": {
        let newTitle = "";
        if (action.payload.status === ErrorCodes.invalidCodePoint) {
          newTitle = "unicompat ~ Invalid code point";
        } else if (action.payload.status === ErrorCodes.noSearchResults) {
          newTitle = `unicompat ~ No search results for "${decodeURIComponent(
            searchTerm || ""
          )}"`;
        }
        return {
          ...state,
          isLoading: false,
          isServerError: false,
          dbData: null,
          slug: codePoint || searchTerm || sequencePoints || "",
          badStatus: action.payload.status,
          title: newTitle
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
          isServerError: false,
        };
      }

      case "FETCH_DATA_ERROR": {
        return {
          ...state,
          isServerError: true,
          errorMessage: action.payload,
          title: "unicompat ~ Server Error"
        };
      }

      case "HIGHLIGHT_EMOJI_NOTE": {
        return {
          ...state,
          emojiNoteHighlighted: true,
        };
      }

      case "UPDATE_TITLE": {
        return {
          ...state,
          title: action.payload
        }
      }

      case "REDIRECT": {
        return {
          ...state,
          redirect: action.payload
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
    const requestedSlug = codePoint || searchTerm || sequencePoints;

    const getObjects = async () => {
      dispatch({ type: "FETCH_DATA" });
      const apiURL =
        (
          `${apiHost}/api/` +
          (searchTerm
            ? `luckySearch/`
            : sequencePoints
            ? `sequence/`
            : `glyph/`) +
          requestedSlug
        ).split("#")[0] + // remove react-router hash
        "/"; // Django will return 301 redirect without final slash
      await axios
        .get(apiURL, {
          cancelToken: source.token,
        })
        .then((res) => {
          if (mounted) {
            if (res.data.error) {
              // Custom Django error, none currently programmed
              dispatch({ type: "FETCH_DATA_ERROR", payload: res.data.error });
              return;
            }

            if (res.data?.redirect) {
              dispatch({ type: "REDIRECT", payload: res.data.redirect })
            }

            if (res.data?.status) {
              dispatch({ type: "FETCH_SUCCESS_BAD_STATUS", payload: res.data });
            } else {
              dispatch({
                type: res.data?.sequence ? "SEQUENCE_SUCCESS" : "GLYPH_SUCCESS",
                payload: res.data,
              });
            }

            let newTitle = "";

            if (searchTerm) {
              // Can't use react-router history here because we want to change URL without causing reload
              if (res.data?.glyph?.codePoint) {
                newTitle = "unicompat ~ " + res.data.glyph.officialName;
                window.history.replaceState(
                  {},
                  newTitle,
                  "/" + res.data.glyph.codePoint.toString(16).toUpperCase()
                );
              } else if (res.data?.sequence?.officialName) {
                newTitle = "unicompat ~ " + res.data.sequence.officialName;
                window.history.replaceState(
                  {},
                  newTitle,
                  "/" + makeSequenceSlug(res.data.sequence?.cpList)
                );
              } 
            } else {
                if (res.data?.status === undefined) {
                  newTitle =
                    "unicompat ~ " +
                    (res.data?.glyph?.codePoint
                      ? `U+${res.data.glyph.codePoint
                          .toString(16)
                          .toUpperCase()}: ` + res.data.glyph?.officialName
                      : res.data?.sequence
                      ? res.data?.sequence?.officialName
                      : "");
                }
              }
              if (newTitle) {
                dispatch({ type: "UPDATE_TITLE", payload: newTitle })
              }
          }
        })
        .catch((error) => {
          // Unmanaged server error
          if (error?.message !== "FETCH_CANCELED")
            dispatch({ type: "FETCH_DATA_ERROR" });
        });
    };

    if (requestedSlug) {
      getObjects();
    }

    return () => {
      mounted = false;
      source.cancel("FETCH_CANCELED");
    };
  }, [
    dataState.newRequest,
    dataState.isSearch,
    codePoint,
    searchTerm,
    sequencePoints,
    props.history,
  ]);

  const [showCharDetails, setShowCharDetails] = useState(false);
  const hasVariants =
    ((dataState.dbData as SequenceData)?.sequence?.variants || []).length > 0 ||
    ((dataState.dbData as GlyphData)?.glyph?.variants || []).length > 0;

  const DashboardBody = () => {
    return <>{ dataState.redirect && <Redirect to={ dataState.redirect} />}
      {(isGlyphData(dataState.dbData) || codePoint) ? (
        <TopBlock
          dbData={dataState.dbData}
          slug={dataState.slug}
          dispatch={dispatch}
        />
      ) : (dataState.dbData?.sequence || sequencePoints) ? (
        <SequenceTopBlock
          dbData={dataState.dbData}
          slug={dataState.slug}
          dispatch={dispatch}
        />
      ) : <h3 className="title">Searching<Loading dotsOnly={true} /></h3>}
      <UserPercentBlock dbData={dataState.dbData} slug={dataState.slug.padStart(4, "0")} />
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <button
          className="btn showCharBtn"
          onClick={() => setShowCharDetails((scd) => !scd)}
        >
          {showCharDetails ? "Hide" : "Show"}{" "}
          {sequencePoints ? "sequence" : "character"} details
        </button>
      </div>
      <div
        className={
          "detailTableWrap" + (showCharDetails ? " active" : " hidden")
        }
      >
        {isGlyphData(dataState.dbData) || codePoint ? (
          <DetailTable dbData={dataState.dbData} />
        ) : (
          <SequenceDetailTable dbData={dataState.dbData} />
        )}
      </div>
      {hasVariants && (
        <div className="variantWrap">
          <h5>Variants</h5>
          {isGlyphData(dataState.dbData) ? (
            <Variants
              baseCharCp={dataState.dbData?.glyph?.codePoint}
              variantObjs={dataState.dbData?.glyph?.variants}
            />
          ) : (
            <Variants sequenceObjs={dataState.dbData?.sequence?.variants} />
          )}
        </div>
      )}
      <OSData dbData={dataState.dbData} />
    </>
  }

  let query = useQuery();

  return (
    <>
      <Helmet>
        <title>{ dataState.title }</title>
        { (dataState.isServerError || dataState.badStatus) && <meta name="robots" content="noindex" />}
      </Helmet>
      <Layout dispatch={dispatch} blockLink={true}>
      <FromSearchBanner query={query.get("search") || dataState?.dbData?.searchTerm} />
        {dataState.isServerError ? (
          <ServerErrorBlock errorMessage={dataState.errorMessage} />
        ) : dataState.badStatus ? (
          <BadStatusBlock slug={dataState.slug} status={dataState.badStatus} />
        ) : (
          <>
            <DashboardBody />
            <div className="bottomWrap">
              <FAQs />
              <SourceCitation />
              {isGlyphData(dataState.dbData) &&
                dataState.dbData?.glyph?.isEmoji &&
                dataState.dbData?.glyph?.hasBwEmoji && (
                  <EmojiNote highlighted={dataState.emojiNoteHighlighted} />
                )}
            </div>
          </>
        )}
        <div className="blockLinkFooter">
          Want to see more than one glyph at a time? Try the <Link to="/block">Unicode block browser</Link>
        </div>
      </Layout>
    </>
  );
};

export const GlyphDashboard = withRouter(GlyphDashboardNoRouter);
