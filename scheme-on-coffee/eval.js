(function() {
  var extend,
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  this.LispMachine = {
    eval: function(exp, env) {
      if (isSelfEvaluating(exp)) return exp;
      if (isVariable(exp)) return lookupVariableValue(exp, env);
      if (isQuoted(exp)) return textOfQuotation(exp);
      if (isAssignment(exp)) return evalAssignment(exp, env);
      if (isDefinition(exp)) return evalDefinition(exp, env);
      if (isIf(exp)) return evalIf(exp, env);
      if (isLambda(exp)) {
        return makeProcedure(lambdaParameters(exp), lambdaBody(exp), env);
      }
      if (isBegin(exp)) return evalSequence(beginActions(exp), env);
      if (isCond(exp)) return LispMachine.eval(condToIf(exp), env);
      if (isLet(exp)) {
        return LispMachine.apply(LispMachine.eval(letToLambda(exp), env), letValues(exp, env));
      }
      if (isApplication(exp)) {
        return LispMachine.apply(LispMachine.eval(operator(exp), env), listOfValues(operands(exp), env));
      }
      throw "Unknown expression type -- LispMachine.eval: " + exp;
    },
    apply: function(procedure, arguments) {
      if (isPrimitiveProcedure(procedure)) {
        return applyPrimitiveProcedure(procedure, arguments);
      }
      if (isCompoundProcedure(procedure)) {
        return evalSequence(procedureBody(procedure), extendEnvironment(procedureParameters(procedure), arguments, procedureEnvironment(procedure)));
      }
      throw "Unknown procedure type -- apply: " + procedure;
    }
  };

  extend = function(object, module) {
    var k;
    for (k in module) {
      if (!__hasProp.call(module, k)) continue;
      object[k] = module[k];
    }
    return object;
  };

  extend(this, {
    listOfValues: function(exps, env) {
      if (noOperands(exps)) return null;
      return cons(LispMachine.eval(firstOperand(exps), env), listOfValues(restOperands(exps), env));
    },
    evalIf: function(exp, env) {
      if (LispMachine.eval(ifPredicate(exp), env)) {
        return LispMachine.eval(ifConsequent(exp), env);
      }
      return LispMachine.eval(ifAlternative(exp), env);
    },
    evalSequence: function(exps, env) {
      if (isLastExp(exps)) return LispMachine.eval(firstExp(exps), env);
      LispMachine.eval(firstExp(exps), env);
      return evalSequence(restExps(exps), env);
    },
    evalAssignment: function(exp, env) {
      return setVariableValue(assignmentVariable(exp), LispMachine.eval(assignmentValue(exp), env), env);
    },
    evalDefinition: function(exp, env) {
      return defineVariable(definitionVariable(exp), LispMachine.eval(definitionValue(exp), env), env);
    }
  });

  extend(this, {
    isSelfEvaluating: function(exp) {
      if (isNumber(exp)) return true;
      return false;
    },
    isNumber: function(exp) {
      return !isNaN(Number(exp));
    },
    isString: function(exp) {
      return typeof exp === "string";
    },
    isVariable: function(exp) {
      return isSymbol(exp);
    },
    isSymbol: function(exp) {
      return /^([a-z-A-Z0-9_$?!+*/=><\-]|>=|<=)+$/.test(exp);
    },
    isQuoted: function(exp) {
      return isTaggedList(exp, 'quote');
    },
    textOfQuotation: function(exp) {
      return cadr(exp);
    },
    isTaggedList: function(exp, tag) {
      var testTypeTag;
      if (!isPair(exp)) return false;
      testTypeTag = function(x) {
        return eq(car(exp), x);
      };
      if (tag instanceof Array) return tag.some(testTypeTag);
      return testTypeTag(tag);
    },
    isPair: function(o) {
      return o instanceof Array && o.length === 2;
    },
    cons: function(x, y) {
      return [x, y];
    },
    car: function(p) {
      return p[0];
    },
    cdr: function(p) {
      return p[1];
    },
    cadr: function(o) {
      return car(cdr(o));
    },
    caadr: function(o) {
      return car(car(cdr(o)));
    },
    caddr: function(o) {
      return car(cdr(cdr(o)));
    },
    cdadr: function(o) {
      return cdr(car(cdr(o)));
    },
    cddr: function(o) {
      return cdr(cdr(o));
    },
    cdddr: function(o) {
      return cdr(cdr(cdr(o)));
    },
    cadddr: function(o) {
      return car(cdr(cdr(cdr(o))));
    },
    eq: function(x, y) {
      return x === y;
    },
    list: function() {
      var items;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return items.reduceRight(function(y, x) {
        return [x, y];
      }, null);
    },
    JSArray2LispList: function(array) {
      return array.reduceRight((function(y, x) {
        if (x instanceof Array) {
          return cons(JSArray2LispList(x), y);
        } else {
          return cons(x, y);
        }
      }), null);
    },
    LispList2JSArray: function(list) {
      var currentCar, retVal;
      retVal = [];
      while (list) {
        currentCar = car(list);
        retVal.push(isPair(currentCar) ? LispList2JSArray(currentCar) : currentCar);
        list = cdr(list);
      }
      return retVal;
    },
    isAssignment: function(exp) {
      return isTaggedList(exp, 'set!');
    },
    assignmentVariable: function(exp) {
      return cadr(exp);
    },
    assignmentValue: function(exp) {
      return caddr(exp);
    },
    isDefinition: function(exp) {
      return isTaggedList(exp, ['define', 'setf']);
    },
    definitionVariable: function(exp) {
      if (isSymbol(cadr(exp))) return cadr(exp);
      return caadr(exp);
    },
    definitionValue: function(exp) {
      if (isSymbol(cadr(exp))) return caddr(exp);
      return makeLambda(cdadr(exp), cddr(exp));
    },
    isLambda: function(exp) {
      return isTaggedList(exp, 'lambda');
    },
    lambdaParameters: function(exp) {
      return cadr(exp);
    },
    lambdaBody: function(exp) {
      return cddr(exp);
    },
    makeLambda: function(parameters, body) {
      return cons('lambda', cons(parameters, body));
    },
    isIf: function(exp) {
      return isTaggedList(exp, 'if');
    },
    ifPredicate: function(exp) {
      return cadr(exp);
    },
    ifConsequent: function(exp) {
      return caddr(exp);
    },
    ifAlternative: function(exp) {
      if (cdddr(exp) !== null) return cadddr(exp);
      return false;
    },
    makeIf: function(predicate, consequent, alternative) {
      return list('if', predicate, consequent, alternative);
    },
    isBegin: function(exp) {
      return isTaggedList(exp, 'begin');
    },
    beginActions: function(exp) {
      return cdr(exp);
    },
    isLastExp: function(seq) {
      return cdr(seq) === null;
    },
    firstExp: function(seq) {
      return car(seq);
    },
    restExps: function(seq) {
      return cdr(seq);
    },
    sequenceExp: function(seq) {
      if (seq === null) return seq;
      if (isLastExp(seq)) return firstExp(seq);
      return makeBegin(seq);
    },
    makeBegin: function(seq) {
      return cons('begin', seq);
    },
    isApplication: function(exp) {
      return isPair(exp);
    },
    operator: function(exp) {
      return car(exp);
    },
    operands: function(exp) {
      return cdr(exp);
    },
    noOperands: function(ops) {
      return ops === null;
    },
    firstOperand: function(ops) {
      return car(ops);
    },
    restOperands: function(ops) {
      return cdr(ops);
    },
    isCond: function(exp) {
      return isTaggedList(exp, 'cond');
    },
    condClauses: function(exp) {
      return cdr(exp);
    },
    isCondElseClause: function(clause) {
      return eq(condPredicate(clause), 'else');
    },
    condPredicate: function(clause) {
      return car(clause);
    },
    condActions: function(clause) {
      return cdr(clause);
    },
    condToIf: function(exp) {
      return expandClauses(condClauses(exp));
    },
    expandClauses: function(clauses) {
      var first, rest;
      if (clauses === null) return false;
      first = car(clauses);
      rest = cdr(clauses);
      if (isCondElseClause(first)) {
        if (rest === !null) throw "ELSE clause isn't last -- COND->IF: " + clauses;
        return sequenceExp(condActions(first));
      }
      return makeIf(condPredicate(first), sequenceExp(condActions(first)), expandClauses(rest));
    },
    isLet: function(exp) {
      return isTaggedList(exp, 'let');
    },
    letBindings: function(exp) {
      return cadr(exp);
    },
    letVars: function(exp) {
      return map(car, letBindings(exp));
    },
    letValues: function(exp, env) {
      return map(function(binding) {
        return LispMachine.eval(cadr(binding), env);
      }, letBindings(exp));
    },
    letBody: function(exp) {
      return cddr(exp);
    },
    letToLambda: function(exp) {
      return makeLambda(letVars(exp), letBody(exp));
    }
  });

  extend(this, {
    isTrue: function(x) {
      return !eq(x, false);
    },
    isFalse: function(x) {
      return eq(x, false);
    },
    makeProcedure: function(parameters, body, env) {
      var procedureObject;
      procedureObject = list('procedure', parameters, body);
      procedureObject.environment = env;
      return procedureObject;
    },
    isCompoundProcedure: function(p) {
      return isTaggedList(p, 'procedure');
    },
    procedureParameters: function(p) {
      return cadr(p);
    },
    procedureBody: function(p) {
      return caddr(p);
    },
    procedureEnvironment: function(p) {
      return p.environment;
    },
    enclosingEnvironment: function(env) {
      return cdr(env);
    },
    firstFrame: function(env) {
      return car(env);
    },
    TheEmptyEnvironment: [],
    makeFrame: function(variables, values) {
      return cons(variables, values);
    },
    frameVariables: function(frame) {
      return car(frame);
    },
    frameValues: function(frame) {
      return cdr(frame);
    },
    addBindingToFrame: function(variable, val, frame) {
      setCar(frame, cons(variable, car(frame)));
      return setCdr(frame, cons(val, cdr(frame)));
    },
    setCar: function(p, v) {
      return p[0] = v;
    },
    setCdr: function(p, v) {
      return p[1] = v;
    },
    extendEnvironment: function(vars, vals, baseEnv) {
      if (vars.length !== vals.length) {
        throw "Count of vars and vals is not the same: " + vars + ", " + vals;
      }
      return cons(makeFrame(vars, vals), baseEnv);
    },
    lookupVariableValue: function(variable, env) {
      var envLoop;
      envLoop = function(env) {
        var frame, scan;
        scan = function(vars, vals) {
          if (vars === null) return envLoop(enclosingEnvironment(env));
          if (car(vars) === variable) return car(vals);
          return scan(cdr(vars), cdr(vals));
        };
        if (eq(env, TheEmptyEnvironment)) {
          return "Error: Unbound variable: \"" + variable + "\"";
        }
        frame = firstFrame(env);
        return scan(frameVariables(frame), frameValues(frame));
      };
      return envLoop(env);
    },
    setVariableValue: function(variable, val, env) {
      var envLoop;
      envLoop = function(env) {
        var frame, scan;
        scan = function(vars, vals) {
          if (vars === null) return envLoop(enclosingEnvironment(env));
          if (eq(variable, car(vars))) return setCar(vals, val);
          return scan(cdr(vars), cdr(vals));
        };
        if (eq(env, TheEmptyEnvironment)) {
          throw "Unbound variable -- SET: \"" + variable + "\"";
        }
        frame = firstFrame(env);
        return scan(frameVariables(frame), frameValues(frame));
      };
      return envLoop(env);
    },
    defineVariable: function(variable, val, env) {
      var frame, scan;
      frame = firstFrame(env);
      scan = function(vars, vals) {
        if (vars === null) {
          addBindingToFrame(variable, val, frame);
          return (val && isCompoundProcedure(val) ? "ok" : val);
        }
        if (eq(variable, car(vars))) {
          setCar(vals, val);
          return (val && isCompoundProcedure(val) ? "ok" : val);
        }
        return scan(cdr(vars), cdr(vals));
      };
      return scan(frameVariables(frame), frameValues(frame));
    }
  });

  extend(this, {
    setupEnvironment: function() {
      var initialEnv;
      initialEnv = extendEnvironment(primitiveProcedureNames, primitiveProcedureObjects, TheEmptyEnvironment);
      defineVariable('true', true, initialEnv);
      defineVariable('false', false, initialEnv);
      defineVariable('null', null, initialEnv);
      defineVariable('nil', null, initialEnv);
      execute("      (define (map proc items)        (if (null? items)            nil            (cons (proc (car items))                  (map proc (cdr items)))))    ", initialEnv);
      return initialEnv;
    }
  });

  this.map = function(proc, items) {
    if (items === null) return null;
    return cons(proc(car(items)), map(proc, cdr(items)));
  };

  extend(this, {
    isPrimitiveProcedure: function(proc) {
      return isTaggedList(proc, 'primitive');
    },
    primitiveImplementation: function(proc) {
      return cadr(proc);
    },
    primitiveProcedures: list(list('car', car), list('cdr', cdr), list('cons', cons), list('list', list), list('list-ref', function(l, i) {
      return l[i];
    }), list('length', function(items) {
      return items.length;
    }), list('append', function(x, y) {
      return JSArray2LispList(x.concat(y));
    }), list('reverse', function(x) {
      return JSArray2LispList(x.reverse());
    }), list('true?', isTrue), list('false?', isFalse), list('pair?', isPair), list('null?', function(x) {
      return x === null;
    }), list('=', eq), list('eq', eq), list('>', function(x, y) {
      return x > y;
    }), list('>=', function(x, y) {
      return x >= y;
    }), list('<', function(x, y) {
      return x < y;
    }), list('<=', function(x, y) {
      return x <= y;
    }), list('+', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return args.reduce(function(a, b) {
        return a + b;
      });
    }), list('*', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return args.reduce(function(a, b) {
        return a * b;
      });
    }), list('min', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Math.min.apply(Math, args);
    }), list('max', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return Math.max.apply(Math, args);
    }), list('abs', function(x) {
      if (x > 0) {
        return x;
      } else {
        return -x;
      }
    }), list('-', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) return -args[0];
      return args.reduce(function(a, b) {
        return a - b;
      });
    }), list('/', function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) return 1 / args[0];
      return args.reduce(function(a, b) {
        return a / b;
      });
    }))
  });

  this.primitiveProcedureNames = map(car, primitiveProcedures);

  this.primitiveProcedureObjects = map((function(proc) {
    return list('primitive', cadr(proc));
  }), primitiveProcedures);

  extend(this, {
    applyPrimitiveProcedure: function(proc, args) {
      var applyArgs, applyProc;
      applyProc = primitiveImplementation(proc);
      if (applyProc === car || applyProc === cdr) {
        applyArgs = args;
      } else if (applyProc === cons) {
        applyArgs = cons(car(args), cadr(args));
      } else {
        applyArgs = LispList2JSArray(args);
      }
      return primitiveImplementation(proc).apply(null, applyArgs);
    },
    inputPrompt: ";;; Coffee-Lisp-Eval input:",
    outputPrompt: ";;; Coffee-Lisp-Eval value:",
    driverLoop: function(input) {
      var output;
      if (!input) return 'no input';
      output = LispMachine.eval(parse(input), TheGlobalEnvironment);
      userPrint(output);
      return output;
    },
    execute: function(input, env) {
      var expressions, output;
      if (!input) return 'no input';
      expressions = parse(input);
      output = null;
      if (env == null) env = TheGlobalEnvironment;
      expressions.forEach(function(exp) {
        return output = LispMachine.eval(exp, env);
      });
      if (output && car(output) === "procedure") {
        if (isVariable(input)) {
          return "&lt;#procedure \"" + input + "\"&gt;";
        } else {
          return "&lt;#anonymous procedure&gt;";
        }
      }
      if (isPair(output)) {
        if (isPair(cdr(output))) {
          return "(" + (LispList2JSArray(output).join(' ')) + ")";
        } else {
          return "(" + (output.join(' . ')) + ")";
        }
      }
      return output;
    },
    promptForInput: function(string) {
      return console.log(string);
    },
    announceOutput: function(string) {
      return console.log(string);
    },
    userPrint: function(object) {
      if (isCompoundProcedure(object)) {
        return console.log(list('compound-procedure', procedureParameters(object), procedureBody(object), '<procedure-env>'));
      }
      return console.log(object);
    }
  });

  this.LispMachine.interpretationalEval = this.LispMachine.eval;

  this.LispMachine.eval = function(exp, env) {
    var executionProcedure;
    executionProcedure = analyze(exp);
    return executionProcedure(env);
  };

  extend(this, {
    analyze: function(exp) {
      if (isSelfEvaluating(exp)) return analyzeSelfEvaluating(exp);
      if (isQuoted(exp)) return analyzeQuoted(exp);
      if (isVariable(exp)) return analyzeVariable(exp);
      if (isAssignment(exp)) return analyzeAssignment(exp);
      if (isDefinition(exp)) return analyzeDefinition(exp);
      if (isIf(exp)) return analyzeIf(exp);
      if (isLambda(exp)) return analyzeLambda(exp);
      if (isLet(exp)) return analyzeLet(analyzeLambda(letToLambda(exp)), exp);
      if (isBegin(exp)) return analyzeSequence(beginActions(exp));
      if (isCond(exp)) return analyze(condToIf(exp));
      if (isApplication(exp)) return analyzeApplication(exp);
      throw "Unknown expression type -- ANALYZE " + exp;
    },
    analyzeSelfEvaluating: function(exp) {
      return function(env) {
        return exp;
      };
    },
    analyzeQuoted: function(exp) {
      var quotedValue;
      quotedValue = textOfQuotation(exp);
      return function(env) {
        return quotedValue;
      };
    },
    analyzeVariable: function(exp) {
      return function(env) {
        return lookupVariableValue(exp, env);
      };
    },
    analyzeAssignment: function(exp) {
      var valueProc, variable;
      variable = assignmentVariable(exp);
      valueProc = analyze(assignmentValue(exp));
      return function(env) {
        setVariableValue(variable, valueProc(env), env);
        return "ok";
      };
    },
    analyzeDefinition: function(exp) {
      var valueProc, variable;
      variable = definitionVariable(exp);
      valueProc = analyze(definitionValue(exp));
      return function(env) {
        defineVariable(variable, valueProc(env), env);
        return "ok";
      };
    },
    analyzeIf: function(exp) {
      var alternativeProc, consequentProc, predicateProc;
      predicateProc = analyze(ifPredicate(exp));
      consequentProc = analyze(ifConsequent(exp));
      alternativeProc = analyze(ifAlternative(exp));
      return function(env) {
        if (predicateProc(env) === true) return consequentProc(env);
        return alternativeProc(env);
      };
    },
    analyzeLambda: function(exp) {
      var bodyProc, vars;
      vars = lambdaParameters(exp);
      bodyProc = analyzeSequence(lambdaBody(exp));
      return function(env) {
        return makeProcedure(vars, bodyProc, env);
      };
    },
    analyzeSequence: function(exps) {
      var procs, sequenceLoop, sequentially;
      sequentially = function(proc1, proc2) {
        return function(env) {
          proc1(env);
          return proc2(env);
        };
      };
      sequenceLoop = function(firstProc, restProcs) {
        if (restProcs === null) return firstProc;
        return sequenceLoop(sequentially(firstProc, car(restProcs)), cdr(restProcs));
      };
      procs = map(analyze, exps);
      if (procs === null) throw "Empty sequence -- ANALYZE";
      return sequenceLoop(car(procs), cdr(procs));
    },
    analyzeApplication: function(exp) {
      var getOperatorProc, operandProcs;
      getOperatorProc = analyze(operator(exp));
      operandProcs = map(analyze, operands(exp));
      return function(env) {
        return executeApplication(getOperatorProc(env), map((function(operandProc) {
          return operandProc(env);
        }), operandProcs));
      };
    },
    executeApplication: function(proc, args) {
      var code;
      if (isPrimitiveProcedure(proc)) return applyPrimitiveProcedure(proc, args);
      if (isCompoundProcedure(proc)) {
        code = procedureBody(proc);
        return code(extendEnvironment(procedureParameters(proc), args, procedureEnvironment(proc)));
      }
      throw "Unknown procedure type -- EXECUTE-APPLICATION " + proc;
    },
    analyzeLet: function(lambda, exp) {
      return function(env) {
        var letVals;
        return executeApplication(lambda(env), letVals = letValues(exp, env));
      };
    }
  });

  this.TheGlobalEnvironment = setupEnvironment();

  this.global = TheGlobalEnvironment;

  this.empty = TheEmptyEnvironment;

  this.G = TheGlobalEnvironment;

  this.E = TheEmptyEnvironment;

}).call(this);
