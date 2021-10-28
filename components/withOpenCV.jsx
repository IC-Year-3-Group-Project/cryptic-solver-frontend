/* eslint-disable no-console */
import React, { Fragment } from "react";

import injectScript from "../image_recognition/injectScript";
const OPENCV_URL = "http://127.0.0.1:8000/public/js/opencv.js";

export default function withOpenCV(
  videoPlayer,
  setupVideo,
  processVideo,
  teardownVideo,
  options,
  playerEventHandler
) {
  class OpenCV extends React.Component {
    constructor(props) {
      super(props);
      this.playerRef = React.createRef();
      this.loadOpenCv();
    }

    loadOpenCv = () => {
      const promise = injectScript("opencv-injected-js", OPENCV_URL);
      promise
        .then(() => {
          console.log(`success to load ${OPENCV_URL}`);
          // eslint-disable-next-line no-undef
          console.log(cv.getBuildInformation());
          this.playerRef.trigger("opencvReady");
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log(`Failed to load ${OPENCV_URL}`);
        });
    };

    playerEventHandler(type, e) {
      if (playerEventHandler != null) {
        playerEventHandler(type, e);
      }
    }

    render = () => {
      const Player = videoPlayer;
      return (
        <Fragment>
          <Player
            ref={this.playerRef}
            {...options}
            setupVideo={setupVideo}
            processVideo={processVideo}
            teardownVideo={teardownVideo}
            playerEventHandler={this.playerEventHandler}
          />
        </Fragment>
      );
    };
  }
  return OpenCV;
}
