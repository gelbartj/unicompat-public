import React from "react";
import { leftPad } from "./utilities";
import Loading from "./Loading";
import { useParams, Link } from "react-router-dom";
import { Params } from "./globalSettings";

interface TopBlockProps {
  slug: string;
  dbData?: any;
  dispatch: React.Dispatch<any>;
}

export const TopBlock: React.FC<TopBlockProps> = ({
  dbData,
  slug,
  dispatch,
}) => {
  // const imageHostName = "localhost:8000";

  let { codePoint } = useParams<Params>();

  const displayChar = dbData?.glyph?.codePoint
    ? String.fromCodePoint(dbData?.glyph?.codePoint)
    : "...";
  return (
    <div className="content">
      <h3 className="title">
        {!codePoint && !dbData?.glyph?.codePoint
          ? ""
          : `U+${leftPad(
              dbData?.glyph?.codePoint?.toString(16) || codePoint
            ).toUpperCase()}: `}
        {dbData?.glyph?.officialName || <Loading />}
      </h3>

      {dbData?.glyph?.codePoint && (
        <>
          <div style={{ float: "right" }}>
            <Link
              to={"/" + (dbData.glyph.codePoint + 1).toString(16).toUpperCase()}
              className="btn btn-light"
            >
              &gt;
            </Link>
          </div>

          <div style={{ float: "left" }}>
            <Link
              to={"/" + (dbData.glyph.codePoint - 1).toString(16).toUpperCase()}
              className="btn btn-light"
            >
              &lt;
            </Link>
          </div>
        </>
      )}
      <div>
        {(["Control character"].includes( // Formerly included "Format character" here
          dbData?.glyph?.categoryT
        ) || dbData?.glyph?.isNonCharacter) ? (
          <div className="controlChar">
            This is an invisible control character
          </div>
        ) : (
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
                  dbData.glyph?.isEmoji && dbData.glyph?.hasBwEmoji ? (
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
                            B&amp;W
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
                  dbData.glyph?.isEmoji && dbData.glyph?.hasBwEmoji ? (
                    <>
                      Your browser
                      <a
                        id="emojinotelink"
                        href="#emojinote"
                        onClick={() =>
                          dispatch({ type: "HIGHLIGHT_EMOJI_NOTE" })
                        }
                      >
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
