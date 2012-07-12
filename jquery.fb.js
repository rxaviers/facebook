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
      loading = $.Deferred(),
      initializing = $.Deferred();

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
      Fb.loaded = true;
      loading.resolve();
    },

    init: function(options) {
      options || (options = {});
      $.extend(Fb.defaults, options);
      if($("fb-root").length == 0) {
        $("<div></div>").attr("id", "fb-root").appendTo("body");
      }
      loading.done(function() {
        FB.permissions = {};
        FB.init(Fb.defaults);
        FB.inited = true;
        FB.underPermission = Fb.underPermission;
        FB.Event.subscribe("auth.statusChange", function() {
          Fb.getPermissions();
        });
        initializing.resolve();
      });
    },

    ready: function(cb) {
      initializing.done(cb);
    },

    getPermissions: function(cb) {
      FB.api('/me/permissions', function (response) {
        FB.permissions = response.data[0];
        if(cb) {cb();}
      });
    },

    checkPermission: function(permission) {
      var permissions = permission.split(","),
          i;
      for( i = 0;
           i < permissions.length && FB.permissions[permissions[i].trim()];
           i++ );
      return i == permissions.length;
    },

    underPermission: function(permission, cb) {
      // User does have the permission granted already, go ahead
      if(Fb.checkPermission(permission)) {
        cb(true);
      }
      // User does NOT have such permission granted yet, ask for it
      else {
        FB.login(function(response) {
          Fb.getPermissions(function() {
            cb(Fb.checkPermission(permission));
          });
        }, {scope: permission})
      }
    }
  });

  window.fbAsyncInit = Fb.postLoad;

  // Load the API Asynchronously when document is ready
  $(function() {
    var script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.src = "http://connect.facebook.net/en_US/all.js";
    document.getElementsByTagName('head')[0].appendChild(script);
  });

  window.FB_init = Fb.init;
  window.FB_ready = Fb.ready;

})( window, jQuery );
