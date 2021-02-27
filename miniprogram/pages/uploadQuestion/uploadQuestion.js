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
  }, //控制表单元素显示

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
        console.log(that.data.path) // 临时地址储存在path
      }
    })
  },

  questionForm: function (e) {
    var that = this
    const inputData = e.detail.value
    var key = inputData.answerKey
    if (key.length !== 0) { // format riddle type question answer
      key = key.split(' ').map((a) => a.split(''))
    }
    db.collection('mkQuestion').add({ // create new question in database, input basic info
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
      success: function (res) { // get the id of created object, use it to name picture
        const id = res._id
        if (that.data.path.length !== 0) { // if there is a picture, upload
          wx.cloud.uploadFile({
            cloudPath: inputData.type + '/' + id + '.jpg', // image file in folder named after its type
            filePath: that.data.path,
            success(res1) { // write the address of uploaded pic back into question data
            //上传成功后会返回永久地址
              console.log(res1.fileID) 
              db.collection('mkQuestion')
                .where({_id: id})
                .update({
                  data: {
                    imgUrl: res1.fileID // url of corresponding image stored in imgUrl
                  }
                })
              wx.showToast({title: '上传成功'})
            }
          })
        }
        this.setData({
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
