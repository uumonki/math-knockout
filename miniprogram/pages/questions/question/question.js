// miniprogram/pages/question/question.js
var db = wx.cloud.database();
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    
    console.log('subject:', options.subject)
    
  },


  addRecord: function () {
    db.collection('userInfo').where({
      _openid: app.globalData.openid
    }).update({
      data: {
        record: db.command.push({
          isCorrect: true,
          questionID: '[copy paste the _id of question here]',
          answerTime: new Date()
        })
      }
    })
  }

})