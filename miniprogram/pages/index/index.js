//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {

    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
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
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        db.collection('userInfo').where({
          _openid: app.globalData.openid
        })
          .get({
            success: function (res) {
              // if the user openid is not in database
              console.log('userInfo ', res)
              if (res.data.length == 0) {
                // create new user object in database
                db.collection('userInfo').add({
                  data: {
                    wechatInfo: app.globalData.userInfo,
                    monthAnswer: 0
                  },
                  success: function (res) {
                    //if success, log the new userinfo object
                    console.log(res)
                  }
                })
              }
            }
          })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })

    

    
    

    

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

  test: function() {
      wx.cloud.init({
        env: 'shsid-3tx38'
      })
      const db = wx.cloud.database();
      db.collection('userInfo').add({
        data:{
          answer: 'yusuke sucks'
        }
      })
  },

  test2: function() {
    wx.cloud.callFunction({
      name: 'addUserInfo',
      data:{
        value: 13
      },
      complete: res =>{
        console.log(res)
      }
    })
  },

  test3: function() {
    wx.cloud.callFunction({
      name: 'addUserInfo',
      data:{
        value: 13
      },
      complete: res =>{
        console.log(res.result.data[1])
      }
    })
  }

})
