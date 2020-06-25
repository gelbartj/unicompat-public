import React, { useEffect, useState, useReducer } from "react";
import { apiHost } from "./globalSettings";
import axios from "axios";
import { OSData } from "./OSData";
import { FAQs } from "./FAQs";
import { InvalidCPBlock } from "./InvalidCPBlock";
import {
  UserPercentBlock,
  SourceCitation
} from "./UserPercentBlock";
import { Layout } from "./Layout";
import { useParams, withRouter } from "react-router-dom";
import { ServerErrorBlock } from "./ServerErrorBlock";
import { SequenceDetailTable } from "./SequenceDetailTable";
import { SequenceTopBlock } from "./SequenceTopBlock";
import { DBData } from "./GlyphDashboard";

interface Sequence {
    id: number,
    officialName: string,
    sequenceString: string,
    cpList: number[],
    glyphObjs: any[],
    isEmoji?: boolean,
    isProvisional?: boolean,
    supportPercent: number
}

export interface SeqDBData {
  sequence: Sequence | null;
  oses: any[] | null;
  noto: any | null;
}

export function getIsSequence(dbData: DBData | SeqDBData | null): dbData is SeqDBData {
    if (dbData === null) return false;
    if ((dbData as SeqDBData).sequence) {
      return true;
    }
    return false;
  }

interface InitialState {
  isLoading: boolean;
  dbData: SeqDBData | null;
  slug: string;
  gotSearchResults: boolean;
  isSearch: boolean;
  fontData?: any;
  osFontData?: any;
  featuredOS?: any;
  newRequest: string | null;
  redirect: string;
  isError: boolean;
}

const SequenceDashboardNoRouter: React.FC<any> = (props) => {
  let { sequencePoints } = useParams();

  const initialState: InitialState = {
    isLoading: false,
    dbData: null,
    slug: sequencePoints,
    gotSearchResults: false,
    isSearch: false,
    newRequest: null,
    redirect: "",
    isError: false
  };

  function dbReducer(state: InitialState, action: any): InitialState {
    // const searchSplit = requestedValue.split("search=");
    switch (action.type) {
      case "FETCH_DATA": {
        return {
          ...state,
          isLoading: true,
          dbData: null,

        };
      }

      case "FETCH_DATA_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          dbData: action.payload,
          slug:
            action.payload.sequence ? (action.payload.sequence.cpList?.map((cp: number) => cp.toString(16)).join("-") ||
            sequencePoints) : sequencePoints,
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

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  useEffect(() => {
    let mounted = true;

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const requestedSlug = sequencePoints;

    const getObjects = async () => {
      dispatch({ type: "FETCH_DATA" });

      const apiURL =
        `${apiHost}/api/sequence/${requestedSlug}`
        .split("#")[0]; // remove react-router hash

      await axios
        .get(apiURL, {
          cancelToken: source.token,
        })
        .then((res) => {
          if (mounted) {
            console.log("DATA: ", res.data);
            dispatch({ type: "FETCH_DATA_SUCCESS", payload: res.data });
            const newTitle =
              "unicompat" +
              (res.data.sequence ?
               ` ~ ${res.data.sequence.officialName}` : "~ Loading...")
            window.document.title = newTitle;
            /* if (res.data.glyph?.codePoint && searchTerm) {
              // Can't use react-router history here because we want to change URL without causing reload
              window.history.pushState({}, "unicompat ~ " + res.data.glyph.officialName, "/" + res.data.glyph.codePoint.toString(16));
            } */
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
    sequencePoints,
    props.history,
  ]);

  const [showSeqDetails, setShowSeqDetails] = useState(false);

  return (
    <>
      <Layout>
        { dataState.isError ? <ServerErrorBlock /> :
        dataState.dbData?.sequence === null ? (
          <InvalidCPBlock
            slug={dataState.slug}
            gotSearchResults={false}
            isSearch={false}
          />
        ) : (
          <>
            <SequenceTopBlock
              dbData={dataState.dbData}
              slug={dataState.slug}
              dispatch={dispatch}
            />
            <UserPercentBlock dbData={dataState.dbData} />
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
              <button
                className="btn showCharBtn"
                onClick={() => setShowSeqDetails(!showSeqDetails)}
              >
                {showSeqDetails ? "Hide" : "Show"} sequence details
              </button>
            </div>
            <div
              className={
                "detailTableWrap" + (showSeqDetails ? " active" : " hidden")
              }
            >
              <SequenceDetailTable dbData={dataState.dbData} />
            </div>

            <OSData dbData={dataState.dbData} />

            <div className="bottomWrap">
              <FAQs />
              <SourceCitation />
            </div>
          </>
        )}
      </Layout>
    </>
  );
};

export const SequenceDashboard = withRouter(SequenceDashboardNoRouter);
