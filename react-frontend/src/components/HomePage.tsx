import React from "react";

import { SearchBox } from "./SearchBox";
import { Link } from "react-router-dom";
import { Layout } from "./Layout";
import { Helmet } from "react-helmet-async";
// import { UniBrowser } from "./UniBrowser";

interface HomePageProps {
  dispatch?: React.Dispatch<any>;
}

export const HomePage: React.FC<HomePageProps> = ({ dispatch }) => {
  const urlSep = "/";

  const emojiHeaderGroup = {
    icons: ["🍀", "✪", "⛄", "⟲", "☂", "❀", "⛺", "♬", "♻"],
    labels: [
      "clover",
      "star in circle",
      "snowman",
      "repeat loop",
      "umbrella",
      "flower",
      "tent",
      "music note",
      "recycle symbol",
    ],
  };

  return (
    <>
    <Helmet>
      <title>unicompat ~ Check OS compatibility of every Unicode character</title>
      <meta name="description" content="Use unicompat to find out quickly and reliably if it's safe to use a simple and clean Unicode character in your app
          or website." />
    </Helmet>
    <Layout>
      <h2 style={{ textAlign: "center" }}>
        Welcome to <strong className="logo">unicompat</strong>!
      </h2>
      <div className="emojiHeader">
        {emojiHeaderGroup.icons.map((emoji, idx) => (
          <Link
            key={idx}
            to={urlSep + emoji.codePointAt(0)?.toString(16).toUpperCase()}
          >
            <span role="img" aria-label={emojiHeaderGroup.labels[idx]}>
              {emoji}
            </span>
          </Link>
        ))}
      </div>
      <div
        style={{
          fontSize: "1.2em",
          lineHeight: "170%",
          textAlign: "center",
          margin: "15px",
          borderTop: "2px solid lightgrey",
          borderBottom: "2px solid lightgrey",
          padding: "10px",
        }}
      >
        <span>
          Find out <em>quickly and reliably</em>
        </span>
        <br />
        <strong>
          if it's safe to use a simple and clean Unicode character in your app
          or website.
        </strong>
      </div>
      <div style={{ maxWidth: "950px", margin: "auto" }}>
        <div
          style={{ textAlign: "justify", fontSize: "1.1em", margin: "15px 0" }}
        >
          Why bother with FontAwesome or SVG embeds if you don't have to? We can
          tell you if <strong>95%</strong> of all device users will be able to
          view the Unicode character you want to use.*
        </div>
        <div style={{ textAlign: "justify", margin: "15px 0", color: "#555" }}>
          If support is less than universal, we'll show you which free font you
          can embed (whenever one exists) to guarantee that everything shows up
          just the way you've intended.
        </div>
        <div style={{ textAlign: "center", margin: "15px 0 10px 0" }}>
          Search for something to get started, like{" "}
          <Link to="/search/l/Black%20star" className="example">Black star</Link>,{" "}
          <Link to="/5686" className="example">U+5686</Link> (with or without "U+"),{" "}
          <Link to="/01FB" className="example">ǻ</Link>,{" "}
          <Link to="/00A9" className="example">©</Link>, or even{" "}
          <Link to="/1F4A9"><span role="img" aria-label="poop emoji" className="example">
            💩
          </span></Link>
          . <br /> You can also click on any of the icons at the top of this
          page.
        </div>
        <div
          style={{
            textAlign: "center",
            borderTop: "1px solid lightgrey",
            borderBottom: "1px solid lightgrey",
            padding: "12px",
          }}
        >
          <SearchBox initialVal="Black star" dispatch={dispatch} />
        </div>
        <div style={{ textAlign: "justify", marginTop: "20px" }}>
          <div>
            <strong>OR</strong>, maybe viewing one character at a time isn't
            enough for you! Let's say there's a Unicode symbol you want to use,
            but it's not widely supported.
          </div>
          <div style={{ marginTop: "15px" }}>
            On Unicompat, you can{" "}
            <Link to="/block">
              <strong>browse entire Unicode Blocks all at once</strong>
            </Link>
            , color-coded to find out immediately if there's a similar symbol
            you can use that more users will be able to see properly.
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          We hope you find this tool valuable. Enjoy!
        </div>
        <div
          style={{ textAlign: "left", marginTop: "50px", fontSize: "0.8em" }}
        >
          * OS usage statistics are from{" "}
          <a href="https://gs.statcounter.com/os-market-share">
            StatCounter.com.
          </a>
        </div>
      </div>
    </Layout>
    </>
  );
};
