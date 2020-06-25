import React from "react";
import { BrowserRouter as Router, Switch, Route }  from "react-router-dom";
import { GlyphDashboard } from "./components/GlyphDashboard";
import { UniBrowser } from "./components/UniBrowser";
import { HomePage } from "./components/HomePage";
import { createBrowserHistory } from 'history';
import './bootstrap.min.css';
import './uni.css';
import { SequenceDashboard } from "./components/SequenceDashboard";

const history = createBrowserHistory();

const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1];
if (path) {
    history.replace(path);
}

const App: React.FC<any> = (props) => {
  return <Router>
    <Switch>
      <Route path="/block/:blockSlug">
        <UniBrowser />
      </Route>
      <Route path="/block">
        <UniBrowser />
      </Route>
      <Route path="/search/:searchTerm">
        <GlyphDashboard />
    </Route>
    <Route path="/:sequencePoints([0-9a-fA-F]+-[0-9a-fA-F\\-]*)"> {/* any hex with hyphens in between */}
        <SequenceDashboard />
    </Route>
      <Route path="/:codePoint">
        <GlyphDashboard />
    </Route>
    <Route path="/">
        <HomePage />
    </Route>
    </Switch>
    </Router>
};

export default App;
