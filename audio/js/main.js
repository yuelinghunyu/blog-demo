const record = document.getElementById("record")
const stop = document.getElementById("stop")
const play = document.getElementById("play")
const audio = document.getElementById("audio")
const downWav = document.getElementById("downWav")
const downPcm = document.getElementById("downPcm")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
canvas.width = 600
canvas.height = 200 
let recorder = null

// 录制
record.addEventListener("click", () => {
  if(recorder !== null) recorder.close()
  Recorder.get((rec) => {
    recorder = rec
    recorder.start()
  })
})

// 停止
stop.addEventListener("click", () => {
  if(recorder === null) return alert("请先录音")
  recorder.stop()
})

// 播放
play.addEventListener("click", () => {
  if(recorder === null) return alert("请先录音")
  recorder.play(audio, ctx)
  recorder.draw(ctx)
})

// 下载 wav 
downWav.addEventListener("click", () => {
  if(recorder === null) return alert("请先录音")
  const src = recorder.wavSrc()
  downWav.setAttribute("href", src)
})

// 下载 pcm 
downPcm.addEventListener("click", () => {
  if(recorder === null) return alert("请先录音")
  const src = recorder.pcmSrc()
  downPcm.setAttribute("href", src)
})