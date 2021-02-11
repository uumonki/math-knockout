// miniprogram/pages/questions/24points/24points.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cards: [0, 0, 0, 0],
    operations: ['+', '-', '*', '/', '(', ')'],
    expression: "",
    used: [false, false, false, false]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.updateCards()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  check: function (a, n) { // recursive function to check solvability
    if (n == 1) {
      if (Math.abs(a[0] - 24) < 1e-9) {
        return true
      } else return false
    }
    for (var i = 0; i < n; ++i) {
      for (var j = i + 1; j < n; ++j) {
        var t1 = a[i]
        var t2 = a[j]
        var b = [0, 0, 0, 0]
        var r = 0
        for (var k = 0; k < n; ++k) {
          if ((k != i) && (k != j)) b[r++] = a[k]
        }
        b[n-2] = t1 + t2
        if (this.check(b, n-1)) return true
        b[n-2] = t1 * t2
        if (this.check(b, n-1)) return true
        b[n-2] = t1 - t2
        if (this.check(b, n-1)) return true
        b[n-2] = t2 - t1
        if (this.check(b, n-1)) return true
        b[n-2] = t1 / t2
        if (this.check(b, n-1)) return true
        b[n-2] = t2 / t1
        if (this.check(b, n-1)) return true
      }
    }
    return false
  },

  solvable: function (x) { // call with array of 4 numbers to check solvability
    return this.check(x, 4)
  },

  generateDeck: function () {
    do {
      var deck = []
      for (var i = 0; i < 4; i++) deck.push(Math.ceil(Math.random() * 13))
    } while (!this.solvable(deck))
    return deck
  },

  updateCards: function() {
    this.setData({cards: this.generateDeck()})
  },

  submit: function() {
    try {
      var correct = (evaluate(this.data.expression) == 24)
    }
    catch (e) {
      console.log("stupid")
      return -1
    }
    if (correct && this.data.used == [true, true, true, true]) {
      this.updateCards()
      this.clear()
    }
    else console.log("incorrect")
  },

  selectNumber: function(e) {
    let i = e.currentTarget.dataset.index
    var disabled = this.data.used
    var exp = this.data.expression
    if ("1234567890".indexOf(exp.slice(-1)) <= -1 || exp == "") {
      disabled[i] = true
      this.setData({used: disabled})
      exp = exp + this.data.cards[i]
      this.setData({expression: exp})
    }
  },

  selectOperation: function(e) {
    let i = e.currentTarget.dataset.index
    var exp = this.data.expression
    if (i > 3 || "+-*/(".indexOf(exp.slice(-1)) <= -1) {
      exp = exp + this.data.operations[i]
      this.setData({expression: exp})
    }
  },

  clear: function() {
    this.setData({used: [false, false, false, false]})
    this.setData({expression: ""})
  }
})

// CODE TO EVALUATE EXPRESSIONS

function evaluate(str) {
  str = str.replace(/\s+/g, '')
  str = str.replace(/(\d)(\()/g, "$1*$2")
  return evalRpn(dal2Rpn(str))  
}

function isOperator(value) {
  var operatorString = "+-*/()";
  return operatorString.indexOf(value) > -1
}

function getPrioraty(value) {
  switch (value) {
      case '+':
      case '-':
          return 1;
      case '*':
      case '/':
          return 2;
      default:
          return 0;
  }
}

function prioraty(o1, o2) {
  return getPrioraty(o1) <= getPrioraty(o2);
}

function dal2Rpn(exp) {
  var inputStack = [];
  var outputStack = [];
  var outputQueue = [];
  let res = '';
  for (var i = 0, len = exp.length; i < len; i++) {
    var cur = exp[i];
    if (cur != ' ') {
      res = res + cur;
      if (i + 1 < exp.length) {
        if (isOperator(exp[i])) {
          inputStack.push(res);
          res = ''
        } else {
          if (isOperator(exp[i + 1])) {
            inputStack.push(res);
            res = ''
          }
        }
      } else {
        inputStack.push(res);
        res = ''
      }
    }
  }

  while (inputStack.length > 0) {
      var cur = inputStack.shift();
      if (isOperator(cur)) {
          if (cur == '(') {
              outputStack.push(cur);
          } else if (cur == ')') {
              var po = outputStack.pop();
              while (po != '(' && outputStack.length > 0) {
                  outputQueue.push(po);
                  po = outputStack.pop();
              }
              if (po != '(') {
                  throw "error: unmatched ()";
              }
          } else {
              while (prioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0) {
                  outputQueue.push(outputStack.pop());
              }
              outputStack.push(cur);
          }
      } else {
          outputQueue.push(new Number(cur));
      }
  }

  if (outputStack.length > 0) {
      if (outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '(') {
          throw "error: unmatched ()";
      }
      while (outputStack.length > 0) {
          outputQueue.push(outputStack.pop());
      }
  }

  return outputQueue;

}

function evalRpn(rpnQueue) {
  var outputStack = [];
  while (rpnQueue.length > 0) {
      var cur = rpnQueue.shift();

      if (!isOperator(cur)) {
          outputStack.push(cur);
      } else {
          if (outputStack.length < 2) {
              throw "unvalid stack length";
          }
          var sec = outputStack.pop();
          var fir = outputStack.pop();

          outputStack.push(getResult(fir, sec, cur));
      }
  }
  if (outputStack.length != 1) {
      throw "unvalid expression";
  } else {
      return outputStack[0];
  }
}
function getResult(first, second, operator) {
  var result = 0;
  switch (operator) {
      case '+':
          result = first + second;
          break;
      case '-':
          result = first - second;
          break;
      case '*':
          result = first * second;
          break;
      case '/':
          result = first / second;
          break;
      default:
          return 0;
  }

  //浮点数的小数位超过两位时，只保留两位小数点
  function formatFloat(f, digit) {
      //pow(10,n) 为 10 的 n 次方
      var m = Math.pow(10, digit);
      return parseInt(f * m, 10) / m;
  }
  return (formatFloat(result, 2));
}
