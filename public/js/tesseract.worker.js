/**
 *  This exists to capture all the events that are thrown out of the worker
 *  into the worker. Without this, there would be no communication possible
 *  with the project.
 */
 onmessage = function (e) {
  switch (e.data.msg) {
    case "recognize_text": {
      return recognize_text(e.data);
    }
    default:
      break;
  }
};

function recognize_text({ msg, payload }) {
  let image = payload;
  let text = recognize(image);
  postMessage({ msg, payload: text });
}