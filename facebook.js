/*
 * Facebook made easier
 *
 * Copyright Rafael Xavier de Souza
 * Released under the MIT license
 * https://github.com/rxaviers/facebook/blob/master/LICENSE-MIT
 */
(function(root, factory) {
  // UMD returnExports
  if (typeof define === "function" && define.amd) {
    // AMD
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // Node, CommonJS
    module.exports = factory(require("jquery"));
  } else {
    // Extend global
    factory(root.jQuery);
  }
}(this, function($) {

  var Fb, ready,
      loading = $.Deferred(),
      initializing = $.Deferred(),
      getting_permission = $.Deferred(),
      granted_permissions;

  ready = initializing.done;

  function _postLoad() {
    loading.resolve();
  }

  function _getPermissions(cb) {
    var prev_getting_permission = getting_permission;
    getting_permission = $.Deferred();
    FB.api("/me/permissions", function (response) {
      granted_permissions = response.data ? response.data[0] : {};
      prev_getting_permission.resolve();
      getting_permission.resolve();
      if(cb) {cb();}
    });
  }

  function _checkPermission(permission) {
    var i,
        permissions = permission.split(",");
    for( i = 0;
         i < permissions.length && granted_permissions[permissions[i].trim()];
         i++ );
    return i == permissions.length;
  }


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
      xfbml: false
    },

    hasPermission: function(permission, yes, no) {
      ready(function() {
        getting_permission.done(function() {
          if(_checkPermission(permission)) {
            yes();
          }
          else {
            no();
          }
        });
      });
    },

    init: function(options) {
      options = $.extend({}, Fb.defaults, options);
      loading.done(function() {
        FB.init(options);
        FB.Event.subscribe("auth.statusChange", function() {
          _getPermissions();
        });
        initializing.resolve();
      });
    },

    ready: ready,

    underPermission: function(permission, yes, no) {
      // Note Fb.hasPermission is already ready scoped.
      Fb.hasPermission(permission, yes, function() {
        // User does NOT have such permission granted yet, ask for it
        FB.login(function(response) {
          _getPermissions();
          Fb.hasPermission(permission, yes, no);
        }, {scope: permission});
      });
    }
  });

  // Proxy async methods
  $.each(["api", "getLoginStatus", "login", "logout", "ui"], function(i, method) {
    Fb[method] = function() {
      var fn,
          args = arguments;
      ready(function() {
        fn = FB[method];
        fn.apply(fn, args);
      });
    };
  });

  // Load the API Asynchronously.
  window.fbAsyncInit = _postLoad;

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, "script", "facebook-jssdk"));

  return Fb;

}));
