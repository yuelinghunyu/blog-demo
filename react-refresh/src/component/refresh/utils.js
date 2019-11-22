/**
 * @file utils.js
 * @author liyang@jingoal.com
 * @desc
 *
 *      工具函数
 * */

/**
 * 针对不同内核的浏览器对requestAnimationFrane做兼容处理
 * */
const requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    (callback => window.setTimeout(callback, 1000 / 60));
/**
 * 取消动画执行
 * */
const cancelAnimationFrame = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.clearTimeout;

/**
 * 缓存DIV元素的默认样式，为之后的兼容处理做准备
 * */
const elementStyle = document.createElement('div').style;

/**
 * 获取厂商前缀
 * */
const vendor = (() => {
    const vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'];
    const len = vendors.length;

    let transform;
    let i = 0;

    for (; i < len; i++) {
        transform = `${vendors[i]}ransform`;

        if (transform in elementStyle) {
            return vendors[i].substr(0, vendors[i].length - 1);
        }
    }

    return false;
})();

/**
 * 判断是否为坏的安卓手机
 * */
const isBadAndroid = (() => {
    const appVersion = window.navigator.appVersion;

    if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
        const safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
        if (safariVersion && typeof safariVersion === 'object' && safariVersion.length >= 2) {
            return parseFloat(safariVersion[1]) < 535.19;
        }
        return true;
    }
    return false;
})();

/**
 * 对transition、translate等属性做兼容处理
 * */
function prefixStyle(style) {
    if (vendor === false) return false;
    if (vendor === '') return style;
    return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}

const transform = prefixStyle('transform');

/**
 * 绑定事件的函数
 *
 * @param
 *      el - DOM元素
 *      type - 事件类型
 *      fn - 事件处理器
 *      capture - 捕获开关
 */
function addEvent(el, type, fn, capture) {
    el.addEventListener(type, fn, !!capture);
}

/**
 * 删除事件的函数
 *
 * @param
 *      el - DOM元素
 *      type - 事件类型
 *      fn - 事件处理器
 *      capture - 捕获开关
 * */
function removeEvent(el, type, fn, capture) {
    el.removeEventListener(type, fn, !!capture);
}

/**
 * 动量函数
 *
 * @param
 *      current - 当前位置
 *      start -  起始位置
 *      time - 持续事件
 *      lowerMargin - 滑块长度
 *      wrapperSize - 容器长度
 *      deceleration - 阻尼系数
 *
 * @return
 *      destination - 终点位置
 *      duration - 持续时间
 * */
function momentum(current, start, time, lowerMargin, wrapperSize, deceleration = 0.0006) {
    let distance = current - start;
    let destination;
    let duration;

    const speed = Math.abs(distance) / time;

    destination = current + (((speed * speed) / (2 * deceleration)) * (distance < 0 ? -1 : 1));
    duration = speed / deceleration;

    if (destination < lowerMargin) {
        destination = wrapperSize ? lowerMargin - ((wrapperSize / 2.5) * (speed / 8)) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
    } else if (destination > 0) {
        destination = wrapperSize ? (wrapperSize / 2.5) * (speed / 8) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
    }

    return {
        destination: Math.round(destination),
        duration
    };
}

const getTime = Date.now || (() => new Date().getTime());

/**
 * 计算偏移
 * */
function offset(el) {
    let left = -el.offsetLeft;
    let top = -el.offsetTop;

    while (el = el.offsetParent) { // eslint-disable-line no-cond-assign, no-param-reassign
        left -= el.offsetLeft;
        top -= el.offsetTop;
    }

    return {left, top}
}

function preventDefaultException(el, exceptions) {
    for (const i in exceptions) { // eslint-disable-line no-restricted-syntax
        if (exceptions[i].test(el[i])) {
            return true;
        }
    }

    return false;
}

function click(e) {
    var target = e.target,
        ev;

    if (!(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName)) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
        // initMouseEvent is deprecated.
        ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
        ev.initEvent('click', true, true,
            e.view || window,
            1,
            target.screenX || 0,
            target.screenY || 0,
            target.clientX || 0,
            target.clientY || 0,
            !!e.ctrlKey,
            !!e.altKey,
            !!e.shiftKey,
            !!e.metaKey,
            0,
            null
        );
        ev._constructed = true;
        target.dispatchEvent(ev);
    }
};


const style = {
    transform,
    transitionTimingFunction: prefixStyle('transitionTimingFunction'),
    transitionDuration: prefixStyle('transitionDuration'),
    transitionDelay: prefixStyle('transitionDelay'),
    transformOrigin: prefixStyle('transformOrigin')
};

const eventType = {
    touchstart: 1,
    touchmove: 1,
    touchend: 1
};

/**
 * 动画
 * */
/* eslint-disable */
const ease = {
    quadratic: {
        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fn: k => k * (2 - k)
    },
    circular: {
        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
        fn: k => Math.sqrt(1 - (--k * k))
    },
    back: {
        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fn: k => {
            const b = 4;
            return ((k = k-1) * k * (((b + 1) * k) + b)) + 1;
        }
    },
    bounce: {
        style: '',
        fn: k => {
            if ((k /= 1) < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }
        }
    },
    elastic: {
        style: '',
        fn: k => {
            var f = 0.22,
                e = 0.4;

            if (k === 0) { return 0; }
            if (k == 1) { return 1; }

            return (e * Math.pow(2, - 10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1);
        }
    }
}
/* eslint-enable */

const utils = {
    hasTransform: transform !== false,
    hasPerspective: prefixStyle('perspective') in elementStyle,
    hasTouch: 'ontouchstart' in window,
    hasTransition: prefixStyle('transition') in elementStyle,
    prefixStyle,
    addEvent,
    removeEvent,
    getTime,
    style,
    isBadAndroid,
    offset,
    momentum,
    preventDefaultException,
    eventType,
    ease,
    requestAnimationFrame,
    cancelAnimationFrame,
    click
}

export default utils;
