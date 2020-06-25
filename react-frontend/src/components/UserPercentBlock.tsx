import React from "react";
import { formatDate, getUserPercentClass } from "./utilities";
import { usageStats } from "./usageStats";
import { DBData } from "./GlyphDashboard";
import { SeqDBData, getIsSequence } from "./SequenceDashboard";

interface UserPercentBlockProps {
  dbData: DBData | SeqDBData | null;
}

function getGlyphOrSequence(dbData: DBData | SeqDBData | null) {
  if (getIsSequence(dbData)) {
    return dbData.sequence;
  }
  if (dbData) return dbData.glyph;
  return null;
}

export const UserPercentBlock: React.FC<UserPercentBlockProps> = ({
  dbData,
}) => {
  const object = getGlyphOrSequence(dbData);

  return (
    <div style={{ clear: "both" }}>
      {dbData ? (
        object?.officialName === "Unassigned" ? (
          <div className="unassignedExp">
            This is an <em>unassigned</em> character within a valid range,
            meaning it could be designated a valid Unicode code point in the
            future. However, for now it has no assigned value.
          </div>
        ) : (
          <div className="userPercentWrap">
            {object?.unicodeBlock?.name === "Private Use Area" ? (
              <div className="privateBlock">
                This code point is in a Private Use Area, meaning each
                individual font can use it however they like: any normal
                character or even an invisible control character. The code point
                deliberately has no standardized meaning on its own or across
                fonts. If you have a font that uses this code point, you must
                specify that font when displaying it, or you will get
                unpredictable results.
              </div>
            ) : (
              ""
            )}
            <>
              <div className="userPercentBlock">
                We estimate that{" "}
                {object?.supportPercent > 0 ? "at least " : "roughly "}
                <div
                  className={
                    "userPercent " +
                    (dbData ? getUserPercentClass(object?.supportPercent) : "")
                  }
                >
                  {object?.supportPercent.toString().substring(0, 4)}%
                </div>{" "}
                of web users can view this {getIsSequence(dbData) ? "sequence" : "character"} with built-in fonts as of{" "}
                {formatDate(usageStats.asOf)}.*
                {dbData.noto?.name && (
                  <div className="notoBlock">
                    {object?.supportPercent < 50
                      ? "That is...very low. "
                      : object?.supportPercent < 80
                      ? "That is pretty low! "
                      : ""}
                    {dbData.noto && (
                      <>
                        If you want to guarantee that all of your users can see
                        it, just embed the open source font{" "}
                        <strong>{dbData.noto?.name}</strong> from Google,{" "}
                        <a href="https://www.google.com/get/noto/">here</a> or{" "}
                        <a href="https://github.com/googlefonts/noto-fonts/tree/master/phaseIII_only/unhinted/ttf">
                          here
                        </a>
                        .
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          </div>
        )
      ) : (
        ""
      )}
    </div>
  );
};

export const SourceCitation: React.FC = (props) => {
  return (
    <div className="sourceCitation">
      * Based on OS usage statistics from{" "}
      <a href={usageStats.sourceURL}>{usageStats.sourceName}</a> and the fonts
      included with each OS shown.
    </div>
  );
};

interface EmojiNoteProps {
  highlighted?: boolean
}

export const EmojiNote: React.FC<EmojiNoteProps> = ({ highlighted }) => {
  return (
    <div style={ highlighted ? { padding: "10px", marginTop: "10px", fontStyle: "italic", backgroundColor: "#e5e5e5" } : 
    { paddingTop: "10px", fontStyle: "italic" }} id="emojinote">
      <a href="#emojinotelink">**</a> If the color and black and white emojis
      look the same in your browser, that means you do not have fonts installed
      that can display both versions.
    </div>
  );
};
