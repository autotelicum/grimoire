(function() {

  window.parse = function(exp) {
    var expessions;
    exp = exp.replace(/;.*$/gm, "").replace(/^\s+|\s+$/g, "");
    if (isVariable(exp) || exp === '') return [exp];
    exp = exp.replace(/\'\(/g, "(list ").replace(/\'([^ ]+)/g, "(quote $1)").replace(/apply\s*(.+)\(list\s*([^)]+)\)/g, "$1 $2").replace(/\(/g, "[").replace(/\)/g, "]").replace(/\s+/g, ",");
    exp = "[" + exp + "]";
    expessions = eval(exp.replace(/([^,\[\]0-9]+?(?=(,|\])))/g, "'$1'"));
    return expessions.map(function(e) {
      if (isVariable(e)) {
        return e;
      } else {
        return JSArray2LispList(e);
      }
    });
  };

}).call(this);
