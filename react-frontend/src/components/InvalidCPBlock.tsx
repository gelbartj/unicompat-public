import React from "react";

import { leftPad } from "./utilities";
import { RandomButton } from "./RandomButton";

interface InvalidCPBlockProps {
    slug: string,
    gotSearchResults: boolean,
    isSearch: boolean,
    dispatch?: React.Dispatch<any>
}

export const InvalidCPBlock: React.FC<InvalidCPBlockProps> = ({ slug, gotSearchResults, isSearch, dispatch }) => {
    return <>
            <h3 className="title">
              { (!gotSearchResults && isSearch) ? `No results found for “${decodeURIComponent(slug)}.”` :
              `U+${leftPad(slug).toUpperCase()} : Invalid Unicode ${slug.includes("-") ? "sequence" : "codepoint"}` }
            </h3>
            <h4 style={{ textAlign: "center" }}>
              Please try again with a new query, or take a leap into the wild side:
            </h4>
              <div style={{textAlign:"center", margin:"20px"}}>
              <RandomButton text="Randomize me!" customClass="btn btn-warning" color="" />
              </div>
            </>
}