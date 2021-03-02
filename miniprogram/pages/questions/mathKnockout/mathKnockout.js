var db = wx.cloud.database();
var app = getApp();

Page({ 
       // TODO: allow image choices (?)
       // TODO: implement short answer
       // TODO: check if user exists before allowing visiting page (!!!)

  data: {
    //page data
    timer: 31, 
    timerDisplay: "0:30",
    timerId: 0,
    questions: [],    // array of all questions
    choicesList: [],  // list of all question choices
    questionIndex: 0, // current q user is on
    question: {},     // current q displayed
    choices: [],      // current choices displayed
    userChoice: -1,   // user choice, -1 if not chosen
    choiceDisplay: ["false", "false", "false", "false"], // controls display
    qIds: [],         // array of all q ids
    disabled: true,   // whether submit button available
    unNextable: true, // if true: NEXT is grayed out and SUBMIT is visible, vice versa
    type: "",
    title: "",
    imgWidth: "width: 100%",
  },

  onLoad: function (options) {
    let that = this
    wx.cloud.callFunction({ // get openid
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
      }
      })

    var qType = options.type // differentiate question type, update title
    var pageTitle
    switch (qType) {
      case "concept":
        pageTitle = "概念"
        break
      case "geometry":
        pageTitle = "几何"
        break
    }
    this.setData({
      type: qType,
      title: pageTitle
    })
   
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    wx.cloud.callFunction({ // fetch all questions
      name: 'getQuestions',
      data: {type: qType},
      success: res => {
        var qData = res.result.data
        db.collection('userInfo')
          .where({_openid: app.globalData.openid})
          .get({
            success: function (res2) {
              var exists = that.checkRecord(res2, qData[0]._id)
              if (exists) clearTimeout(that.data.timerId)
              that.setData({
                unNextable: !exists
              })
            }
          })
          that.setData({    // write in question data
            questions: qData,
            question: qData[0],
            img: qData[0].imgUrl,
            imgWidth: (typeof qData[0].imgUrl === 'undefined') ? 'height: 0; width: 0' : 'width: 100%',
            choicesList: qData.map((a) => [a.choice1, a.choice2, a.choice3, a.choice4]),
            choices: [qData[0].choice1, qData[0].choice2, qData[0].choice3, qData[0].choice4],
            qIds: qData.map((a) => a._id),
          })
      }
    })
  },

  onShow: function () {
    clearTimeout(this.data.timerId)
    this.setData({ timer: 31 })
    this.setData({ timerDisplay: "0:30" })
    this.startSetInter()
  },

  onHide: function () {
    clearTimeout(this.data.timerId)
    if (this.data.unNextable)
      addRecord(false, this.data.question._id, this.data.question.title)
  },

  onUnload: function () {
    clearTimeout(this.data.timerId)
    if (this.data.unNextable)
      addRecord(false, this.data.question._id, this.data.question.title)
  },


  timeUp: function () { // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    clearTimeout(this.data.timerId)
    this.setData({timer: 30})
    var that = this
    wx.showModal({
      title: '时间到',
      content: this.submit(true), //提示内容
      showCancel: false,
    })
  },

  submit: function (skip) {
    let that = this
    if (this.data.userChoice > -1 || skip) { // check if anything chosen or if time is up
      clearTimeout(this.data.timerId)
      var qId = this.data.question._id
      var correct = this.data.choices[this.data.userChoice] === this.data.question.answer // check answer correct
      this.setData({unNextable: false})
      db.collection('userInfo') // check again if user answered to prevent cross-device
        .where({_openid: app.globalData.openid})
        .get({
          success: function (res) {
            var exists = that.checkRecord(res, qId)
            if (!exists) {
              var disp = ["false", "false", "false", "false"]
              disp[that.data.userChoice] = "incorrect"
              disp[that.data.choices.indexOf(that.data.question.answer)] = "correct"
              that.setData({
                choiceDisplay: disp,
                disabled: true,
                unNextable: false
              })
              addRecord(correct, qId, that.data.title)
            }
          }
        })
      return correct ? '回答正确!' : '未回答正确!'
    } else return '未回答正确!'
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
    if (!this.data.unNextable) {
      clearTimeout(this.data.timerId)
      if (this.data.questionIndex >= (this.data.questions.length - 1)) { // go back if on last question
        wx.navigateBack()
      } else {
        var qIdx = this.data.questionIndex + 1 // increment question index
        var image = this.data.questions[qIdx].imgUrl
        this.setData({       // reset everything
          questionIndex: qIdx,
          choiceDisplay: [false, false, false, false],
          unNextable: true,
          unNextable: !this.userAnswered(this.data.qIds[qIdx]),
          timer: 30,
          timerDisplay: "0:30",
          question: this.data.questions[qIdx],
          choices: this.data.choicesList[qIdx],
          img: (typeof image === 'undefined') ? '' : image,
          imgWidth: (typeof image === 'undefined') ? 'height: 0; width: 0' : 'width: 100%',
          userChoice: -1,
          disabled: true
        })
        this.startSetInter() // reset timer
      }
    }
  },

  choose: function(e) { // controls MC buttons
    if (this.data.unNextable) {
      let c = e.currentTarget.dataset.choice
      var disp = ["false", "false", "false", "false"]
      disp[c] = "true"
      this.setData({
        userChoice: c,
        choiceDisplay: disp,
        disabled: false
      })
    }
  },

  userAnswered: function(id) { // checks if user has answered question of id
    var that = this
    db.collection('userInfo')
      .where({_openid: app.globalData.openid})
      .get({
        success: function (res) {
          var exists = that.checkRecord(res, id)
          if (exists) {
            clearTimeout(that.data.timerId)
            that.setData({
              unNextable: false,
            }, () => {
                return exists
            })
          }
        }
      })
  },

  checkRecord: function (res, id) {
    var records = res.data[0].record
    var exists = false
    if (typeof records === 'undefined') {
      return false
    } else {
      for (var i = 0; i < records.length; i++) {
        if (records[i]["questionID"] == id) {
          exists = true
          break
        }
      }
      return exists
    }
  }
})

function addRecord(correct, id, subject) {
  db.collection('userInfo')
    .where({ _openid: app.globalData.openid })
    .get({
      success: function (res) { // this is some really shitty code
        var totalScore = res.data[0].totalCorrect
        var updatedScore2 = res.data[0].dailyScore2
        var updatedScore3 = res.data[0].dailyScore3 
        if (correct) {
          totalScore += 100
          if (subject === '概念') updatedScore2 += 100
          else if (subject === '几何') updatedScore3 += 100
        }
        db.collection('userInfo')
          .where({ _openid: app.globalData.openid })
          .update({
            data: {
              record: db.command.push({
                isCorrect: correct,
                questionID: id,
                answerTime: new Date(),
                subject: subject
              }),
              dailyScore2: updatedScore2,
              dailyScore3: updatedScore3,
              totalCorrect: totalScore
            }
          })
      }
    })
 
}



