Golang singleflight in Node

provides a duplicate function call suppression mechanism.
在多次调用中共用返回值，并发时使用。
---

[singleflight](https://pkg.go.dev/golang.org/x/sync/singleflight)

### 安装

```shell
npm i github:leekafai/singleflight
```

### 使用案例

```javascript
const singleFlight=require('singleflight')
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