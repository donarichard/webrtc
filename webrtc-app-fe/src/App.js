import React, { Component } from "react";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";
import "./App.css";
import { GoToRoomInput } from "./components/goToRoomInput";
import Video from "./components/video";
import "./styles/video.css";
class App extends Component {
  render() {
    return (
      <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<GoToRoomInput/>} />
        <Route path="/meeting/:roomId" Component={Video} />
      </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
