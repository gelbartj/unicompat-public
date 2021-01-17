import React from "react";

import { RandomButton } from "./RandomButton";

interface ServerErrorBlockProps {
  errorMessage?: string;
}

export const ServerErrorBlock: React.FC<ServerErrorBlockProps> = (props) => {
  return (
    <>
      <h2 className="title"><span
                className="colorEmoji"
                style={{ padding: 0, fontSize: "2em" }}
                role="img"
                aria-label="warning"
              >
                &#x26A0;&#xFE0F;
              </span>
              <br />
              Server Error
      </h2>
      <h4 style={{ textAlign: "center", lineHeight: "180%" }}>
        Sorry, we seem to have run into a server error
        {props.errorMessage ? (
          <>
            :<div className="errorMessage">{props.errorMessage}</div>
          </>
        ) : (
          <>
            .<br />
          </>
        )}
        Please try again in a moment, or go to a different page:
      </h4>
      <div style={{ textAlign: "center", margin: "20px" }}>
        <RandomButton
          text="Randomize me!"
          customClass="btn btn-warning"
          color=""
        />
      </div>
    </>
  );
};
