import React, { useState } from "react";
import { leftPad } from "./utilities";
import Loading from "./Loading";
import { useParams, Redirect } from "react-router-dom";

interface TopBlockProps {
  slug: string,
  dbData?: any,
  dispatch: React.Dispatch<any>
}

export const TopBlock: React.FC<TopBlockProps> = ({ dbData, slug, dispatch }) => {
  // const imageHostName = "localhost:8000";

  let { codePoint, searchTerm } = useParams();

  const [backwardLink, setBackwardLink] = useState("");
  const [forwardLink, setForwardLink] = useState("");

  const displayChar = dbData
    ? String.fromCodePoint(dbData?.glyph?.codePoint)
    : "...";
  return (
    <div className="content">
      <h3 className="title">
        { (!codePoint && !dbData?.glyph?.codePoint)
          ? "" : `U+${leftPad(dbData?.glyph?.codePoint.toString(16) || codePoint).toUpperCase()}: `}
        {dbData?.glyph?.officialName || <Loading />}
      </h3>

      <div style={{ float: "right" }}>
        <button
          className="btn btn-light"
          onClick={() => {
            /*
            if (dbData.glyph)
              dispatch({ type: "NEW_REQUEST", payload:(dbData.glyph.codePoint + 1).toString(16)});
          } */
          setForwardLink("/" + (dbData.glyph.codePoint + 1).toString(16).toUpperCase());
        }}
        >
          &gt;
        </button>
        { forwardLink && <Redirect push to={forwardLink} />}
      </div>

      <div style={{ float: "left" }}>
        <button
          className="btn btn-light"
          onClick={() => {
            /*
            if (dbData.glyph)
              dispatch({ type: "NEW_REQUEST", payload:(dbData.glyph.codePoint - 1).toString(16)});
              */
             setBackwardLink("/" + (dbData.glyph.codePoint - 1).toString(16).toUpperCase());
          }}
        >
          &lt;
        </button>
        { backwardLink && <Redirect push to={ backwardLink } /> }
      </div>
      <div>
        {["Control character", "Format character"].includes(dbData?.glyph?.categoryT) ? <div style={{backgroundColor:"#eee", fontStyle:"italic",padding:"10px", display:"inline-block", margin:"auto"}}>This is an invisible control or format character</div> : (
          <div
            style={{
              textAlign: "center",
              margin: "0 20px",
              verticalAlign: "top",
            }}
          >
            {dbData?.glyph?.bitmap && (
              <>
                <div className="renderedImg">
                  <img
                    src={dbData.glyph.bitmap}
                    alt="Server rendered character"
                  />
                  <div className="charSource">Server rendered</div>
                </div>
                <div className="questionEquals">≟</div>
              </>
            )}
            <div className={"highlightBox" + (dbData ? " loaded" : "")}>
              <div style={{ lineHeight: "1em" }}>
                {dbData ? (
                  dbData.glyph?.isEmoji && dbData.glyph?.hasColorEmoji ? (
                    <table className="twoEmojiTable">
                      <tbody>
                        <tr>
                          <td
                            className="bwEmoji"
                            style={{ borderRight: "1px solid lightgrey" }}
                          >
                            {displayChar + "\ufe0e"}
                          </td>
                          <td className="colorEmoji">
                            {displayChar + "\ufe0f"}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="charSource color"
                            style={{ borderRight: "1px solid lightgrey" }}
                          >
                            B&W
                          </td>
                          <td className="charSource color">Color</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <span>{displayChar}</span>
                  )
                ) : (
                  <Loading dotsOnly={true} />
                )}
              </div>
              <div className="charSource">
                {dbData ? (
                  dbData.glyph?.isEmoji && dbData.glyph?.hasColorEmoji ? (
                    <>
                      Your browser
                      <a id="emojinotelink" href="#emojinote" onClick={() => dispatch({type: "HIGHLIGHT_EMOJI_NOTE"})}>
                        **
                      </a>
                    </>
                  ) : (
                    "Your browser"
                  )
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
