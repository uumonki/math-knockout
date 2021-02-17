var db = wx.cloud.database();
var app = getApp();

Page({ // TODO: check hasAnswered
       // TODO: implement question image
       // TODO: allow image choices
       // TODO: implement short answer
       // TODO: check if user exists before allowing visiting page

  data: {
    //page data
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

  onLoad: function (options) {
    let that = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        app.globalData.openid = res.result.openid
      }
    })
   
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('question')
      .limit(1)
      .get({
        success: function (res) {
          console.log('res', res)
          that.setData({
            question: res.data[0],
            choices: [res.data[0]["choice1"], res.data[0]["choice2"], res.data[0]["choice3"], res.data[0]["choice4"]],
            hasAnswered: that.userAnswered(res.data[0]._id)
          })
        }
      })

    
  },

  onShow: function () {
    clearTimeout(this.data.timerId)
    this.setData({ timer: 121 })
    this.setData({ timerDisplay: "2:00" })
    this.setData({ score: 0 })
    // this.updateCards()
    this.startSetInter()
  },

  onHide: function () {
    clearTimeout(this.data.timerId)
  },


  timeUp: function () { // CALLED WHEN TIMER IS UP, SCORE STORED IN this.data.score
    var scoreVal = this.data.score
    console.log("time's up :D")
    console.log("your score: " + scoreVal)
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
    console.log('id ', id)
    var that = this
    db.collection('userInfo')
      .where({
        _openid: app.globalData.openid
        })
      .get({
        success: function (res) {
          console.log("HERE")
          var records = res.data[0]["record"]
          console.log('records ', records)
          var exists = false
          for (var i = 0; i < records.length; i++) {
            if (records[i]["questionID"] == id) {
              exists = true
              console.log('found')
              break
            }
          }
          console.log('exist ', exists)
          if (exists) {
            that.setData({
              unNextable: false,
              hasAnswered: true
            }, () => {
                console.log(that.data.unNextable)
                console.log(that.data.hasAnswered)
                return exists
            })
            }
          
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



