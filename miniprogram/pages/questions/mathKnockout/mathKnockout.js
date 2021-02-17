var db = wx.cloud.database();
var app = getApp();

Page({ // TODO: check hasAnswered
       // TODO: implement question image
       // TODO: allow image choices
       // TODO: implement short answer
       // TODO: check if user exists before allowing visiting page


  /**
   * 页面的初始数据
   */
  data: {
    timer: 121,
    timerDisplay: "2:00",
    score: 0,
    timerId: 0,
    question: {},
    choices: [],
    userChoice: -1,
    choiceDisplay: ["false", "false", "false", "false"],
    hasAnswered: false,
    disabled: true,
    unNextable: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //call 'login' cloud function
        app.globalData.openid = res.result.openid
      }
      })
    this.getQuestionData()
    console.log(app.globalData)
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
    // this.updateCards()
    this.startSetInter()
    console.log(this.userAnswered(this.data.question["_id"]))
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

  timeUp: function () { // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    var scoreVal = this.data.score
    console.log("time's up :D")
    console.log("your score: " + scoreVal)
  },

  getQuestionData: function() {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('question')
      .orderBy('uploadDate', 'desc') // descending order of 'totalCorrect' data of user
      .limit(1) 
      .get({
        success: function (res) {
          //store the ranking info locally in totalRanking
          //ranking info: array of user objects, in descending order of total answered correctly
          that.setData({
            question: res.data[0],
            choices: [res.data[0]["choice1"], res.data[0]["choice2"], res.data[0]["choice3"], res.data[0]["choice4"]]
          })
          console.log(that.data.question)         
        }
      })
  },

  submit: function () {
    var qId = this.data.question["_id"]
    var correct = this.data.choices[this.data.userChoice] == this.data.question['answer']
    if (!this.userAnswered(qId)) { 
      var disp = ["false", "false", "false", "false"]
      disp[this.data.userChoice] = "incorrect"
      disp[this.data.choices.indexOf(this.data.question['answer'])] = "correct"
      this.setData({
        choiceDisplay: disp,
        disabled: true,
        unNextable: false
      })
      addRecord(correct, qId)
    } else {
      this.setData({
        hasAnswered: true,
        unNextable: false
      })
    }
  },

  startSetInter: function () {
    if (this.data.timer > 0) {
      var time = this.data.timer - 1
      this.setData({ timer: time })
      var display = Math.floor(time / 60) + ":" + ("0" + (time % 60)).slice(-2)
      this.setData({ timerDisplay: display })
      this.setData({ timerId: setTimeout(this.startSetInter, 1000) })
    } else this.timeUp()
  },

  directNext: function() {

  },

  choose: function(e) {
    let c = e.currentTarget.dataset.choice

    var disp = ["false", "false", "false", "false"]
    disp[c] = "true"

    this.setData({
      userChoice: c,
      choiceDisplay: disp,
      disabled: false
    })

  },

  userAnswered: function(id) {
    var that = this
    db.collection('userInfo')
      .where({_openid: openid()})
      .get({
        success: function (res) {
          console.log("HERE")
          var questions = res.data[0]["record"]
          console.log(questions)
          var exists = false
          for (var i = 0; i < questions.length; i++) {
            if (questions[i]["questionID"] == id) {
              exists = true
              break
            }
          }
          if (exists) {
            that.setData({
              unNextable: false,
              hasAnswered: true
            })
          }
          return exists
        }
      })
  }

})

function addRecord(correct, id) {
  console.log(app.globalData.openid)
  db.collection('userInfo').where({
    _openid: app.globalData.openid
  }).update({
    data: {
      record: db.command.push({
        isCorrect: correct,
        questionID: id,
        answerTime: new Date()
      }),
      totalAnswer: db.command.inc(1),
      monthAnswer: db.command.inc(1),
      totalCorrect: db.command.inc(correct ? 1 : 0),
      monthCorrect: db.command.inc(correct ? 1 : 0)
    }
  })
}

function openid() {
  return app.globalData.openid
}


