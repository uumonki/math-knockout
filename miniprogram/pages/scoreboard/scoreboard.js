// miniprogram/pages/scoreboard.js
var app = getApp();
Page({

  data: {
      monthRanking: [],
      totalRanking: [],
      monthOffset: 0,
      totalOffset: 0,
      monthScore: 0,
      totalScore: 0,
      pfpUrl: "",
      show: false, 
  },

  onLoad: function (options) {
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    
    db.collection('userInfo')
      .where({_openid:app.globalData.openid})
      .get({
        success: function (res){
            that.setData({
            monthScore:res.data[0].monthCorrect,
            totalScore:res.data[0].totalCorrect,
            pfpUrl: res.data[0].wechatInfo.avatarUrl
          })
        }
      })
    

    db.collection('userInfo')
      .orderBy('monthCorrect', 'desc') // descending order of 'monthCorrect' data of user
      .limit(20) // 10 query items maximum
      .get({
        success: function (res){
          //store the ranking info locally in monthRanking
          //ranking info: array of user objects, in descending order of monthly answered correctly
          that.setData({
            monthRanking: res.data
          })
// Updated upstream
//<<<<<<< HEAD
        }
      })
    
//=======
//>>>>>>> Stashed changes
        
// Updated upstream

// ad4030fa033db1b6c41900905d91c490d5e30944
// Stashed changes

  },

  getTotalRanking: function () {
    //modified copy of onLoad.
    let that = this
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    db.collection('userInfo')
      .orderBy('totalCorrect', 'desc') // descending order of 'totalCorrect' data of user
      .limit(20) // 10 query items maximum
      .get({
        success: function (res) {
          //store the ranking info locally in totalRanking
          //ranking info: array of user objects, in descending order of total answered correctly
          that.setData({
            totalRanking: res.data
          })
        }
      })
}
})
