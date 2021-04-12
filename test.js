const singleFlight = require('./')
let remoteGetRealTimes = 0
let concurrentTimes = 0
// 模拟远端获取数据
const remote = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        remoteGetRealTimes++
        if (Math.random() > 0.5) return reject()

        resolve({ fruit_1: ['apple', 'banana'], fruit_2: ['orange', 'blueberry'] }[key])

      }, 1e2)
    })
  }
}
// 封装远端获取数据
const getFruitCache = async (key) => {
  const r = await remote.get(key) // about 200 ms
  return r // ["apple","banana"]
}
// 包装
const _getFruitCache = singleFlight(getFruitCache)
// 短时间内多次调用，则共用首次调用的返回值
console.time('for')
const timeoutRand = [100, 150, 200, 300, 350, 400, 500, 600, 700]
for (let i = 0; i < 1e4; i++) {
  const r = timeoutRand[~~(Math.random() * 100 % (timeoutRand.length - 1))]
  setTimeout(() => {
    if (Math.random() > 0.5) {
      // 传递一个 key string。相同 key 则代表期望相同结果，则并发调用中的响应数据可以共用。
      // 可以在 key 之后传递参数。但相同 key 应传递相同参数，因为响应结果需要共用。
      _getFruitCache('fruit', 'fruit_1').then((x) => {
        // 一秒内多次调用时，返回相同的结果
        concurrentTimes++
        // console.log(x) //  ['apple', 'banana']
      }).catch(() => {
        concurrentTimes++
      })
    } else {
      _getFruitCache('fruit_2', 'fruit_2').then((x) => {
        concurrentTimes++
        // console.log(x) // ['orange', 'blueberry']
      }).catch(() => {
        concurrentTimes++
      })
    }
  }, r)

}
console.timeEnd('for')
setTimeout(() => {
  console.log('并发调用 getFruitCache 次数', concurrentTimes)
  console.log('实际调用 remote.get 次数', remoteGetRealTimes)
}, 1e3)