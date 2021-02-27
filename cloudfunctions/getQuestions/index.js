// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'shsid-3tx38'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log(event)
    return await db.collection('mkQuestion')
      .where({type: event.type})
      .orderBy('uploadDate', 'desc')
      .get()
  } catch (e) {
    console.log(e)
  }
}