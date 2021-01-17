import React from "react";
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";
import { GlyphDashboard } from "./components/GlyphDashboard";
import { UniBrowser } from "./components/UniBrowser";
import { HomePage } from "./components/HomePage";
import { createBrowserHistory } from 'history';
import './bootstrap.min.css';
import './uni.css';
import ScrollToTop from "./components/ScrollToTop";
import { IntCodeComponent } from "./components/IntCodeComponent";
import { SearchResults } from "./components/SearchResults";
import { HelmetProvider } from "react-helmet-async";

const history = createBrowserHistory();

const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
if (path) {
    history.replace(path);
}

const App: React.FC<any> = (props) => {
  return <Router>
    <HelmetProvider>
    <ScrollToTop>
    <Switch>
      <Route path="/block/:blockSlug/:page">
        <UniBrowser />
      </Route>
      <Route path="/block/:blockSlug">
        <UniBrowser />
      </Route>
      <Route path="/block">
        <UniBrowser />
      </Route>
      <Route path="/search/l/:searchTerm">
        <GlyphDashboard />
      </Route>
      <Route path="/search/:searchTerm/:page">
        <SearchResults />
      </Route>
      <Route path="/search/:searchTerm">
        <SearchResults />
      </Route>
      <Route path="/:sequencePoints([0-9a-fA-F]+-[0-9a-fA-F\\-]*)"> {/* any hex with hyphens in between */}
        <GlyphDashboard />
      </Route>
      <Route path="/:codePoint([0-9a-fA-F]+)">
        <GlyphDashboard />
      </Route>
      <Route path="/int/:intCode">
          <IntCodeComponent />
      </Route>
      <Route path="/:searchTerm">
        <GlyphDashboard />
      </Route>
      <Route path="/">
          <HomePage />
      </Route>
    </Switch>
    </ScrollToTop>
    </HelmetProvider>
    </Router>
};

export default App;
