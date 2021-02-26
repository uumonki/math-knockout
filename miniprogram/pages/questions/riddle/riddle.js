var db = wx.cloud.database();
var app = getApp();

Page({ 
       // TODO: check if cross device cheating possible
       // TODO: check if user exists before allowing visiting page (!!!)

  data: {
    //page data
    timer: 181, 
    timerDisplay: "3:00",
    timerId: 0,
    questions: [],    // array of all questions
    questionIndex: 0, // current q user is on
    question: {},     // current q displayed
    qIds: [],         // array of all q ids
    disabled: true,   // whether submit button available
    unNextable: true, // if true: NEXT is grayed out and SUBMIT is visible, vice versa
    letters: [],
    input: []
  },

  onLoad: function () {
    let that = this
   
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('mkQuestion')  // fetch most recent 5 questions
      .limit(5)
      .orderBy('uploadDate', 'desc')
      .where({type: 'riddle'})
      .get({
        success: function (res) { // check if user has alr answered, this is a mess cuz i can't async
          console.log(app.globalData.openid)
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
          var lets = res.data[0].riddleKey.map((a) => a[0])
          console.log(lets)
          that.setData({    // write in question data
            questions: res.data,
            question: res.data[0],
            img: res.data[0].imgUrl,
            letters: lets,
            qIds: res.data.map((a) => a._id),
            input: new Array(lets.length).fill(undefined)
          })
        }
      })

    
  },

  onShow: function () {
    clearTimeout(this.data.timerId)
    this.setData({ timer: 181 })
    this.setData({ timerDisplay: "3:00" })
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
    this.setData({timer: 180})
    this.submit(true)
    wx.showModal({
      title: '时间到!',
      content: '答案已自动提交', //提示内容
      showCancel: false,
    })
  },

  submit: function (skip) {
    let that = this
    var inputData = this.data.input
    if (!(inputData.includes(undefined) || inputData.includes('')) || skip) { // check if anything chosen or if time is up
      clearTimeout(this.data.timerId)
      var qId = this.data.question._id

      if (!this.userAnswered(qId)) {  // check again if user answered to prevent cross-device
        // check correct count
        var correct = 0
        var input = this.data.input
        var correctVals = this.data.question.riddleKey.map((a) => a[1])
        for (var i = 0; i < input.length; i++) {
          if (input[i] === correctVals[i]) correct++
        }
        console.log(correct)

        // 2.27 这里开始改 !!!!
        this.setData({
          disabled: true,
          unNextable: false
        })
        addRecord(correct, qId, that.data.question.subject)
      } else {
        this.setData({
          unNextable: false
        })
      }
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
          unNextable: true,
          unNextable: !this.userAnswered(this.data.qIds[qIdx]),
          timer: 180,
          timerDisplay: "3:00",
          question: this.data.questions[qIdx],
          img: (typeof image === 'undefined') ? '' : image,
          disabled: true
        })
      }
    }
  },

  input: function(e) { // controls MC buttons
    let l = e.currentTarget.dataset.letter
    let val = e.detail.value
    var currentInput = this.data.input
    currentInput[l] = val
    this.setData({
      userChoice: c,
      disabled: false
    })
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



