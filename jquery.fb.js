/*
 * FB: Facebook made easier, version 0.1
 * @requires jQuery
 *
 * Dual licensed under the MIT and GPL Version 2 licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Copyright (c) 2011 Rafael Xavier de Souza (http://rafael.xavier.blog.br)
 */
;(function( window, $, undefined ) {
  
  var Fb,
      $document = $(document);

  /**
   * Fb instance constructor
   */
  Fb = function() {
  };

  /**
   * Fb static
   */
  $.extend(Fb, {
    defaults: {
      appId: '',    // required, pass thru init() options
      cookie: true,
      oauth: true,
      status: true, 
      xfbml: true
    },

    loaded: false,
    inited: false,

    postLoad: function() {
      console.log("FB", "loaded");
      if(Fb.loaded) {return;}
      Fb.loaded = true;
      $document.triggerHandler("fb-loaded");
    },

    init: function(options) {
      var init = function() {
        console.log("FB", "init", JSON.stringify(Fb.defaults));
        FB.init(Fb.defaults);
        FB.inited = true;
        $document.triggerHandler("fb-ready");
      };
      options || (options = {});
      $.extend(Fb.defaults, options);
      if($("fb-root").length == 0) {
        $("<div></div>").attr("id", "fb-root").appendTo("body");
      }
      if(Fb.loaded) {
        init();
      }
      else {
        $document.bind("fb-loaded", function() {init();});
      }
    },

    ready: function(cb) {
      if(this.inited) {
        cb();
      }
      else {
        $document.bind("fb-ready", function() {cb();});
      }
    }
  });

  window.fbAsyncInit = Fb.postLoad;

  // Load the API Asynchronously when document is ready
  $(function() {
    console.log("FB", "load");
    var script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.src = "http://connect.facebook.net/en_US/all.js";
    document.getElementsByTagName('head')[0].appendChild(script);
  });

  window.FB_init = Fb.init;
  window.FB_ready = Fb.ready;

})( window, jQuery );
