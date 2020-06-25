import React, { useEffect, useReducer } from "react";
import { apiHost } from "./globalSettings";
import axios from "axios";
import { Layout } from "./Layout";
import { useParams, Link } from "react-router-dom";
import { getUserPercentClass } from "./utilities";
import Loading from "./Loading";
import { BlockSelector } from "./BlockSelector";

interface UniBlock {
  start: number;
  end: number;
  name: string;
  [a: string]: any;
}

interface UniBrowserProps {
  uniBlock?: UniBlock;
}

const initialState = {
  isLoading: false,
  blockData: null,
  isError: false,
};

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const UniBrowser: React.FC<UniBrowserProps> = () => {
  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  let { blockSlug } = useParams();
  if (!blockSlug) blockSlug = "miscellaneous-symbols"; // default

  function dbReducer(state: typeof initialState, action: any) {
    switch (action.type) {
      case "FETCH_BLOCK": {
        return {
          ...state,
          isLoading: true,
          blockData: null,
        };
      }

      case "FETCH_BLOCK_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          blockData: action.payload,
          isError: false,
        };
      }

      case "FETCH_BLOCK_ERROR": {
        return {
          ...state,
          isLoading: false,
          blockData: null,
          isError: true,
        };
      }

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  const getBlock = async (blockSlug: string) => {
    dispatch({ type: "FETCH_BLOCK", payload: blockSlug });

    await axios
      .get(
        `${apiHost}/api/block/${blockSlug}/`
      )
      .then((res) => {
        dispatch({ type: "FETCH_BLOCK_SUCCESS", payload: res.data });
        window.document.title = "unicompat ~ " + (res.data?.block?.name || "");
      })
      .catch((e) => {
        dispatch({ type: "FETCH_BLOCK_ERROR", payload: e });
        console.error(e);
      });
  };

  useEffect(() => {
    let mounted = true;
    if (mounted && blockSlug) {
      getBlock(blockSlug);
    }

    return () => {
      mounted = false;
    };
  }, [blockSlug]);

  return (
    <Layout>
      <h3
        style={{
          textAlign: "center",
          fontWeight: "normal",
          color: "#333",
          margin: 0,
        }}
      >
        Unicode Block Browser
      </h3>
      <h2 style={{ textAlign: "center", margin: "5px auto 10px" }}>
        {dataState.blockData?.block?.name ||
          (dataState.isLoading ? (
            <span style={{ fontSize: "1.2rem" }}>
              <Loading />
            </span>
          ) : dataState.isError ? (
            "Server Error"
          ) : (
            "Invalid Block"
          ))}
      </h2>
      {!dataState.blockData && !dataState.isLoading && (
        <p style={{ margin: "auto", textAlign: "center" }}>
          {dataState.isError
            ? "Sorry, we seem to be having some trouble with our server. Please try again in a moment."
            : "Sorry, you have requested an invalid Unicode block. Please try again with a different request."}
        </p>
      )}
      <div style={{ margin: "10px auto", textAlign: "center", opacity: 0.7 }}>
        <BlockSelector />
      </div>
      {dataState.blockData?.block?.numChars &&
        dataState.blockData?.block?.numChars > 500 && (
          <div
            style={{
              textAlign: "center",
              margin: "15px",
              backgroundColor: "#eee",
              padding: "5px",
            }}
          >
            Notice: This Unicode Block contains{" "}
            {numberWithCommas(dataState.blockData?.block?.numChars)} characters.
            Only the first 500 are shown here.
          </div>
        )}
      <div className="browserLegendBlock">
        <div className="browserLegendItem">
          <div className="browserLegend great">&nbsp;</div>&nbsp;Best&nbsp;support
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
      </div>
      <div style={{ textAlign: "center" }}>
        {dataState.blockData ? (
          dataState.blockData.glyphs.map((glyphObj: any) => (
            <Link key={glyphObj.codePoint}
                to={`/${glyphObj.slug}`}
                title={"U+" + glyphObj.slug + ": " + glyphObj.officialName}
              >
            <div
              
              className={`browserCell ${getUserPercentClass(
                parseFloat(glyphObj.supportPercent)
              )}`}
            >
              
                {String.fromCodePoint(glyphObj.codePoint)}
              
            </div>
            </Link>
          ))
        ) : (
          <Loading dotsOnly={true} />
        )}
      </div>
    </Layout>
  );
};
