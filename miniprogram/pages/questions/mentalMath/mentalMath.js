Page({

  /**
   * 页面的初始数据
   */
  data: {
    exp: "",
    ans: "",
    error: "",
    inputVal: "",
    inputFocus: true,
    timer: 121,
    timerDisplay: "2:00",
    score: 0,
    timerId: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    clearTimeout(this.data.timerId)
    this.setData({ timer: 121 })
    this.setData({ timerDisplay: "2:00" })
    this.setData({ score: 0 })
    this.generateExpression()
    this.startSetInter()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearTimeout(this.data.timerId)
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

  timeUp: function(){ // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    var scoreVal = this.data.score
    console.log("time's up :D")
    console.log("your score: " + scoreVal)
  },

  generateExpression: function() {
    var weights = this.data.weights
    var selection = Math.random()
    var expression

    if (selection < 0.3) expression = this.generateAddition()
    else if (selection < 0.6) expression = this.generateSubtraction()
    else if (selection < 0.85) expression = this.generateMultiplication()
    else expression = this.generateDivision()

    this.setData({ans: evaluate(expression)})
    console.log(this.data.ans)
    
    expression = expression.replace("-", "−").replace("*", "×").replace("/", "÷")
    this.setData({exp: expression})
  },

  generateAddition: function() {
    var num1, num2
    if (Math.random() < 0.5) { 
      num1 = randInt(1000, 4999)
      num2 = randInt(10, 999)
    } else {
      if (Math.random() < 0.6) {
        num1 = randInt(100, 999)
        num2 = randInt(10, 999) 
      } else {
        var n1 = randInt(1, 3)
        var n2 = randInt(1, 2)
        num1 = (randInt(100, 999) / (10 ** n1)).toFixed(n1)
        num2 = (randInt(10, 999) / (10 ** n2)).toFixed(n2)
      }
    }
    [num1, num2] = shuffle([num1, num2])
    return num1 + " + " + num2
  },

  generateSubtraction: function() {
    var num1 = randInt(100, 999)
    var num2
    if (Math.random() < 0.5) {
      num2 = randInt(100, 999)
    } else {
      num2 = randInt(10, 99)
    }
    if (Math.random() < 0.2) {
      var n = randInt(1, 2)
      num1 = (num1 / (10 ** n)).toFixed(n)
      num2 = (num2 / (10 ** n)).toFixed(n)
    }
    [num1, num2] = [num1, num2].sort((a, b) => b - a)
    return num1 + " - " + num2
  },

  generateMultiplication: function() {
    var num1 = randInt(11, 149)
    var num2 = randInt(2, 10)
    if (Math.random() < 0.8) {
      var n1 = randInt(0, 2)
      var n2 = randInt(0, 1)
      num1 = (num1 / (10 ** n1)).toFixed(n1)
      num2 = (num2 / (10 ** n2)).toFixed(n2)
    }
    [num1, num2] = shuffle([num1, num2])
    return num1 + " * " + num2
  },

  generateDivision: function() {
    var num1 = randInt(10, 99)
    var ans = randInt(2, 9)
    var num2 = num1 * ans
    if (Math.random() < 0.2) {
      var n1 = randInt(0, 1)
      var n2 = randInt(0, 1)
      num1 = (num1 / (10 ** n1)).toFixed(n1)
      num2 = (num2 / (10 ** n2)).toFixed(n2)
    }
    return num2 + " / " + num1
  },

  submitInput: function(data) {
    this.setData({error: ""})
    var input = data.detail.value.ans
    if (Math.abs(parseFloat(input) - this.data.ans) < 0.001) {
      this.generateExpression()
      if (this.data.timer > 0) this.setData({score: this.data.score+1})
      this.clear()
    }
    else {
      this.setData({error: "error"})
      this.clear()
    }
  },

  clear: function() {
    this.setData({inputVal: ""})
  },

  startSetInter: function(){
    if (this.data.timer > 0) {
      var time = this.data.timer - 1
      this.setData({timer: time})
      var display = Math.floor(time/60) + ":" + ("0" + (time % 60)).slice(-2)
      this.setData({timerDisplay: display})
      this.setData({ timerId: setTimeout(this.startSetInter, 1000) })
    } else this.timeUp()
  },

  focus: function() {
    this.setData({inputFocus: true})
  }

})

// CODE TO EVALUATE EXPRESSIONS

function evaluate(str) {
  str = str.replace(/\s+/g, '')
  str = str.replace(/(\d)(\()/g, "$1*$2")
  str = str.replace(/\)\(/g, ")*(")
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
  return (formatFloat(result, 4));
}

function randInt(min, max) { // returns random integer between min and max inclusive
  return Math.floor(Math.random() * (max + 1 - min) + min)
}  

function shuffle(arr) { // shuffles 2 number arrays
  if (Math.random() < 0.5) return [arr[0], arr[1]]
  return [arr[1], arr[0]]
}
