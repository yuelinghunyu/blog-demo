import axios from "axios"

class PicLiseSevice {
  getPicList (param) {
    const page = param.page || 1
    const limit = param.limit || 10
    const url = `http://localhost:8080/view/${page}/${limit}`
    return axios.get(url)
  }
}

export default new PicLiseSevice()