//global jQuery
var Demogram = (function () {
  var instance;

  function Demogram (config) {
    if (!(this instanceof Demogram)) {
      return new Demogram(config);
    }
    /**
     * Variable to store the configuration
     * @public
     */
    this.config = config || {
      db: {},
      slug: "index"
    };
    this.config.readOnly = this.config.readOnly || true;
    this.userId = "";
    this.editors = {};
  }

  return {
    getInstance: function () {
      if (!instance) {
        return instance = Demogram.apply(null, arguments);
      }
      return instance;
    },
    login: function () {
      if (!instance) {
        this.getInstance();
      }
      function authHandler(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
        } else {
          instance.updateUserInfo(authData);
        }
      }
      instance.config.db.authWithOAuthPopup("google", authHandler);
    },
    checkAuth: function () {
      if (!instance) {
        this.getInstance();
      }
      var authData = instance.config.db.getAuth();
      if (authData !== null) {
        this.updateUserInfo(authData);
      }
    },
    updateUserInfo: function (authData) {
      if (!instance) {
        this.getInstance();
      }
      instance.userId = authData.uid;
      instance.config.readOnly = (instance.userId !== "google:104351988139416907469");
      $("#loginButton").replaceWith("<p class=\"navbar-text\"><span aria-hidden=\"true\" class=\"glyphicon glyphicon-user\"></span> " + authData.google.displayName + "</p>");
    },
    loadCodeEditor: function (elm) {
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
    loadCode: function ($codeContainer, codeId, slug) {
      var query;

      if (!instance) {
        this.getInstance();
      }
      query = (slug === "false" ? instance.config.db : instance.config.db.child(instance.config.slug));
      query.on("value", function(snapshot) {
        var code;

        code = snapshot.val();
        $("#" + codeId).val(code[codeId]);

        instance.editors[codeId] = CodeMirror.fromTextArea(document.getElementById(codeId), {
          mode: "xml",
          htmlMode: true,
          theme: "material",
          styleActiveLine: true,
          lineNumbers: true,
          readOnly: instance.config.readOnly
        });

        if ($codeContainer.hasClass("in")) {
          instance.editors[codeId].refresh();
        }
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    },
    refreshCodeEditor: function (elm) {
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
  $("#loginButton").on("click", function (event) {
    Demogram.login();
  });
  $editors = $(".codeContainer");
  $editors.on("show.bs.collapse", function (event) {
    Demogram.loadCodeEditor(event.target);
  });
  $editors.on("shown.bs.collapse", function (event) {
    Demogram.refreshCodeEditor(event.target);
  });

  // Demo itself features
  $("#loginForm").submit(function(event) {
    event.preventDefault();
    alert("Submitted!");
  });

})(jQuery);
