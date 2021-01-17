import React from "react";

import { leftPad } from "./utilities";
import { RandomButton } from "./RandomButton";
import { ErrorCodes } from "./globalSettings";

interface BadStatusBlockProps {
  slug: string;
  status: typeof ErrorCodes[keyof typeof ErrorCodes];
  dispatch?: React.Dispatch<any>;
}

export const BadStatusBlock: React.FC<BadStatusBlockProps> = ({
  slug,
  status,
}) => {
  return (
    <>
      <h3 className="title">
        {status === ErrorCodes.noSearchResults ? (
          `No results found for “${decodeURIComponent(slug)}.”`
        ) : status === ErrorCodes.invalidCodePoint ? (
          <>
            <div style={{ fontSize: "2em" }}>
              <span role="img" aria-label="Error">
                ❌
              </span>
            </div>{" "}
            Sorry, <code>{`U+${leftPad(slug).toUpperCase()}`}</code> is not a
            valid Unicode {slug.includes("-") ? "sequence" : "codepoint"}
          </>
        ) : (
          <h4 style={{ textAlign: "center" }}>
            Sorry, an unknown error occurred
          </h4>
        )}
      </h3>
      <h5 style={{ textAlign: "center" }}>
        Please try again with a new query, or take a leap into the wild side:
      </h5>
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
