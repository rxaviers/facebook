/* globals FB, Promise */
/*
* Facebook made easier
*
* Copyright Rafael Xavier de Souza
* Released under the MIT license
* https://github.com/rxaviers/facebook/blob/master/LICENSE-MIT
*/

require("es6-promise/auto");
var ObjectAssign = require("object-assign");

var Fb;
var loadingResolve;
var readyResolve;

var loading = new Promise(function(resolve) {
  loadingResolve = resolve;
});

var ready = new Promise(function(resolve) {
  readyResolve = resolve;
});

function _postLoad() {
  loadingResolve();
}

var cachedGetPermissions;
function getPermissions() {
  if (!cachedGetPermissions) {
    cachedGetPermissions = Fb.api("/me/permissions").then(function(response) {
      if (!response.data) {
        return [];
      }
      return response.data
        .filter(function(entry) {
          return entry.status === "granted";
        })
        .map(function(entry) {
          return entry.permission;
        });
    }).then(function(data) {
      return data;
    });
  }
  return cachedGetPermissions;
}

function alwaysArray(stringOrArray) {
  return Array.isArray(stringOrArray) ? stringOrArray : stringOrArray ? [stringOrArray] : [];
}

function includesAll(set, subset) {
  return subset.every(function(subsetElement) {
    return set.indexOf(subsetElement) !== -1;
  });
}

/**
 * Fb class
 */
Fb = function() {};

/**
 * Our own methods
 */
ObjectAssign(Fb, {
  defaults: {
    appId: "",    // required, pass thru init() options
    cookie: true,
    oauth: true,
    status: true,
    xfbml: false
  },

  init: function(options) {
    options = ObjectAssign({}, Fb.defaults, options);
    loading.then(function() {
      FB.init(options);
      FB.Event.subscribe("auth.statusChange", function(response) {
        cachedGetPermissions = null;
        if (response.authResponse) {
          getPermissions();
        }
      });
      readyResolve();
    });
  },

  ready: ready,

  // Returns a promise that resolves if user has been granted all permissions, otherwise it rejects.
  hasPermission: function(permissions) {
    permissions = alwaysArray(permissions);
    return getPermissions().then(function(grantedPermissions) {
      if(!includesAll(grantedPermissions, permissions)) {
        return Promise.reject(new Error("Access denied"));
      }
      return Promise.resolve();
    });
  },

  // Returns a promise that resolves if permission is granted, otherwise it rejects.
  underPermission: function(permissions) {
    // Note Fb.hasPermission is already ready scoped.
    return Fb.hasPermission(permissions)
      .catch(function() {
        // User does NOT have such permission granted yet, ask for it
        return Fb.login({scope: permissions})
          .then(function() {
            return Fb.hasPermission(permissions);
          });
      });
  }
});

/**
 * Proxy FB methods
 */
ObjectAssign(Fb, {
  api: function(/*path[[, method], params]*/) {
    var args = [].slice.apply(arguments, [0]);
    return ready.then(function() {
      return new Promise(function(resolve, reject) {
        FB.api.apply(FB.api, args.concat(function(response) {
          if (!response || response.error) {
            reject(response.error);
            return;
          }
          resolve(response);
        }));
      });
    });
  },

  login: function(opts) {
    opts = opts || {};

    // Transform array opts.scope into comma separated list of scopes string.
    if (Array.isArray(opts.scope)) {
      opts = ObjectAssign({}, opts, {
        scope: opts.scope.join(",")
      });
    }

    return ready.then(function() {
      return new Promise(function(resolve) {
        FB.login(function(response) {
          cachedGetPermissions = null;
          resolve(response);
        }, opts);
      });
    });
  },

  ui: function(params) {
    return ready.then(function() {
      return new Promise(function(resolve) {
        FB.ui(params, function(response) {
          resolve(response);
        });
      });
    });
  }
});

// Proxy other FB methods:
["getLoginStatus", "logout"].forEach(function(method) {
  Fb[method] = function() {
    return ready.then(function() {
      return new Promise(function(resolve) {
        FB[method](function(response) {
          resolve(response);
        });
      });
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

module.exports = Fb;
