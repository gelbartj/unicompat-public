import React from "react";
import { SearchBox } from "./SearchBox";
import { RandomButton } from "./RandomButton";

interface MastheadProps {
  searchVal?: string;
  dispatch?: React.Dispatch<any>;
}

export const Masthead: React.FC<MastheadProps> = ({ searchVal, dispatch }) => {
  return (
    <div className="masthead">
      <a href="/" style={{ color: "white" }}>
        <h2 className="logo">
          <strong>uni</strong>compat <span className="beta">beta</span>
        </h2>
      </a>
      <div className="searchBlockWrap">
        <div className="random">
          <RandomButton text="Random" dispatch={dispatch} />
        </div>
        <div className="searchBlock">
          <SearchBox
            initialVal={searchVal}
            dispatch={dispatch}
            labelStyle={{
              fontSize: "0.9rem",
              marginLeft: "10px",
              color: "#fff",
            }}
          />
        </div>
      </div>
    </div>
  );
};
