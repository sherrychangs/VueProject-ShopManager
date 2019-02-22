import axios from 'axios'
import { Message } from 'element-ui'

const HttpServer = {}
HttpServer.install = function (Vue) {
  // 请求拦截器
  axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
  axios.interceptors.request.use(function (config) {
    if (config.url !== 'login') {
      const AUTH_TOKEN = localStorage.getItem('token')
      config.headers.common['Authorization'] = AUTH_TOKEN
    }
    return config
  }, function (error) {
    return Promise.reject(error)
  })
  // 响应拦截器
  axios.interceptors.response.use(function (response) {
    const {meta:{status, msg}} = response.data
    if (status !==200 &&status !== 201) {
      Message.warning(msg)
    }
    return response
  }, function (error) {
    return Promise.reject(error)
  })
  Vue.prototype.$http = axios
}
export default HttpServer
