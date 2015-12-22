var db;

db = new Firebase("https://demogram.firebaseio.com/finance/index/");

(function() {
  var headerCodeEditor,
    contentCodeEditor;

  (function($) {
    $("#loginForm").submit(function(event) {
      event.preventDefault();
      alert("Submitted!");
    });
  })(jQuery);

  $("#headerCodeContainer").on("shown.bs.collapse", function (event) {
    var loaded = $(event.target).data("loaded") || "false";
    if (loaded === "false") {
//      function authHandler(error, authData) {
//        if (error) {
//          console.log("Login Failed!", error);
//        } else {
//          console.log("Authenticated successfully with payload:", authData);
//        }
//      }
//      db.authWithOAuthPopup("google", authHandler);

      db.on("value", function(snapshot) {
        var code = snapshot.val();
        $("#headerCode").val(code.headerCode);
        headerCodeEditor = CodeMirror.fromTextArea(document.getElementById("headerCode"), {
          mode: "text/html",
          theme: "material",
          styleActiveLine: true,
          lineNumbers: true
        });
        headerCodeEditor.refresh();
        $(event.target).data("loaded", "true");
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
  });

  $("#contentCodeContainer").on("shown.bs.collapse", function (event) {
    var loaded = $(event.target).data("loaded") || "false";
    if (loaded === "false") {
      db.on("value", function(snapshot) {
        var code = snapshot.val();
        $("#contentCode").val(code.contentCode);
        contentCodeEditor = CodeMirror.fromTextArea(document.getElementById("contentCode"), {
          mode: "text/html",
          theme: "material",
          styleActiveLine: true,
          lineNumbers: true,
          readOnly: false
        });
        contentCodeEditor.refresh();
        $(event.target).data("loaded", "true");
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }
  });
}).call(this);
