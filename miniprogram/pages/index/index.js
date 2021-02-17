//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    selectedSubject: 0,                    // 控制每日三题选择学科
    subjects: ["数学", "物理", "化学"],     // 控制每日三题选择学科
    opacity: [1, 0, 0],                   // 控制每日三题选择学科
    records: null,
  },

  onLoad: function() {
    let that = this
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // get wechat's userinfo + avator
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
              //info stored into global data; can be called anytime
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  
    wx.cloud.init({
      env: 'shsid-3tx38'
    })
    const db = wx.cloud.database();

    //get openid of user and store it in app.globalData.openid
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        //call 'login' cloud function
        app.globalData.openid = res.result.openid
        db.collection('userInfo').where({
          _openid: app.globalData.openid
        })
          .get({
            success: function (res) {
              // if the user openid is not in database
              if (res.data.length == 0) {
                // create new user object in database
                db.collection('userInfo').add({
                  data: {
                    wechatInfo: app.globalData.userInfo,
                    monthAnswer: 0, //number answered every month
                    monthCorrect: 0, // number of questions answered correctly every month
                    totalAnswer: 0, //total number of questions answered
                    totalCorrect: 0 // total number of questions answered correctly
                  },
                  success: function (res) {
                    //if success, log the new userinfo object
                    console.log(res)
                  }
                })
              }
            }
          })

          //get 答题记录!
          db.collection('userInfo')
            .where({_openid: app.globalData.openid})
            .get({
              success: function (res){
                console.log(res.data[0].record)
                that.setData({records: res.data[0].record})
              }
            })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    
    
    db.collection('userInfo')


    wx.showTabBar()
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },


  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },


  touchStart(e) { // 检测卡片开始滑动，记录触摸位置
    var that = this;
    that.setData({
      touchx: e.changedTouches[0].clientX,
      touchy: e.changedTouches[0].clientY
    })
  },
  touchEnd(e) { // 检测卡片停止滑动
    var that = this
    let x = e.changedTouches[0].clientX
    let y = e.changedTouches[0].clientY
    let turn = ""
    // 判断滑动方向
    if (x - that.data.touchx > 50 && Math.abs(y - that.data.touchy) < 150) {      //右滑
      turn = "right"
    } else if (x - that.data.touchx < -50 && Math.abs(y - that.data.touchy) < 150) {   //左滑
      turn = "left"
    } else if (Math.abs(x - that.data.touchx) < 25 && Math.abs(y - that.data.touchy) < 25) {   // tap
      turn = "tap" 
    } 
    if (turn == "left"){
      if (this.data.selectedSubject < 2) {
        let s = this.data.selectedSubject + 1
        this.setData({selectedSubject: s})
      }
    } else if (turn == "right") {
      if (this.data.selectedSubject > 0) {
        let s = this.data.selectedSubject - 1
        this.setData({selectedSubject: s})
      }
    } else if (turn == "tap") {
      this.enterQuestion()
    }
    var disp = [0, 0, 0];
    disp[this.data.selectedSubject] = 1
    this.setData({opacity: disp})
  },

  enterQuestion: function() { // called when 卡片被点击
    console.log(this.data.subjects[this.data.selectedSubject])
    const url = '../questions/question/question?subject='+ this.data.subjects[this.data.selectedSubject]
    wx.navigateTo({
      url: url
    })
  }

})
