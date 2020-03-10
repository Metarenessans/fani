import React from 'react'
import ReactDOM from 'react-dom'
import $ from "jquery"
import App from "./App"

ReactDOM.render(<App />, document.querySelector("#root"));

var $modal = $(".modal");
var $body  = $("body");
$(".js-open-modal").click(function(e) {
  $modal.addClass("visible");
  $body.addClass("scroll-disabled");
});

$(".js-close-modal").click(function(e) {
  $modal.removeClass("visible");
  $body.removeClass("scroll-disabled");
});