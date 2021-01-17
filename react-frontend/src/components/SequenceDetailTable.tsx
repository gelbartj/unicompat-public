import React from "react";
import { formatDate, leftPad } from "./utilities";
import { Link } from "react-router-dom";

interface SequenceDetailTableProps {
  dbData: any;
}

export const SequenceDetailTable: React.FC<SequenceDetailTableProps> = ({
  dbData,
}) => {
  const fourDigitHexList = dbData?.sequence
    ? dbData.sequence.cpList.map((cp: number) =>
        leftPad(cp.toString(16).toUpperCase())
      )
    : [];
  const eightDigitHexList = fourDigitHexList
    ? fourDigitHexList.map((digit: string) => leftPad(digit, 8))
    : [];

  return (
    <>
      <table style={{ margin: "auto" }} cellSpacing={5}>
        <thead>
          <tr>
            <th
              colSpan={2}
              style={{ textAlign: "center", fontVariant: "small-caps" }}
            >
              Sequence Details
            </th>
          </tr>
        </thead>
        <tbody>
          {dbData?.sequence?.glyphs?.length > 0 && (
            <tr>
              <td>
                <strong>Composed of characters:</strong>
              </td>
              <td style={{ overflowWrap: "anywhere" }}>
                {dbData.sequence.cpList
                  .map((codePoint: any, idx: number) => {
                    const hexVal = leftPad(
                      codePoint.toString(16).toUpperCase()
                    );
                    const offName = dbData.sequence.glyphs.filter(
                      (glyphObj: any) => glyphObj.codePoint === codePoint
                    )[0].officialName;
                    return (
                      <Link
                        style={{ overflowWrap: "anywhere" }}
                        key={hexVal + "-" + idx}
                        to={"/" + hexVal}
                      >
                        {"U+" + hexVal + " " + offName}
                      </Link>
                    );
                  })
                  .reduce((prev: any, curr: any) => [prev, ", ", curr])}
              </td>
            </tr>
          )}
          {dbData?.sequence?.minUnicodeVersion && (
            <tr>
              <td>
                <strong>Defined in Unicode Version:</strong>{" "}
              </td>
              <td>
                {dbData?.sequence?.minUnicodeVersion?.number +
                  ` (${formatDate(
                    dbData?.sequence?.minUnicodeVersion?.releaseDate
                  )})`}
              </td>
            </tr>
          )}
          <tr style={{ borderTop: "3px solid lightgrey" }}>
            <td>HTML entities:</td>
            <td>
              {dbData?.sequence ? (
                <>
                  <code style={{ overflowWrap: "anywhere" }}>
                    &amp;#x{fourDigitHexList.join(";&#x")};
                  </code>{" "}
                  or{" "}
                  <code style={{ overflowWrap: "anywhere" }}>
                    &amp;#{dbData.sequence.cpList.join(";&#")};
                  </code>
                </>
              ) : (
                "..."
              )}
            </td>
          </tr>
          <tr>
            <td style={{ overflowWrap: "anywhere" }}>Javascript (ES6):</td>
            <td>
              {dbData?.sequence ? (
                <code
                  style={{ overflowWrap: "anywhere" }}
                >{`\\u{${fourDigitHexList.join("}\\u{")}}`}</code>
              ) : (
                "..."
              )}
            </td>
          </tr>
          <tr>
            <td style={{ overflowWrap: "anywhere" }}>Python:</td>
            <td>
              {dbData ? (
                <code style={{ overflowWrap: "anywhere" }}>
                  \U{eightDigitHexList.join("\\U")}
                </code>
              ) : (
                "..."
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
