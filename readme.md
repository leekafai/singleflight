Golang singleflight in Node
---

provides a duplicate function call suppression mechanism.


当在并发中需要异步获取相同的响应数据时，可以使用 `singleFlight` 减少实际发出的异步请求数量。

例如在一个 HTTP 服务中的接口 `/getACombo` 中，需要返回一个缓存于 redis 的数据。

当多个客户端并发请求 `/getACombo` 接口，并传递相同的参数时，期望中返回的数据是一致且可以共用的。

此时，在不使用 `singleFlight` 的情况下，每一个请求都会发出一个 redis 指令；

使用 `singleFlight` 后，N 个期望返回数据相同的请求，将共用一个 redis 指令执行的结果,可以大幅减少发出的 redis 指令，大大减少了 redis 的指令执行数量、网络传输量。


[singleflight](https://pkg.go.dev/golang.org/x/sync/singleflight)

### 安装

```shell
npm i @9f/singleflight -S
```

### 使用案例

```javascript
const singleFlight = require('@9f/singleflight')
let remoteGetRealTimes = 0 // 异步结果返回的次数
let concurrentTimes = 0 // 实际触发异步请求响应的次数
const wait = 2e3
// 模拟异步请求的响应
const remote = {
  get: (comboName) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ A: ['炒饭', '冰红茶'], B: ['拉面', '奶茶'] }[comboName])
        remoteGetRealTimes++ // 记录实际触发异步请求响应的次数
      }, wait)
    })
  }
}
// 模拟一个异步请求
const getACombo = async (comboName) => {
  const r = await remote.get(comboName)
  return r
}
// 封装后的方法，传参方式异于原来的方法：首位传参为一个 string 的 key
const _getACombo = singleFlight(getACombo)

// 模拟在一个 http 服务中，多个请求通过接口调用 service，多次触发 getACombo 的调用
for (let i = 0; i < 2e3; i++) {

  // 传递一个 key 作为调用标识。相同的调用标识，代表共用响应结果。
  // 有需要的话，可以在 key 之后传递参数。但相同 key 应传递相同参数，因为响应结果需要共用。
  // 获取 A 套餐
  _getACombo('user', 'A').then((x) => {
    // 多次调用，返回相同的结果
    concurrentTimes++ // 记录异步结果返回的次数
    console.log(x) //  套餐内容
  }).catch((e) => {
    console.error(e) // 可以使用正常的错误捕捉
  })

}
setTimeout(() => {
  console.log('并发调用 getFruitCache 次数', concurrentTimes) // 1e3
  console.log('实际调用 remote.get 次数', remoteGetRealTimes) // 远小于 1e3
}, wait + 200)
```