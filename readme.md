Golang singleflight in Node

provides a duplicate function call suppression mechanism.
在多次调用中共用返回值，并发时使用。
---

[singleflight](https://pkg.go.dev/golang.org/x/sync/singleflight)



```javascript
const singleFlight = require('singleFlight')
let remoteGetRealTimes = 0
let concurrentTimes = 0
const remote = {
  get: (key) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ fruit_1: ['apple', 'banana'], fruit_2: ['orange', 'blueberry'] }[key])
        remoteGetRealTimes++
      }, 1e3)
    })
  }
}
// 模拟从远端获取数据
const getFruitCache = async (key) => {
  const r = await remote.get(key) // about 200 ms
  return r // ["apple","banana"]
}
// 包装
const _getFruitCache = singleFlight(getFruitCache)

// 短时间内多次调用，则共用首次调用的返回值
for (let i = 0; i < 1000; i++) {

  if (i < 500) {
    // 传递一个 key string。相同 key 则代表期望相同结果，则并发调用中的响应数据可以共用。
    // 可以在 key 之后传递参数。但相同 key 应传递相同参数，因为响应结果需要共用。
    _getFruitCache('fruit', 'fruit_1').then((x) => {
      // 一秒内多次调用时，返回相同的结果
      concurrentTimes++
      console.log(x) //  ['apple', 'banana']
    })
  } else {
    _getFruitCache('fruit_2', 'fruit_2').then((x) => {
      concurrentTimes++
      console.log(x) // ['orange', 'blueberry']
    })
  }
}
setTimeout(() => {
  console.log('并发调用 getFruitCache 次数', concurrentTimes)
  console.log('实际调用 remote.get 次数', remoteGetRealTimes)
}, 1.2e3)
```