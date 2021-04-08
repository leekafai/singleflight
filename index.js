/**
 * 
 * @param {function} fn 
 */
const singleFlight = (fn) => {
  const p = {}
  /**
   * 并发调用
   * @param {string} key 共用键
   * @param {any} args 传参
   */
  return (key, ...args) => {
    if (!p[key]) p[key] = []
    return new Promise((resolve, reject) => {
      p[key].push({ resolve, reject })
      if (p[key].length === 1) {
        fn(...args).then((result) => {
          let x = p[key].pop()
          while (x && x.resolve) {
            x.resolve(result)
            x = p[key].pop()
          }
        }).catch((e) => {
          let x = p[key].pop()
          while (x && x.reject) {
            x.reject(e)
            x = p[key].pop()
          }
        })
      }
    })
  }
}
module.exports = singleFlight