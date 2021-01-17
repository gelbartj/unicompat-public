import React from "react";
import { Helmet } from "react-helmet-async";
import { formatDate, getUserPercentClass } from "./utilities";
import { usageStats } from "./usageStats";
import { DBData, Glyph, isGlyphData } from "./GlyphDashboard";

interface UserPercentBlockProps {
  dbData: DBData | null;
  slug: string;
}

function getGlyphOrSequence(dbData: DBData | null) {
  if (isGlyphData(dbData)) {
    return dbData.glyph;
  }
  if (dbData) return dbData.sequence;
  return null;
}

export const UserPercentBlock: React.FC<UserPercentBlockProps> = ({
  dbData,
  slug,
}) => {
  const object = getGlyphOrSequence(dbData);
  const unicodeBlock =
    (object as Glyph)?.unicodeBlock !== undefined
      ? (object as Glyph).unicodeBlock
      : undefined;

  const UnassignedBlock = () => (
    <>
      <Helmet>
        <meta
          name="description"
          content="This is an unassigned character within a valid range,
            meaning it could be designated a valid Unicode code point in the
            future. However, for now it has no assigned value."
        />
      </Helmet>
      <div className="unassignedExp">
        This is an <em>unassigned</em> character within a valid range, meaning
        it could be designated a valid Unicode code point in the future.
        However, for now it has no assigned value.
      </div>
    </>
  );

  const NonCharacterBlock = () => (
    <>
    <Helmet>
      <meta name="description" content="This is a special Unicode code point designated as a non-character that
      will never have an official assigned value. Some fonts may use it to detect proper encoding of data." />
    </Helmet>
    <div className="unassignedExp">
      This is a special Unicode code point designated as a non-character that
      will{" "}
      <a
        style={{ fontWeight: "bold" }}
        rel="external"
        href="https://en.wikipedia.org/wiki/Universal_Character_Set_characters#Non-characters"
      >
        never have an official assigned value.
      </a>{" "}
      Some fonts may use it to detect proper encoding of data.
    </div>
    </>
  );

  const PrivateUseBlock = () => (
    <>
      <Helmet>
        <meta
          name="description"
          content="This code point is in a Private Use Area, meaning each
                individual font can use it however they like. The code point
                deliberately has no standardized meaning on its own or across
                fonts. If you have a font that uses this code point, you must
                specify that font when displaying it, or you will get
                unpredictable results."
        />
      </Helmet>
      <div className="privateBlock">
        This code point is in a Private Use Area, meaning each individual font
        can use it however they like: for any normal character or even an
        invisible control character. The code point deliberately has no
        standardized meaning on its own or across fonts. If you have a font that
        uses this code point, you must specify that font when displaying it, or
        you will get unpredictable results.
      </div>
    </>
  );

  return (
    <div style={{ clear: "both" }}>
      {dbData && object ? (
        <>
          <Helmet>
            <link rel="canonical" href={`https://www.unicompat.com/${slug}`} />
          </Helmet>
          {object.officialName === "Unassigned" ? (
            <UnassignedBlock />
          ) : ("isNonCharacter" in object && object.isNonCharacter) ? (
            <NonCharacterBlock />
          ) : (
            <div className="userPercentWrap">
              {unicodeBlock?.name === "Private Use Area" ? (
                <PrivateUseBlock />
              ) : (
                <Helmet>
                  <meta
                    name="description"
                    content={
                      `We estimate that ${
                        object.supportPercent > 0 ? "at least " : "roughly "
                      }` +
                      `${object?.supportPercent
                        .toString()
                        .substring(0, 4)}% of web users can view the` +
                      ("codePoint" in object
                        ? ` character "${String.fromCodePoint(
                            object.codePoint
                          )}"`
                        : ` sequence "${object.sequenceString}"`) +
                      ` properly with built-in ` +
                      `fonts as of ${formatDate(usageStats.asOf)}.`
                    }
                  />
                </Helmet>
              )}
              <>
                <div className="userPercentBlock">
                  We estimate that{" "}
                  {object.supportPercent > 0 ? "at least " : "roughly "}
                  <div
                    className={
                      "userPercent " +
                      (dbData
                        ? getUserPercentClass(object?.supportPercent)
                        : "")
                    }
                  >
                    {object?.supportPercent.toString().substring(0, 4)}%
                  </div>{" "}
                  of web users can view this{" "}
                  {isGlyphData(dbData) ? "character" : "sequence"} properly with
                  built-in fonts as of {formatDate(usageStats.asOf)}.
                  {object?.supportPercent >= 95.5
                    ? " That's as good as it gets!"
                    : ""}
                  *
                  {dbData?.noto?.name &&
                    object?.supportPercent < 95.5 &&
                    object?.officialName !== "Private or unassigned" && (
                      <div className="notoBlock">
                        {object?.supportPercent < 50
                          ? "That is...very low. "
                          : object?.supportPercent < 80
                          ? "That is pretty low! "
                          : ""}
                        {
                          <>
                            If you want to guarantee that all of your users can
                            see it, embed the open source font{" "}
                            <strong>{dbData.noto.name}</strong>
                            {dbData.noto?.version
                              ? ` (${dbData.noto.version})`
                              : ""}{" "}
                            from Google,{" "}
                            <a href="https://www.google.com/get/noto/">here</a>{" "}
                            or{" "}
                            <a href="https://github.com/googlefonts/noto-fonts">
                              here
                            </a>
                            .
                          </>
                        }
                      </div>
                    )}
                </div>
              </>
            </div>
          )}
        </>
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
  highlighted?: boolean;
}

export const EmojiNote: React.FC<EmojiNoteProps> = ({ highlighted }) => {
  return (
    <div
      style={
        highlighted
          ? {
              padding: "10px",
              marginTop: "10px",
              fontStyle: "italic",
              backgroundColor: "#e5e5e5",
            }
          : { paddingTop: "10px", fontStyle: "italic" }
      }
      id="emojinote"
    >
      <a href="#emojinotelink">**</a> If the color and black and white emojis
      look the same in your browser, that means either you do not have fonts
      installed that can display both versions, or this emoji only has one
      version.
    </div>
  );
};
