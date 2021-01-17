import React, { useReducer, useRef, useEffect } from "react";
import { formatDate } from "./utilities";
import { DBData, isGlyphData } from "./GlyphDashboard";
import { usageStats } from "./usageStats";
import { apiHost } from "./globalSettings";
import axios from "axios";
import Loading from "./Loading";

interface OSObj {
  id: number;
  family: "mac" | "android" | "ios" | "windows" | "linux" | "chromeos";
  version: string;
  codeName: string;
  releaseDate: string;
  slug: string;
  maxUnicodeVersion__number?: string | null;
  displayName: string;
  fontListSource?: string;
}

interface OSDataProps {
  dbData: DBData | null;
}

// const hostName = window.location.hostname;

const scrollToRef = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
  if (ref.current)
    window.scrollTo({
      left: 0,
      top: ref.current.offsetTop,
      behavior: "smooth",
    });
};

export const OSData: React.FC<OSDataProps> = ({ dbData }) => {
  const initialState = {
    osFontData: null as any,
    featuredOS: null as OSObj | null,
    isLoading: false,
    showAllFonts: false,
  };

  const [dataState, dispatch] = useReducer(dbReducer, initialState);

  const displayOSes = {
    android: [
      "11.0",
      "10.0",
      "9.0 Pie",
      "8.0 Oreo",
      "7.0 Nougat",
      "6.0 Marshmallow",
      "5.0 Lollipop",
    ],
    ios: ["14", "13", "12", "11", "10", "9", "8"],
    windows: ["10", "8.1", "8", "7", "Vista", "XP"],
    mac: [
      "11.0 Big Sur",
      "10.15 Catalina",
      "10.14 Mojave",
      "10.13 High Sierra",
      "10.12 Sierra",
      "10.11 El Capitan",
      "10.10 Yosemite",
    ],
  };

  const featuredRef = useRef(null);
  const executeScroll = () => scrollToRef(featuredRef);

  function dbReducer(state: typeof initialState, action: any) {
    switch (action.type) {
      case "FETCH_OS_DATA": {
        return {
          ...state,
          isLoading: true,
          osFontData: null,
          featuredOS: action.payload as OSObj | null,
        };
      }

      case "FETCH_OS_DATA_SUCCESS": {
        return {
          ...state,
          isLoading: false,
          osFontData: action.payload,
          showAllFonts: false,
        };
      }

      case "RESET_FEATURED_OS": {
        return {
          ...state,
          featuredOS: null,
        };
      }

      case "TOGGLE_SHOW_ALL_FONTS": {
        return {
          ...state,
          showAllFonts: !state.showAllFonts,
        };
      }

      default:
        throw new Error(`Not supported action ${action.type}`);
    }
  }

  const getOSDetail = async (osObj: any) => {
    if (
      (isGlyphData(dbData) ? !dbData?.glyph?.codePoint : !dbData?.sequence) ||
      dbData === null
    ) {
      return;
    }

    if (dataState.featuredOS === osObj) {
      dispatch({ type: "RESET_FEATURED_OS" });
      return;
    }

    dispatch({ type: "FETCH_OS_DATA", payload: osObj });
    executeScroll();

    const osId = osObj.id;

    let mounted = true;

    const apiURL = isGlyphData(dbData)
      ? `${apiHost}/api/glyphcp/${dbData!.glyph?.codePoint}/fontsbyos/${osId}`
      : `${apiHost}/api/sequencepk/${dbData.sequence!.id}/fontsbyos/${osId}`;

    await axios
      .get(apiURL)
      .then((res) => {
        if (mounted) {
          dispatch({ type: "FETCH_OS_DATA_SUCCESS", payload: res.data });
        }
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const getOSObj = (family: string, version: string): OSObj[] | null => {
    if (!dbData || !dbData.oses) {
      return null;
    }
    return dbData.oses.filter(
      (osObj: any) => osObj.family === family && osObj.version === version
    );
  };

  const getOSUsage = () => {
    if (dataState.featuredOS) {
      const family = usageStats[dataState.featuredOS.family];
      if (family) {
        return (
          family[dataState.featuredOS.version] *
          family["t"] *
          100
        ).toFixed(2);
      }
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET_FEATURED_OS" });
  }, [dbData]);

  return (
    <>
      <div ref={featuredRef} />
      {(isGlyphData(dbData)
        ? dbData?.glyph?.supportPercent || 0
        : dbData?.sequence?.supportPercent || 0) > 0 && (
        <div
          className="whichOS"
          style={{
            display: dataState.featuredOS !== null ? "none" : "block",
          }}
        >
          Which OSes include a font supporting this character?
          <div style={{ fontSize: "0.9em", fontStyle: "normal" }}>
            Click any supported OS (in green) for detail
          </div>
        </div>
      )}
      <div
        className={
          "featuredOSwrap" + (dataState.featuredOS ? " active" : " hidden")
        }
        style={{
          opacity: dataState.featuredOS ? 1 : 0,
        }}
      >
        <div className="featuredOS">
          <div className="featuredOSname">
            {dataState.featuredOS?.displayName || "..."}
          </div>
          <div className="featuredOSfontsWrap">
            <div className="osReleaseBlock">
              {dataState.featuredOS && (
                <div className="OSusedBy">{`Used by ${getOSUsage()}% of web traffic*`}</div>
              )}
            </div>
            <div className="fontList">
              {dataState.osFontData ? (
                <>
                  Comes with {dataState.osFontData.fontCount} font
                  {dataState.osFontData.fonts.length === 1 ? " " : "s "}
                  that support
                  {dataState.osFontData.fonts.length === 1 ? "s " : " "}
                  this character
                  {dataState.osFontData.fonts.length > 5
                    ? ", including: "
                    : ": "}
                  {dataState.osFontData.fonts
                    .slice(0, 5)
                    .map((font: any, idx: number) => (
                      <strong key={idx}>{font.name}</strong>
                    ))
                    .reduce((prev: any, curr: any, idx: number) => [
                      prev,
                      idx === dataState.osFontData.fonts.length - 1
                        ? `${idx > 1 ? "," : ""} and `
                        : ", ",
                      curr,
                    ])}
                  {dataState.osFontData.fontCount > 5 &&
                    ` and ${dataState.osFontData.fontCount - 5} other${
                      dataState.osFontData.fontCount - 5 > 1 ? "s" : ""
                    }.`}
                  {dataState.osFontData.fontCount > 5 && (
                    <button
                      className="showMoreBtn"
                      onClick={() =>
                        dispatch({
                          type: "TOGGLE_SHOW_ALL_FONTS",
                          payload: dataState.showAllFonts,
                        })
                      }
                    >
                      {dataState.showAllFonts ? "(Show less)" : "(Show all)"}
                    </button>
                  )}
                  {dataState.showAllFonts && (
                    <>
                      <ul style={{ textAlign: "left" }}>
                        {dataState.osFontData.fonts.map((font: any) => (
                          <li>{font.name}</li>
                        ))}
                      </ul>
                      <button
                        className="showMoreBtn"
                        onClick={() =>
                          dispatch({ type: "TOGGLE_SHOW_ALL_FONTS" })
                        }
                      >
                        {dataState.showAllFonts ? "(Show less)" : "(Show all)"}
                      </button>
                    </>
                  )}
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "15px",
                      fontSize: "0.9em",
                    }}
                  >
                    <span className="osReleaseDate">
                      OS released{" "}
                      {formatDate(dataState.featuredOS?.releaseDate || "...")}
                      {dataState.featuredOS?.maxUnicodeVersion__number &&
                        `, designed for Unicode ${
                          dataState.featuredOS?.maxUnicodeVersion__number ||
                          "..."
                        }`}
                    </span>{" "}
                    •{" "}
                    <a
                      href={
                        dataState.featuredOS?.fontListSource?.split(" and ")[0]
                      }
                    >
                      OS font list
                    </a>
                    {dataState.featuredOS?.fontListSource &&
                      dataState.featuredOS.fontListSource.split(" and ")
                        .length > 1 && (
                        <>
                          ,{" "}
                          <a
                            href={
                              dataState.featuredOS?.fontListSource?.split(
                                " and "
                              )[1]
                            }
                          >
                            (2)
                          </a>
                        </>
                      )}
                  </div>
                </>
              ) : (
                <Loading dotsOnly={true} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="osSection">
        {Object.keys(displayOSes).map((osFamily) => (
          <React.Fragment key={osFamily}>
            <div className="osWrapper">
              <div className="osHeader">
                {osFamily !== "ios" ? osFamily.toUpperCase() : "iOS"}
              </div>
              <div className="osVersions">
                {Reflect.get(displayOSes, osFamily).map((osVersion: string) => {
                  const osVersionSplit = osVersion.split(" ");
                  const osSuppList = dbData
                    ? getOSObj(osFamily, osVersionSplit[0])
                    : [];
                  const isSupported = osSuppList && osSuppList.length > 0;
                  return (
                    <div
                      className={
                        "osVersion btn" +
                        (dbData
                          ? isSupported
                            ? " supported"
                            : " unsupported disabled"
                          : "") +
                        (osFamily === dataState?.featuredOS?.family &&
                        osVersionSplit[0] === dataState?.featuredOS?.version
                          ? " active"
                          : "")
                      }
                      key={osVersion}
                      onClick={() => {
                        if (dbData && isSupported) {
                          getOSDetail(osSuppList![0]);
                        }
                      }}
                    >
                      {osVersionSplit[0]}
                      {osVersionSplit.length > 1 && (
                        <span style={{ fontWeight: "normal" }}>
                          {" "}
                          {osVersionSplit.slice(1).join(" ")}
                        </span>
                      )}
                      {}
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
