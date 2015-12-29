//global jQuery
var Demogram;

Demogram = (function () {
  var instance;

  function Demogram(config) {
    if (!(this instanceof Demogram)) {
      return new Demogram(config);
    }
    /**
     * Variable to store the configuration
     * @public
     */
    this.config = config || {
      db: {},
      demogram: "finance",
      slug: "index"
    };
    this.config.readOnly = this.config.readOnly || true;
    this.userId = "";
    this.editors = {};

    /**
     * Logout
     */
    this.logout = function() {
      this.config.db.unauth();
      window.location.reload();
    }
  }

  return {
    getInstance: function() {
      if (!instance) {
        return instance = Demogram.apply(null, arguments);
      }
      return instance;
    },
    login: function() {
      if (!instance) {
        this.getInstance();
      }
      instance.config.db.authWithOAuthPopup("google", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          window.location.reload();
        }
      }, {"remember": "sessionOnly", "scope": "email"});
    },
    checkAuth: function() {
      if (!instance) {
        this.getInstance();
      }
      var authData = instance.config.db.getAuth();
      if (authData !== null) {
        this.updateUserInfo(authData);
        this.setAuthCallback(authData);
      }
    },
    updateUserInfo: function(authData) {
      if (!instance) {
        this.getInstance();
      }
      instance.userId = authData.uid;
      instance.config.readOnly = (instance.userId !== "google:104351988139416907469");
      $("#loginButton").replaceWith("<p class=\"navbar-text\"><span aria-hidden=\"true\" class=\"glyphicon glyphicon-user\"></span> " + authData.google.displayName + " (<a id=\"logoutButton\" href=\"javascript:void(0)\">Logout</a>)</p>");
      $("#logoutButton").on("click", function (event) {
        instance.logout();
      });
    },
    setAuthCallback: function(authData) {
      if (!instance) {
        this.getInstance();
      }
      instance.config.db.child("users").child(authData.uid).on("value", function(snapshot) {
        if (snapshot.val() === null) {
          instance.config.db.onAuth(function(authData) {
            instance.config.db.child("users").child(authData.uid).set({
              name: authData.google.displayName,
              email: authData.google.email
            });
          });
        }
      }, function(error) {
        // do nothing
      });
    },
    loadCodeEditor: function(elm) {
      var $codeContainer,
        codeId,
        loaded,
        slug;

      if (!instance) {
        this.getInstance();
      }
      $codeContainer = $(elm);
      codeId = $codeContainer.data("code-id");
      slug = $codeContainer.data("slug") || "false";
      loaded = $codeContainer.data("loaded") || "false";

      if (loaded === "false") {
        this.loadCode($codeContainer, codeId, slug);
        $(elm).data("loaded", "true");
      }
    },
    loadCode: function($codeContainer, codeId, slug) {
      var query;

      if (!instance) {
        this.getInstance();
      }
      query = (slug === "false" ? instance.config.db.child(instance.config.demogram) : instance.config.db.child(instance.config.demogram).child(instance.config.slug));
      query.on("value", function(snapshot) {
        var code,
          $textArea,
          editor;

        code = snapshot.val()[codeId];
        $textArea = $("#" + codeId);
        editor = instance.editors[codeId];

        if (typeof editor !== "undefined") {
          if ($textArea.val() !== code) {
            $textArea.val(code);
            editor.setValue(code);
          }
        } else {
          $textArea.val(code);
          instance.editors[codeId] = CodeMirror.fromTextArea(document.getElementById(codeId), {
            mode: "xml",
            htmlMode: true,
            theme: "material",
            styleActiveLine: true,
            lineNumbers: true,
            readOnly: instance.config.readOnly
          });
        }

        editor = instance.editors[codeId];
        editor.on("change", function(editor, changes) {
          editor.save();
          query.child(codeId).set(editor.getTextArea().value);
        });
      }, function(errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
      if ($codeContainer.hasClass("in")) {
        editor.refresh();
      }
    },
    refreshCodeEditor: function(elm) {
      var codeId;

      if (!instance) {
        this.getInstance();
      }
      codeId = $(elm).data("code-id");
      if (typeof instance.editors[codeId] !== "undefined") {
        instance.editors[codeId].refresh();
      }
    }
  }
})();

(function($) {
  var $editors;

  // Demogram Features
  $("#loginButton").on("click", function(event) {
    Demogram.login();
  });
  $editors = $(".codeContainer");
  $editors.on("show.bs.collapse", function(event) {
    Demogram.loadCodeEditor(event.target);
  });
  $editors.on("shown.bs.collapse", function(event) {
    Demogram.refreshCodeEditor(event.target);
  });

  $(".codeContainer form").on("submit", function(event) {
    event.preventDefault();
    console.log($(event.target).serialize());
  });

  // Demo itself features
  $("#loginForm").on("submit", function(event) {
    event.preventDefault();
    console.log("Login Form Submitted");
  });

})(jQuery);
