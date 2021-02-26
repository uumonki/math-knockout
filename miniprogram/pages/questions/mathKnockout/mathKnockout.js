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
    margin: '0'
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
      case "riddle":
        pageTitle = "急转弯"
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

    db.collection('mkQuestion')  // fetch most recent 5 questions
      .limit(5)
      .orderBy('uploadDate', 'desc')
      .where({type: qType})
      .get({
        success: function (res) { // check if user has alr answered, this is a mess cuz i can't async
          db.collection('userInfo')
          .where({
            _openid: app.globalData.openid
            })
          .get({
            success: function (res2) {
              var records = res2.data[0].record
              var exists = false
              for (var i = 0; i < records.length; i++) {
                if (records[i].questionID == res.data[0]._id) {
                  exists = true
                  clearTimeout(that.data.timerId)
                  break
                }
              }
              that.setData({
                unNextable: !exists
              })
            }
          })
          that.setData({    // write in question data
            questions: res.data,
            question: res.data[0],
            img: res.data[0].imgUrl,
            imgWidth: (typeof res.data[0].imgUrl === 'undefined') ? 'height: 0; width: 0' : 'width: 100%',
            margin: (typeof res.data[0].imgUrl === 'undefined') ? '-25' : '0',
            choicesList: res.data.map((a) => [a.choice1, a.choice2, a.choice3, a.choice4]),
            choices: [res.data[0]["choice1"], res.data[0]["choice2"], res.data[0]["choice3"], res.data[0]["choice4"]],
            qIds: res.data.map((a) => a._id),
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
      addRecord(false, this.data.question._id, this.data.question.subject)
  },

  onUnload: function () {
    clearTimeout(this.data.timerId)
    if (this.data.unNextable)
      addRecord(false, this.data.question._id, this.data.question.subject)
  },


  timeUp: function () { // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    clearTimeout(this.data.timerId)
    this.setData({timer: 30})
    console.log("hi")
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
      var qId = this.data.question["_id"]
      var correct = this.data.choices[this.data.userChoice] === this.data.question['answer'] // check answer correct
      if (!this.userAnswered(qId)) {  // check again if user answered to prevent cross-device
        var disp = ["false", "false", "false", "false"]
        disp[this.data.userChoice] = "incorrect"
        disp[this.data.choices.indexOf(this.data.question['answer'])] = "correct"
        this.setData({
          choiceDisplay: disp,
          disabled: true,
          unNextable: false
        })
        addRecord(correct, qId, that.data.question.subject)
      } else {
        this.setData({
          unNextable: false
        })
      }
      return correct ? '回答正确!' : '未回答正确!'
    }
    return '未回答正确!'
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
        this.startSetInter() // reset timer
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
          margin: (typeof image === 'undefined') ? '-25' : '0',
          userChoice: -1,
          disabled: true
        })
        console.log(this.data.imgWidth)
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
      .where({
        _openid: app.globalData.openid
        })
      .get({
        success: function (res) {
          var records = res.data[0]["record"]
          var exists = false
          for (var i = 0; i < records.length; i++) {
            if (records[i]["questionID"] == id) {
              exists = true
              break
            }
          }
          if (exists) {
            clearTimeout(that.data.timerId)
            that.setData({
              unNextable: false,
            }, () => {
                return exists
          })
        }
          /*
          
          } else {
            that.setData({
              unNextable: true,
              hasAnswered: false
            }, () => {
                return exists
            })
          }
          */
        }
      })
  },

})

function addRecord(correct, id, subject) {
  db.collection('userInfo').where({
    _openid: app.globalData.openid
  }).update({
    data: {
      record: db.command.push({
        isCorrect: correct,
        questionID: id,
        answerTime: new Date(),
        subject: subject
      }),
      totalAnswer: db.command.inc(1),
      monthAnswer: db.command.inc(1),
      totalCorrect: db.command.inc(correct ? 1 : 0),
      monthCorrect: db.command.inc(correct ? 1 : 0)
    }
  })
}



