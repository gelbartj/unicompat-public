import React, { useState } from "react";
import { validBlocks } from "./validBlocks";
import { Redirect } from "react-router-dom";

interface RandomButtonProps {
    text?: string,
    customClass?: string,
    color?: string,
    dispatch?: React.Dispatch<any>
}

export const RandomButton: React.FC<RandomButtonProps> = ({ text, customClass, color, dispatch }) => {

    const randomCP = () => {
    const pickBlock = Math.floor(Math.random() * validBlocks.length);
    const withinBlock = Math.floor(
      Math.random() * (validBlocks[pickBlock][1] - validBlocks[pickBlock][0])
    );
    return (withinBlock + validBlocks[pickBlock][0]).toString(16);
  };

  const [redirect, setRedirect] = useState(false);
  const [randomVal, setRandomVal] = useState(randomCP());
  
  return <><button
            className={ customClass || "btn"}
            style={{ color: color ?? "#ccc" }}
            onClick={() => {
              setRedirect(true);
              setRandomVal(randomCP());
              /*
              if (dispatch) {
                dispatch({type: "NEW_REQUEST", payload: randomCP()});
              }
              else {
                setRedirect(true);
              } */
            }}
          >
            { text || "Random glyph" }
          </button>
          { redirect && <Redirect push to={"/" + randomVal} />}
          </>

}