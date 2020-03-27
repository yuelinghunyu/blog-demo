import axios from "axios"

class PicLiseSevice {
  getPicList (param) {
    const page = param.page || 1
    const limit = param.limit || 10
    const url = `http://172.20.10.7:8080/view/${page}/${limit}`
    // const url = `http://10.5.113.90:8080/view/${page}/${limit}`
    return axios.get(url)
  }
}

export default new PicLiseSevice()