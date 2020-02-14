### 一、场景
项目中经常遇到区域超出部分会出现滚动条，滚动条在pc端可以通过鼠标滚轮控制上下，在移动端可以通过鼠标拖动页面进行滚动，这两种场景都是符合用户习惯，然而这种滚动条一般都是竖【<font color=green>vertical</font>】型滚动条，如果pc端出现横向滚动条【<font color=green>horizontal</font>】，在不做处理的情况下，你只能用鼠标拖动横向滚动条按钮展示滚动区域，而且为了美观，一般滚动条会进行样式编写或者隐藏，那么横向区域默认情况下就没法滚动。
### 二、描述
现为了解决pc端滚动区域能像移动端一样，能够通过鼠标拖动滚动区域直接进行滚动，如图所示

![](https://user-gold-cdn.xitu.io/2020/2/13/1703dc165ec9694d?w=1438&h=805&f=gif&s=629013)  
<center>滚动联动示例图</center>  

滚动实例用到知识点如下： 

+ 采用 <font color=green>vue-cli3</font> + <font color=green>iscroll.js</font> 组合实现；
+ 使用 vue 自定义指令实现 iscroll 实例化和参数配置；
+ 上下滚动区域联动，自行实现横向滚动条居中显示和使用<fcenteront color=green> scrollIntoView </font>的差别  
### 三、自定义指令 v-iscroll  
#### 1、新建指令文件
这里使用 vue 自定义指令初始化 iscroll 实例，在 vue-cli3 项目目录下新建 <font color=#5199e9>vIscroll.js</font> ,文件代码如下：
```
const IScroll = require('iscroll')
const VIScroll = {
  install: function (Vue, options) {
    Vue.directive('iscroll', {
      inserted: function (el, binding, vnode) {
        let callBack
        let iscrollOptions = options
        const option = binding.value && binding.value.option
        const func = binding.value && binding.value.instance
        // 判断输入参数
        const optionType = option ? [].toString.call(option) : undefined
        const funcType = func ? [].toString.call(func) : undefined
        // 兼容 google 浏览器拖动
        el.addEventListener('touchmove', function (e) {
          e.preventDefault()
        })
        // 将参数配置到new IScroll(el, iscrollOptions)中
        if (optionType === '[object Object]') {
          iscrollOptions = option
        }
        if (funcType === '[object Function]') {
          callBack = func
        }
        // 使用vnode绑定iscroll是为了让iscroll对象能够夸状态传递，避免iscroll重复建立
        // 这里面跟官方网站 const myScroll = new IScroll('#wrapper'，option) 初始化一样
        vnode.scroll = new IScroll(el, iscrollOptions)
        // 如果指令传递函数进来，把iscroll实例传递出去
        if (callBack) callBack(vnode.scroll)
      },
      componentUpdated: function (el, binding, vnode, oldVnode) {
        // 将scroll绑定到新的vnode上，避免多次绑定
        vnode.scroll = oldVnode.scroll
        // 使用 settimeout 让refresh跳到事件流结尾，保证refresh时数据已经更新完毕
        setTimeout(() => {
          vnode.scroll.refresh()
        }, 0)
      },
      unbind: function (el, binding, vnode, oldVnode) {
        // 解除绑定时要把iscroll销毁
        vnode.scroll = oldVnode.scroll
        vnode.scroll.destroy()
        vnode.scroll = null
      }
    })
  }
}
module.exports = VIScroll
```
这里附上 [**<font color=#5199e9>iscroll.js 5</font>**](http://caibaojian.com/iscroll-5/) 官方文档地址，[**<font color=#5199e9>iscroll npm</font>**](https://www.npmjs.com/package/iscroll) 包地址，相关属性和方法自行查看。 
#### 2、加载引用指令  
首先在 main.js 中加载指令：
```
import Vue from 'vue'
import App from './App.vue'
import "./assets/reset.css"
// 加载scroll指令
import VIscroll from './directive/vIscroll'
Vue.use(VIscroll)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

```
使用指令，摘自部分代码如下：

```
<template>
  <div class="tab-container">
    <div
      class="scroll-container"
      v-iscroll="{
        option: iscrollConf,
        instance: getIscroll
      }"
      ref="scrollContainer"
    >
      <ul
        class="tab-li-container"
        ref="tabLiContainer"
      >
        <li
          class="tab-li-item"
          v-for="(item, index) in list"
          :key="item.id"
          :id="item.id"
          ref="tabItem"
          @click="tabEvent(item, index)"
        >
          <div
            class="item"
            :class="{
              'item-active': currentId == item.id
            }"
          >{{item.num}}</div>
        </li>
      </ul>
    </div>
    <div
      class="tab-left"
      @click="tabBtnEvent('left')"
    >&lt;</div>
    <div
      class="tab-right"
      @click="tabBtnEvent('right')"
    >&gt;</div>
  </div>
</template>
<script>
export default {
  props: ['list'],
  data () {
    return {
      iscrollConf: {
        bounce: true,
        mouseWheel: true,
        click: true,
        scrollX: true,
        scrollY: false
      },
      currentId: null,
      currentIndex: 0,
      myScroll: null
    }
  },
  mounted () {
    this.$refs.tabLiContainer.style.width = this.$refs.tabItem[0].offsetWidth * this.list.length + 'px'
    this.$nextTick(() => {
      this.myScroll.refresh()
    })
  },
  methods: {
    tabEvent (item, currentIndex) {
      <!--点击某个li 按钮事件处理逻辑-->
    },
    tabBtnEvent (direction) {
      <!--左右切换逻辑事件-->
    },
    getIscroll (iscroll) {
      this.myScroll = iscroll
    }
  },
  watch: {
    list: {
      handler (l) {
        this.currentId = l[0].id
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
<style scoped>
// 样式
</style>
```
上述代码中 v-iscroll 指令传入两个字段参数：  
+ <font color=#5199e9>option</font>：配置iscroll参数，这里面注意scrollX，scrollY两个属性，代表的是横向还是竖向滚动；
+ <font color=#5199e9>instance</font>：回调方法的调用， **<font color=#5199e9>vIscroll.js </font>** 中执行回调方法，通过该组件方法 getIscroll() 获取到 iscroll 的实例。
#### 3、上下滚动区域联动
实际上面的代码可以解决上面场景的问题，现在实现上下区域联动，通过选中横向滚动条某个按钮，使其变成选中状态，然后竖向滚动条对应的项跳到首位，如图所以：



![](https://user-gold-cdn.xitu.io/2020/2/13/1703e5b384ef4f6f?w=944&h=394&f=png&s=20489)

<center>联动示例图</center>  

##### 3-1、联动实现方法
点击按钮的方法：
```
tabEvent (item, currentIndex) {
  this.currentId = item.id
  this.currentIndex = currentIndex
  <!--这里实现按钮始终居中显示，暂时省略，下面补充-->
  ...
  <!--传给竖向滚动组件-->
  this.$emit("switchTab", this.currentId, this.currentIndex)
},
```
竖向组件代码部分如下，并对 switchTab() 代码进行详细注释：
```
<template>
  <div id="app">
    <TabList
      :list="list"
      @switchTab="switchTab"
    ></TabList>
    <!-- v-iscroll="defalutOption" -->
    <div
      v-iscroll="{
        option: defalutOption,
        instance: getIscroll
      }"
      class="tab-content-container"
      ref="detailItemContainer"
    >
      <ul class="tab-list-container">
        <li
          v-for="item in list"
          :key="item.id"
          class="list-item"
          ref="detailItem"
        >
          <div>{{item.value}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TabList from './components/tabList.vue'

export default {
  name: 'App',
  components: {
    TabList,
  },
  data () {
    return {
      list: [
        { id: 1, value: '这是第1题', num: 1 },
        <!--...省略数据展示-->
        { id: 16, value: '这是第16题', num: 16 }
      ],
      defalutOption: {
        bounce: true,
        mouseWheel: true,
        click: true,
        scrollX: false,
        scrollY: true
      },
      myScroll: null
    }
  },
  methods: {
    switchTab (currentId, currentIndex) {
     <!--对选中的当前项，这里就是“3”按钮对应的“这是第3题”，求出它距离父元素的上边距offsetTop值-->
      const offsetTop = this.$refs.detailItem[currentIndex].offsetTop
      <!--滚动的范围不能超过这个滚动体的底部，这里面用到iscroll的属性maxScrollY-->
      const y = offsetTop >= Math.abs(this.myScroll.maxScrollY) ? this.myScroll.maxScrollY : -offsetTop
      <!--调用iscroll的方法进行滚动到相应的位置-->
      this.myScroll.scrollTo(0, y)
    },
    <!--获取实例-->
    getIscroll (iscroll) {
      this.myScroll = iscroll
    }
  }
}
</script>
<style scoped>
<!--样式-->
...
</style>

```
这里面用到的都是 iscroll 插件自带的属性和方法进行滚动边界的判断和滚动，比用 JavaScript 方法方便的多，而且用了iscroll作为滚动容器，已经在 <font color=#5199e9>vIscroll.js</font> 禁用了相关浏览器默认事件。  
##### 3-2、居中显示
这里 JavaScript 有个 **<font color=#5199e9>scrollIntoView()</font>**   方法，[官方文档链接](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)，这个方法让当前的元素滚动到浏览器窗口的可视区域内。关键缺点是，如果横向滚动和竖向滚动都同时用到这个方法，只能保证一个滚动区域有效，另一个会不滚动。  
使用 scrollIntoView() 方法配置如下：
```
this.$refs.tabItem[this.currentIndex].scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: 'nearest'
})
```
这里再横向滚动区域添加了一对左右按钮，实现切换功能，如图所示：

![](https://user-gold-cdn.xitu.io/2020/2/13/1703e7aebe13ca54?w=682&h=168&f=png&s=6247)

<center>切换按钮示例图</center> 

切换按钮事件方法就是通过改变上一个、下一个按钮下标，调用[单击按钮](#jump)方法，实现切换功能，切换事件方法逻辑如下：
```
tabBtnEvent (direction) {
  const max = this.$refs.tabItem.length
  if (direction === 'left' && this.currentIndex > 0) {
    this.currentIndex--
  }
  if (direction === 'right' && this.currentIndex < max - 1) {
    this.currentIndex++
  }
  <!--调用单击按钮事件-->
  this.tabEvent(this.$refs.tabItem[this.currentIndex], this.currentIndex)
},
```
下面对<span id="jump">单击按钮事件</span>添加居中逻辑，详细代码和解析图如下，可以对比查看：

![](https://user-gold-cdn.xitu.io/2020/2/13/1703ea766b7c4cbc?w=569&h=315&f=png&s=34723)
<center>居中计算图</center>  

```
tabEvent (item, currentIndex) {
  this.currentId = item.id
  this.currentIndex = currentIndex
  // 获取滚动容器的长度的一半，即中间点
  const scrollContainerHalfWidth = this.$refs.scrollContainer.offsetWidth / 2
  // 获取单个item的一半长度
  const tabItemHalfWidth = this.$refs.tabItem[currentIndex].offsetWidth / 2
  // 求取插值，就是开始到中间开始位置的距离
  const halfDistance = scrollContainerHalfWidth - tabItemHalfWidth
  // 求取当前item的相对总长度的偏移量
  const currentItemOffsetLeft = this.$refs.tabItem[currentIndex].offsetLeft
  // scroll 移动到中间的值
  const x = halfDistance - currentItemOffsetLeft
  this.myScroll.scrollTo(x, 0)
  this.$emit("switchTab", this.currentId, this.currentIndex)
},
```  
### 4、总结  
1、整个实例用的都是iscroll插件相关属性实现的滚动，避免同时使用JavaScript方法造成的代码混乱；  
2、利用自定义指令的方式有效的避免了传统实例化iscroll带来的代码冗余，使其方便简洁；  
3、本实例滚动选项都是字符串，如果出现图片的情况，合理使用iscroll.refresh()； 方法，合适时期重新计算滚动区域，避免滚动边界受限；  
4、附上代码 GitHub 地址 [vue中利用iscroll.js解决pc端滚动问题](https://github.com/yuelinghunyu/blog-demo/tree/master/scroll-demo)
