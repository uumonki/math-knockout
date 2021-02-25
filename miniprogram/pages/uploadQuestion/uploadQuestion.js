// miniprogram/pages/uploadQuestion/uploadQuestion.js

const db = wx.cloud.database();
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: false,
    path: '',
    o: ''
  },

  typeChange: function (e) {
    var input = e.detail.value
    if (input === 'riddle') {
      this.setData({type: true})
    } else this.setData({type: false})
  },

  pic: function () {
    var that = this
    //让用户选择或拍摄一张照片
    wx.chooseImage({
      count: 1,	
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
      //选择完成会先返回一个临时地址保存备用
        that.setData({path: res.tempFilePaths[0]})
        console.log(that.data.path)
      }
    })
  },

  questionForm: function (e) {
    var that = this
    const inputData = e.detail.value
    var key = inputData.answerKey
    if (key.length !== 0) {
      key = key.split(' ').map((a) => a.split(''))
    }
    db.collection('mkQuestion').add({
      data: {
        type: inputData.type,
        engQuestion: inputData.question,
        choice1: inputData.choice1,
        choice2: inputData.choice2,
        choice3: inputData.choice3,
        choice4: inputData.choice4,
        answer: inputData["choice"+inputData.answerIndex],
        riddleKey: key,
        uploadDate: new Date()
      },
      success: function (res) {
        //if success, log the new userinfo object
        const id = res._id
        if (that.data.path.length !== 0) {
          wx.cloud.uploadFile({
            cloudPath: inputData.type + '/' + id + '.jpg',
            filePath: that.data.path,
            success(res1) {
            //上传成功后会返回永久地址
              console.log(res1.fileID)
              db.collection('mkQuestion')
                .where({_id: id})
                .update({
                  data: {
                    imgUrl: res1.fileID
                  }
                })
            }
          })
        }
        this.setData({
          o: '',
          path: ''
        })
      }
    })
    
  }
})

/*
        wx.cloud.uploadFile({
          cloudPath: 'test.jpg',
          filePath: tempFilePaths[0],
          success(res) {
          //上传成功后会返回永久地址
           	console.log(res.fileID) 
          }
        })

        */
