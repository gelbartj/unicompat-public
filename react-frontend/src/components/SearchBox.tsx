import React, { useState, CSSProperties } from "react";
import { Redirect } from "react-router-dom";

interface SearchBoxProps {
  initialVal?: string;
  dispatch?: React.Dispatch<any>;
  labelStyle?: CSSProperties;
  small?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  initialVal,
  dispatch,
  labelStyle,
  small,
}) => {
  const [newLocation, setNewLocation] = useState("");

  function getNewLocation(searchStringA: string | undefined) {
    let isSearch = false;
    searchStringA = searchStringA?.trim();

    if (!searchStringA) {
      return ["", isSearch];
    }
    if ([...searchStringA].length === 1) {
      return [
        searchStringA.codePointAt(0)!.toString(16).toUpperCase(),
        isSearch,
      ];
    }
    if (["u+", "U+"].includes(searchStringA.substring(0, 2))) {
      return [searchStringA.substring(2).toUpperCase(), isSearch];
    }
    // Multi-byte emojis and other sequences
    if (
      [...searchStringA].length < 10 &&
      !searchStringA.match(/^[\w\såÅøØæÆ:-]+$/) // \w includes A-z0-9_
    ) {
      return [
        [...searchStringA]
          .map((c) => c.codePointAt(0)!.toString(16).toUpperCase())
          .join("-"),
        isSearch,
      ];
    }
   
    // Single hex codepoint
    if (searchStringA.match(/^[a-fA-F0-9]+$/) && searchStringA.length < 7 && 
      parseInt(searchStringA, 16) <= 0x10ffff) {
      // \d could match Eastern Arabic numerals
      return [searchStringA.toUpperCase(), isSearch];
    }

    isSearch = true;
    return [encodeURIComponent(searchStringA), isSearch];
  }
  function processSearch(searchStringA: string | undefined) {
    const newL = getNewLocation(searchStringA);
    const isSearch = newL[1];

    if (!isSearch) {
      setNewLocation("/" + newL[0] + `?search=${searchStringA}`);
    } else {
      setNewLocation("/search/l/" + newL[0]);
    }
    setRedirect(true);
    // }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      processSearch(searchString);
    }
  }

  const [searchString, setSearchString] = useState(initialVal);

  const [redirect, setRedirect] = useState(false);

  return (
    <>
      <label style={labelStyle || {}}>
        Search:&nbsp;
        <input
          type="text"
          name="search"
          className={"searchBox" + (small ? " small" : "")}
          placeholder="U+ hex code or character"
          onInput={(e) => setSearchString(e.currentTarget.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          defaultValue={searchString}
        />
      </label>
      <button
        className="btn btn-primary"
        style={{ verticalAlign: "top" }}
        onClick={(e) => processSearch(searchString)}
      >
        Go
      </button>
      {redirect && <Redirect push to={newLocation} />}
    </>
  );
};
