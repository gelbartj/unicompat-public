
import React from "react";
import { formatDate, leftPad } from "./utilities";
import { Link } from "react-router-dom";

interface DetailTableProps {
    dbData: any;
}

export const DetailTable: React.FC<DetailTableProps> = ({ dbData }) => {
    const fourDigitHex = dbData?.glyph ? leftPad(dbData.glyph.codePoint.toString(16).toUpperCase()) : "";
    const eightDigitHex = leftPad(fourDigitHex, 8);

    return <><table
                    style={{ margin: "auto" }}
                    cellSpacing={5}
                  >
                    <thead>
                      <tr>
                      <th colSpan={2} style={{textAlign: "center", fontVariant:"small-caps"}}>
                        Character Details
                      </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Category:</strong>{" "}
                        </td>
                        <td>
                          {dbData
                            ? dbData?.glyph?.categoryT
                              ? dbData?.glyph?.categoryT +
                                ` (${dbData?.glyph?.category})`
                              : "N/A"
                            : "..."}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Unicode Block:</strong>{" "}
                        </td>
                        <td>
                          {dbData?.glyph?.unicodeBlock ? <Link to={`/block/${dbData.glyph.unicodeBlock.slug}`}>{ dbData.glyph.unicodeBlock.name }</Link> : "..."}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Unicode Plane:</strong>
                        </td>
                        <td>{dbData?.glyph?.codePlaneT || "..."}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Defined in Unicode Version:</strong>{" "}
                        </td>
                        <td>
                          {dbData
                            ? dbData?.glyph?.minUnicodeVersion
                              ? dbData?.glyph?.minUnicodeVersion
                                  ?.number +
                                ` (${formatDate(
                                  dbData?.glyph?.minUnicodeVersion
                                    ?.releaseDate
                                )})`
                              : "N/A"
                            : "..."}
                        </td>
                      </tr>
                      { dbData?.decomp?.length > 0 && <tr>
                            <td><strong>Equivalent character combination:</strong></td>
                            <td>{dbData.decomp.map((decompGlyph: any) => {
                              let hexVal = leftPad(decompGlyph.codePoint.toString(16).toUpperCase());
                              return <Link to={"/" + hexVal}>
                                { "U+" + hexVal + " " + decompGlyph.officialName }
                              </Link>
                              }).reduce((prev: any, curr: any) => [
                                prev, ", ", curr,
                              ])
                            }</td>
                          </tr> }
                      {dbData && dbData.glyph.officialName.includes("CJK") && (
                        <>
                          { !!dbData.glyph.definition && <tr>
                            <td>Definition</td>
                            <td>{dbData.glyph.definition.substring(0, 1).toUpperCase() +
                              dbData.glyph.definition.slice(1)}</td>
                          </tr> }
                          { !!dbData.glyph.mandarin && <tr>
                            <td>Mandarin</td>
                            <td>{dbData.glyph.mandarin}</td>
                          </tr> }
                          { !!dbData.glyph.cantonese && <tr>
                            <td>Cantonese</td>
                            <td>{dbData.glyph.cantonese}</td>
                          </tr> }
                          {!!dbData.glyph.japKun && (
                            <tr>
                              <td>
                                Japanese <em>kun</em> reading:{" "}
                              </td>
                              <td>
                                {dbData.glyph.japKun.toLowerCase()}
                              </td>
                            </tr>
                          )}
                          {!!dbData.glyph.japOn && (
                            <tr>
                              <td>
                                Japanese <em>on</em> reading:{" "}
                              </td>
                              <td>
                                {dbData.glyph.japOn.toLowerCase()}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                      <tr style={{borderTop:"3px solid lightgrey"}}>
                        <td>HTML entities:</td><td>{ dbData ? <><code>&amp;#x{ fourDigitHex };</code> or <code>&amp;#{dbData.glyph.codePoint};</code></> : "..."}</td>
                      </tr>
                      <tr>
                        <td>Javascript:</td><td>{ dbData ? (
                          dbData.glyph.surrogates ? (
                          <>
                            <code>\u{"{" + fourDigitHex + "}"}</code> (ES6) or {dbData.glyph.surrogates.map((surrogate: string) => <code key={surrogate}>\u{leftPad(surrogate).toUpperCase()}</code>)} (ES5)
                          </>
                         ) : <code>\u{ fourDigitHex }</code>) : "..."}</td>
                      </tr>
                      <tr>
                        <td>Python:</td><td>{ dbData ? <code>\U{ eightDigitHex }</code> : "..."}</td>
                      </tr>
                    </tbody>
                  </table>
                  { (dbData?.glyph?.isEmoji && dbData?.glyph?.hasColorEmoji) && (
                    <div className="emojiHelp">
                      <strong>Note: </strong>Add <code>&#xFEOF;</code> (HTML) or <code>\uFE0F</code> (others) after the codes above to specify the color emoji version of this character. For the black and white version, add <code>&#xFEOE;</code> or <code>\uFE0E</code> and use a monospace font.
                      </div>
                  )}
        </>
}