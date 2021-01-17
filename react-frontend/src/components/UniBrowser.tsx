import React, { useEffect, useReducer } from "react";
import { apiHost, mediaHost, Params } from "./globalSettings";
import axios from "axios";
import { FromSearchBanner, Layout, useQuery } from "./Layout";
import { useParams, Link } from "react-router-dom";
import { getUserPercentClass } from "./utilities";
import Loading from "./Loading";
import { BlockSelector } from "./BlockSelector";
import { Helmet } from "react-helmet-async";

interface UniBlock {
  start: number;
  end: number;
  name: string;
  [a: string]: any;
}

interface UniBrowserProps {
  uniBlock?: UniBlock;
}

interface InitialState {
  isLoading: boolean;
  blockData: any;
  isError: boolean;
  count: number;
  errorCode?: number;
  title: string;
}

const initialState: InitialState = {
  isLoading: false,
  blockData: null,
  isError: false,
  count: 0,
  title: "unicompat ~ Unicode Block Browser"
};

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const UniBrowser: React.FC<UniBrowserProps> = () => {
  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  let { blockSlug, page } = useParams<Params>();
  blockSlug = blockSlug || "miscellaneous-symbols"; // default

  const parsedPage = parseInt(page || "1", 10);
  const pageNum = isNaN(parsedPage) ? 1 : parsedPage;

  const BLOCK_PAGE_SIZE = 150; // This limit is actually defined at the Django query level

  let forwardLink =
    dataState?.count && pageNum * BLOCK_PAGE_SIZE < dataState?.count
      ? `/block/${blockSlug}/${pageNum + 1}`
      : undefined;

  let backwardLink =
    dataState?.count && dataState?.count > BLOCK_PAGE_SIZE && pageNum > 1
      ? `/block/${blockSlug}/${pageNum - 1}`
      : undefined;

  function dbReducer(state: typeof initialState, action: any) {
    switch (action.type) {
      case "FETCH_BLOCK": {
        return {
          ...state,
          isLoading: true,
        };
      }

      case "FETCH_BLOCK_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          blockData: action.payload?.results,
          isError: false,
          count: action.payload?.count,
          errorCode: undefined,
          title: "unicompat ~ Unicode Block Browser: " + (action.payload?.results?.block?.name || "Invalid block")
        };
      }

      case "FETCH_BLOCK_ERROR": {
        return {
          ...state,
          isLoading: false,
          blockData: null,
          isError: true,
          errorCode: action.payload?.response?.status,
          title: "Error retrieving Unicode block"
        };
      }

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  useEffect(() => {
    let mounted = true;

    const getBlock = async (blockSlug: string) => {
      dispatch({ type: "FETCH_BLOCK", payload: blockSlug });

      await axios
        .get(`${apiHost}/api/block/${blockSlug}/?page=${pageNum}`)
        .then((res) => {
          dispatch({ type: "FETCH_BLOCK_SUCCESS", payload: res.data });
        })
        .catch((e) => {
          dispatch({ type: "FETCH_BLOCK_ERROR", payload: e });
          console.error(e);
        });
    };

    if (mounted && blockSlug) {
      getBlock(blockSlug);
    }

    return () => {
      mounted = false;
    };
  }, [blockSlug, pageNum]);

  const message500 =
    "Sorry, we seem to be having some trouble with our server. Please try again in a moment or select a new Unicode block below.";
  const message404 =
    "Sorry, that page could not be found. Feel free to select a new Unicode block below to try something different.";
  const messageInvalidBlock =
    "Sorry, you have requested an invalid Unicode block. Please select a Unicode block below to continue.";

  const PageNav = () =>
    dataState?.blockData && dataState?.count > BLOCK_PAGE_SIZE ? (
      <div style={{ clear: "both" }}>
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
    let query = useQuery();
  return (
    <>
    <Helmet>
      <title>{dataState.title}</title>
      { (dataState.isError || (!dataState.blockData?.block?.name &&
          !dataState.isLoading)) ? <meta name="robots" content="noindex" />
      : <link rel="canonical" href={`https://www.unicompat.com/block/${blockSlug}`} />
      }
      { dataState.blockData?.block?.name && <meta name="description" content={`View the compatibility of all characters in the ${
        dataState.blockData.block.name} Unicode block`} />}
    </Helmet>

    <Layout>
      <FromSearchBanner query={query.get("search")} />
      {!dataState.isError && (
        <h3
          className={`blockBrowser ${
            dataState.blockData?.block?.name ? "dimmed" : ""
          }`}
        >
          Unicode Block Browser
        </h3>
      )}
      <h2 style={{ textAlign: "center", margin: "5px auto 10px" }}>
        {dataState.blockData?.block?.name ||
          (dataState.isLoading ? (
            <span style={{ fontSize: "1.2rem" }}>
              <Loading />
            </span>
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
            "Invalid Block"
          ))}
      </h2>
      {!dataState.blockData && !dataState.isLoading && (
        <h5 style={{ margin: "20px auto", textAlign: "center" }}>
          {dataState.isError
            ? dataState?.errorCode === 404
              ? message404
              : message500
            : messageInvalidBlock}
        </h5>
      )}

      {dataState.blockData?.block?.numChars &&
        dataState.blockData?.block?.numChars > BLOCK_PAGE_SIZE && (
          <div className="largeBlockNotice">
            Notice: This Unicode Block contains{" "}
            {numberWithCommas(dataState.blockData?.block?.numChars)} characters.
            {` Only ${BLOCK_PAGE_SIZE} per page are shown here.`}
          </div>
        )}
      <div
        style={{
          margin: "15px auto 5px auto",
          textAlign: "center",
          opacity: 0.7,
        }}
      >
        <BlockSelector />
      </div>
      <div className="browserLegendBlock">
        <div className="browserLegendItem">
          <div className="browserLegend great">&nbsp;</div>
          &nbsp;Best&nbsp;support
        </div>
        <div className="browserLegendItem">
          <div className="browserLegend good">&nbsp;</div>&nbsp;Good
        </div>
        <div className="browserLegendItem">
          <div className="browserLegend fair">&nbsp;</div>&nbsp;Fair
        </div>
        <div className="browserLegendItem">
          <div className="browserLegend poor">&nbsp;</div>&nbsp;Poor
        </div>
        <div className="browserLegendItem">
          <div className="browserLegend vpoor">&nbsp;</div>&nbsp;Very&nbsp;poor
        </div>
        <div className="browserLegendItem">
          <div className="browserLegend none">&nbsp;</div>&nbsp;None (server rendered image)
        </div> 
        {/*
        <div className="browserLegendItem">
          <div className="browserLegend unk">&nbsp;</div>&nbsp;Click&nbsp;for&nbsp;detail
        </div> 
        */}
      </div>
      <div style={{ textAlign: "center" }}>
        <PageNav />
        {dataState.blockData ? (
          dataState.blockData.glyphs.map((glyphObj: any) => (
            <Link
              key={glyphObj.codePoint}
              to={`/${glyphObj.slug}`}
              title={"U+" + glyphObj.slug + ": " + glyphObj.officialName}
            >
              <div
                className={`browserCell ${getUserPercentClass(
                  parseFloat(glyphObj.cachedSupportPercent),
                  true, glyphObj.bitmap
                )}`}
              >
                {(glyphObj.cachedSupportPercent > 0 || !glyphObj.bitmap) ? String.fromCodePoint(glyphObj.codePoint)
                : <img src={mediaHost + "/media/" + glyphObj.bitmap} style={{maxHeight:"50px", width:"auto"}} />}
              </div>
            </Link>
          ))
        ) : (
          <Loading dotsOnly={true} />
        )}
        <PageNav />
      </div>
    </Layout>
    </>
  );
};
