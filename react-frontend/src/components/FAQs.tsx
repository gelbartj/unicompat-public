import React, { useState } from "react";

export const FAQs: React.FC = (props) => {
    const [showFAQs, setShowFAQs] = useState(false);

    return <>
    <div style={{ textAlign: "center" }}>
                <button
                  className="btn showFAQsBtn"
                  onClick={() => setShowFAQs(!showFAQs)}
                >
                  { showFAQs ? "Hide questions" : "Questions?" }
                </button>
              </div>
              <div style={{ margin: "auto" }} className="faqWrap">
                  <div style={{ marginTop: "10px" }} className={ "faqBlock" + (showFAQs ? " active" : " hidden") }>
                    <div
                      style={{
                        color: "grey",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      FAQs
                    </div>
                    <p style={{ fontWeight: "bold" }}>
                      1. This page says my OS doesn't support the character, but
                      I <em>CAN</em> see it! You're wrong!
                    </p>
                    <p style={{ marginLeft: "10px" }}>
                      This page only considers the fonts that are installed{" "}
                      <em>by default</em>, out of the box. If you've installed
                      other fonts later, that is likely the reason you can see
                      the character.
                    </p>
                    <p style={{ fontWeight: "bold" }}>
                      2. This page says my OS does support the character, but I{" "}
                      <em>CAN'T</em> see it! What gives?
                    </p>
                    <p style={{ marginLeft: "10px" }}>
                      If you are using Android, your device manufacturer may
                      have removed some of the default fonts from their
                      distribution of the OS. This page only considers the font
                      lists from Google's original Android source code. If you
                      are not on Android, you may have found a mistake. Send us
                      a note.
                    </p>
                    <p style={{ fontWeight: "bold" }}>
                      3. Why is this page saying some characters are supported
                      in older versions of Windows, but <em>NOT</em> in Windows
                      10?
                    </p>
                    <p style={{ marginLeft: "10px" }}>
                      Starting with Windows 10, Microsoft stopped bundling
                      international fonts with their default installations. This
                      makes the installation size of the operating system
                      smaller, but users now have to take the extra step of
                      downloading the fonts they would like for additional
                      languages.
                    </p>
                    <p style={{ fontWeight: "bold" }}>
                      4. Why doesn't the level of support ever go above ~95%?
                    </p>
                    <p style={{ marginLeft: "10px" }}>
                      The calculation for user support is based on OS usage
                      statistics from{" "}
                      <a
                        href="https://gs.statcounter.com/os-market-share"
                        rel="external nofollow"
                      >
                        StatCounter
                      </a>
                      . The percentage of worldwide users NOT using Android,
                      iOS, Windows, or macOS is 3.8% as of November 2020, and we
                      have not gathered font data for those operating systems.
                      That is why our estimates do not reach 100% but say <em>at least</em> X%,
                      because there is a good chance these other operating
                      systems also support any given character if it has
                      universal support on the major OSes.
                    </p>
                    {/* What is Unicode? All you need is a font? Really? */}
                  </div>
              </div>
              </>
}