/**
 * 使用 singleFlight 封装异步请求 method ，返回后的方法接受至少一个参数：
 * 
 * key 为调用标识，args 为 method 的传参。
 * @param {function} fn 
 */
const singleFlight = (fn) => {
  const p = new Map()
  /**
   * 并发调用
   * @param {string} key 调用标识
   * @param {any} args 传参
   */
  return (key, ...args) => {
    if (!p.get(key)) p.set(key, [])
    return new Promise((resolve, reject) => {
      let keyQue = p.get(key)
      keyQue.push({ resolve, reject })
      if (keyQue.length === 1) {
        fn(...args).then((result) => {
          while (keyQue.length) {
            const x = keyQue.pop()
            x.resolve(result)
          }

        }).catch((e) => {
          while (keyQue.length) {
            const x = keyQue.pop()
            x.reject(e)
          }

        }).finally(() => {
          p.get(key)?.length === 0 && p.delete(key)
        })
      }
    })
  }
}
module.exports = singleFlight