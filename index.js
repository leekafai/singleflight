/**
 * 
 * @param {function} fn 
 */
const singleFlight = (fn) => {
  const p = {}
  let plen = {}
  /**
   * 并发调用
   * @param {string} key 共用键
   * @param {any} args 传参
   */
  return (key, ...args) => {
    if (!p[key]) p[key] = []
    if (isNaN(plen[key])) plen[key] = 0
    return new Promise((resolve, reject) => {
      p[key].push({ resolve, reject })
      plen[key] += 1
      if (p[key].length === 1) {
        fn(...args).then((result) => {
          p[key] = p[key].reverse()
          while (p[key].length) {
            const x = p[key].pop()
            x.resolve(result)
          }

        }).catch((e) => {

          while (p[key].length) {
            const x = p[key].pop()
            x.reject(e)
          }

        }).finally(() => {
          // delete p[key]

        })
      }
    })
  }
}
module.exports = singleFlight