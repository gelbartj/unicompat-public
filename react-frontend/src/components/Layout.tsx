import React from "react";
import { Masthead } from "./Masthead";
import { useParams } from "react-router-dom";

interface LayoutProps {
    dispatch?: React.Dispatch<any>
}

export const Layout: React.FC<LayoutProps> = (props) => {
  let { searchTerm } = useParams();

  /*
    props.query && props.query.split("search=")?.length > 1
      ? decodeURIComponent(props.query.split("search=")[1])
      : ""; // only applicable on initial page load, ok to leave
    */

  return (
    <>
      <Masthead searchVal={searchTerm} dispatch={props.dispatch} />
      <div className="wrap">{props.children}</div>
      <div className="outsideWrap">
        Photo credit: Gilbert Sopakuwa (Flickr), "
        <a href="https://www.flickr.com/photos/g-rtm/49094627836/in/photolist-2hNjNqC-2ikoVt7-E6Azua-8a6Ys-2g1NJXD-2hN7s2k-2fNDxhL-SvBT9h-r3jPvX-2hJTs2w-8a6Rz-8a6Tv-8a6VH-8a6PL-2i7zEC1-8a74i-8a75t-8a6Z9-2hSQQvh-2hSwB9U-UNuMY1-2gwSRrx-F8YSvm-PmiMTQ-2hM8kTD-28VfUhK-oH5Kqf-NaUGyC-HU3d81-2ae2Qi9-MNM7r9-29RG3Qb-PA1EB9-2hM3vVt-8a729-2hLAdk8-8a74N-2hSwAJR-qasYBF-8a6QN-2hLCMye-2hSAbEj-2aifNG2-8BYEpW-sL5uyQ-4As318-8mvZC5-NaUdmW-BaxAaa-GgNhmz">
          Mount Fuji sunrise, Fujikawaguchiko
        </a>
        ," November 2019.{" "}
        <a href="https://creativecommons.org/licenses/by-nc-nd/2.0/">
          CC BY-NC-ND 2.0
        </a>
      </div>
      <div className="outsideWrap" style={{fontStyle:"normal"}}>Questions, comments? Drop us a line at <code style={{color:"#e83e8c"}}>unicompat0</code> at gmail.</div>
    </>
  );
};
