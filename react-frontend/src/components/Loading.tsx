import React, { FunctionComponent, useRef, useEffect, useState } from "react";

interface LoadingProps {
  dotsOnly?: boolean;
  style?: Object;
}

const Loading: FunctionComponent<LoadingProps> = (props) => {
  const [loadText, setLoadText] = useState(".");
  const textRef = useRef(loadText);
  const [forward, setForward] = useState(true);
  const forwardRef = useRef(forward);
  forwardRef.current = forward;
  textRef.current = loadText;
  useEffect(() => {
    const timer = setInterval(() => {
      if (textRef.current.length > 2 || textRef.current.length === 0)
        setForward(!forwardRef.current);
      setLoadText(
        forwardRef.current
          ? textRef.current + "."
          : textRef.current.substring(0, textRef.current.length - 1)
      );
    }, 300);
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      style={
        props.style
          ? props.style
          : {
              color: "grey",
              fontWeight: "normal",
              minWidth: props.dotsOnly ? "1em" : "5em",
              textAlign: "left",
              display: "inline-block",
            }
      }
    >
      {!props.dotsOnly ? "Loading" : ""}
      {loadText}
    </div>
  );
};

export default Loading;
