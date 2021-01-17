import React from "react";
import { Link } from "react-router-dom";

export interface SequenceObj {
  cpList: number[];
  officialName: string;
}

export interface VariantObj {
  codePoint: number;
  name: string;
}

interface VariantsProps {
  baseCharCp?: number;
  variantObjs?: VariantObj[];
  sequenceObjs?: SequenceObj[];
}

export const Variants: React.FC<VariantsProps> = ({
  baseCharCp,
  variantObjs,
  sequenceObjs,
}) => {
  const baseChar = baseCharCp ? String.fromCodePoint(baseCharCp) : "";
  return (
    <>
      {variantObjs && baseChar
        ? variantObjs.map((vObj) => (
            <Link
              key={vObj.codePoint}
              className="variant"
              title={vObj.name}
              to={
                "/" +
                baseChar!.codePointAt(0)?.toString(16).toUpperCase() +
                "-" +
                vObj.codePoint.toString(16).toUpperCase()
              }
            >
              <div>{baseChar + String.fromCodePoint(vObj.codePoint)}</div>
            </Link>
          ))
        : sequenceObjs
        ? sequenceObjs.map((sObj) => (
            <Link
              key={sObj.cpList.join("-")}
              className="variant"
              title={sObj.officialName}
              to={
                "/" +
                sObj.cpList.map((cp) => cp.toString(16).toUpperCase()).join("-")
              }
            >
              <div>{sObj.cpList.map((cp) => String.fromCodePoint(cp))}</div>
            </Link>
          ))
        : ""}
    </>
  );
};
