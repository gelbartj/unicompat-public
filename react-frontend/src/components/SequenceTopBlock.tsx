import React, { useState } from "react";
import { leftPad } from "./utilities";
import Loading from "./Loading";
import { useParams, Redirect } from "react-router-dom";

interface SequenceTopBlockProps {
  slug: string,
  dbData?: any,
  dispatch: React.Dispatch<any>
}

export const SequenceTopBlock: React.FC<SequenceTopBlockProps> = ({ dbData, slug, dispatch }) => {
  // const imageHostName = "localhost:8000";

  let { sequencePoints } = useParams();

  const displayChar = dbData
    ? (dbData?.sequence?.sequenceString)
    : "...";
  return (
    <div className="content">
      <h4 className="title">Unicode sequence</h4>
      <h3 className="title">
        { dbData?.sequence?.officialName.toUpperCase() || <Loading />}
      </h3>

      <div>
          <div
            style={{
              textAlign: "center",
              margin: "0 20px",
              verticalAlign: "top",
            }}
          >
            <div className={"highlightBox" + (dbData ? " loaded" : "")}>
              <div style={{ lineHeight: "1em" }}>
                {dbData ? (
                  (
                    <span>{displayChar}</span>
                  )
                ) : (
                  <Loading dotsOnly={true} />
                )}
              </div>
              <div className="charSource">
                {dbData ? "Your browser"
                  : (
                  ""
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
