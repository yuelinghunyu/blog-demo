((window) => {
  window.URL = window.URL || window.webkitURL
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  window.audioBufferSouceNode = null

  let Recorder = function(stream, config){
    let audioContext = window.AudioContext || window.webkitAudioContext
    const context = new audioContext()

    config = config || {}
    config.channelCount = 1
    config.numberOfInputChannels = config.channelCount
    config.numberOfOutputChannels = config.channelCount
    config.sampleBits = config.sampleBits || 16
    config.sampleRate = config.sampleRate || 8000
    config.bufferSize = 4096 //创建缓存，用来缓存声音 

    let audioInput = context.createMediaStreamSource(stream) //将声音输入这个对像
    let volume = context.createGain() //设置音量节点
    audioInput.connect(volume)

    // 创建声音的缓存节点，createScriptProcessor方法的第二个和第三个参数指的是输入和输出都是声道数
    let recorder = context.createScriptProcessor(config.bufferSize, config.channelCount, config.channelCount)
    
    //用来储存读出的麦克风数据，和压缩这些数据，将这些数据转换为WAV文件的格式
    let audioData = {
      size: 0,        //录音文件长度
      buffer: [],     //录音缓存  
      inputSampleRate: context.sampleRate,    //输入采样率
      inputSampleBits: 16, //输入采样数位 8, 16 
      outputSampleRate: config.sampleRate,    //输出采样率
      oututSampleBits: config.sampleBits,    //输出采样数位 8, 16
      input: function(data) { // 实时存储录音的数据
        this.buffer.push(new Float32Array(data))  //Float32Array
        this.size += data.length
      },
      getRawData: function() { //合并压缩  
        //合并
        let data = new Float32Array(this.size)
        let offset = 0
        for(let i = 0; i < this.buffer.length; i++) {
          data.set(this.buffer[i], offset)
          offset += this.buffer[i].length
        }
        // 压缩
        let getRawDataion = parseInt(this.inputSampleRate / this.outputSampleRate)
        let length = data.length / getRawDataion
        let result = new Float32Array(length)
        let index = 0, j = 0
        while (index < length) {  
          result[index] = data[j]
          j += getRawDataion
          index++
        }
        return result
      },
      covertWav: function() { // 转换成wav文件数据
        let sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate)
        let sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits)
        let bytes = this.getRawData()
        let dataLength = bytes.length * (sampleBits / 8)
        let buffer = new ArrayBuffer(44 + dataLength)
        let data = new DataView(buffer)
        let offset = 0
        let writeString = function (str) {  
          for (var i = 0; i < str.length; i++) {  
            data.setUint8(offset + i, str.charCodeAt(i))
          }  
        }
        // 资源交换文件标识符   
        writeString('RIFF'); offset += 4
        // 下个地址开始到文件尾总字节数,即文件大小-8   
        data.setUint32(offset, 36 + dataLength, true); offset += 4
        // WAV文件标志  
        writeString('WAVE'); offset += 4
        // 波形格式标志   
        writeString('fmt '); offset += 4
        // 过滤字节,一般为 0x10 = 16   
        data.setUint32(offset, 16, true); offset += 4 
        // 格式类别 (PCM形式采样数据)   
        data.setUint16(offset, 1, true); offset += 2
        // 通道数   
        data.setUint16(offset, config.channelCount, true); offset += 2
        // 采样率,每秒样本数,表示每个通道的播放速度   
        data.setUint32(offset, sampleRate, true); offset += 4
        // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8   
        data.setUint32(offset, config.channelCount * sampleRate * (sampleBits / 8), true); offset += 4
        // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8   
        data.setUint16(offset, config.channelCount * (sampleBits / 8), true); offset += 2 
        // 每样本数据位数   
        data.setUint16(offset, sampleBits, true); offset += 2
        // 数据标识符   
        writeString('data'); offset += 4
        // 采样数据总数,即数据总大小-44   
        data.setUint32(offset, dataLength, true); offset += 4
        // 写入采样数据
        data = this.reshapeWavData(sampleBits, offset, bytes, data)
        return data
      },
      getFullWavData: function() { // 用blob生成文件
        const data = this.covertWav()
        return new Blob([data], { type: 'audio/wav' })
      },
      closeContext: function(){ //关闭AudioContext否则录音多次会报错
        context.close() 
      },
      reshapeWavData: function(sampleBits, offset, iBytes, oData) { // 8位采样数位
        if (sampleBits === 8) { 
            for (let i = 0; i < iBytes.length; i++, offset++) {  
              let s = Math.max(-1, Math.min(1, iBytes[i])) 
              let val = s < 0 ? s * 0x8000 : s * 0x7FFF
              val = parseInt(255 / (65535 / (val + 32768))) 
              oData.setInt8(offset, val, true) 
            }  
        } else {
            for (let i = 0; i < iBytes.length; i++, offset += 2) {  
              let s = Math.max(-1, Math.min(1, iBytes[i]))  
              oData.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
            }  
        }
        return oData
      },
      getWavBuffer: function() { // 用于绘图wav格式的buffer数据
        const data = this.covertWav()
        return data.buffer
      },
      getPcmBuffer: function() { // pcm buffer 数据
        let bytes = this.getRawData(),
        offset = 0,
        sampleBits = this.oututSampleBits,
        dataLength = bytes.length * (sampleBits / 8),
        buffer = new ArrayBuffer(dataLength),
        data = new DataView(buffer);
        for (var i = 0; i < bytes.length; i++, offset += 2) {
          var s = Math.max(-1, Math.min(1, bytes[i]));
          // 16位直接乘就行了
          data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
        return new Blob([data])
      }
    }

    // 开始录音
    this.start = () => {
      audioInput.connect(recorder)
      recorder.connect(context.destination)
    }
    // 获取音频文件
    this.getBlob = () => {
      this.stop()
      return audioData.getFullWavData()
    }
    this.getBuffer = () => {
      this.stop()
      return audioData.getPcmBuffer()
    }
    // 播放
    this.play = (audio, ctx) => {
      audio.src = window.URL.createObjectURL(this.getBlob())
      audio.addEventListener("play", () => {
        this.draw(ctx)
      })
    }
    // wav文件资源
    this.wavSrc = () => {
      return window.URL.createObjectURL(this.getBlob())
    }
    // pcm 文件
    this.pcmSrc = () => {
      this.stop()
      return window.URL.createObjectURL(this.getBuffer())
    }
    // 停止
    this.stop = () => {
      recorder.disconnect()
    }
    this.close=function(){
      audioData.closeContext()
    }
    // 音频绘制
    this.draw = function(ctx) {
      const arraybuffer = audioData.getWavBuffer()
      context.decodeAudioData(arraybuffer, (buffer) => {
        if(window.audioBufferSouceNode!=null) {
          window.audioBufferSouceNode.stop()
        }
        window.audioBufferSouceNode = context.createBufferSource()
        audioBufferSouceNode.buffer = buffer
        gainNode = context.createGain()
        gainNode.gain.value = 2
        audioBufferSouceNode.connect(gainNode)
        let analyser = context.createAnalyser()
        analyser.fftSize = 256
        gainNode.connect(analyser)
        analyser.connect(context.destination)
        audioBufferSouceNode.start(0)

        let top = new Uint8Array(analyser.frequencyBinCount)
        let gradient = ctx.createLinearGradient(0, 0, 4, 200)
        gradient.addColorStop(1, 'pink')
        gradient.addColorStop(0.5, 'blue')
        gradient.addColorStop(0, 'red')
        let drawing = function() {
          let array = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(array)
          ctx.clearRect(0, 0, 600, 200)
          for(let i = 0; i < array.length; i++) {
            let _height = array[i]
            if(!top[i] || (_height > top[i])) {//帽头落下
              top[i] = _height
            } else {
              top[i] -= 1
            }
            ctx.fillRect(i * 20, 200 - _height, 4, _height)
            ctx.fillRect(i * 20, 200 - top[i] -6.6, 4, 3.3)//绘制帽头
            ctx.fillStyle = gradient
          }
          requestAnimationFrame(drawing)
        }
        drawing()
      })
    }
    // 音频采集
    recorder.onaudioprocess = (e) => {
      audioData.input(e.inputBuffer.getChannelData(0))
    }
  }
  // 获取麦克风
  Recorder.get = (callback, config) => {
    if(callback) {
      if(navigator.getUserMedia) {
        navigator.getUserMedia({
          audio: true
        }, (stream) => {
          const rec = new Recorder(stream, config)
          callback(rec)
        }, (error) => {
          console.log(error)
        })
      } else {
        alert("麦克风获取失败")
      }
    }
  }
  window.Recorder = Recorder
})(window)