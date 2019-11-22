/**
 * @file Scroller.jsx
 * @author liyang@jingoal.com
 *
 * 滚动组件，用于提供滚动容器
 *
 * 滚动原理:
 * 该组件是通过提供一个容器（container）和一个滑块 (scroller) 实现的。容器必须有一个确定的高度才能正常工作，滑块通过两种方案实现滚动
 * 1、CSS3动画实现方案 transition + transform
 * 2、通过requestAnimationFrame + transform实现，这样做是为了更加精细的控制滚动过程，但是会稍微牺牲性能
 *
 * tip: 如果系统不支持transform，修改left、right、top、bottom值作为降级方案
 *
 * 功能:
 * 1、提供横向滚动、纵向滚动和自由滚动
 * 2、提供下拉刷新和上拉加载更多功能
 * */

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import utils from './utils';
import ICONS from './icons';
import {REFRESHSTATUS, LOADMORESTATUS} from './status';
import {getMessage} from './lang';
import PropTypes from 'prop-types'

import './Scroller.scss';

const boundaryThreshold = 5;

export default class Scroller extends Component {
    /*eslint-disable*/
    // 这里禁用了eslint语法检查：no-unused-prop-types，因为这些属性可能不是直接调用，有可能是传参调用，这时候esline语法检查不能通过
    static propTypes = {
        /**
         * 是否开启自动刷新属性
         * */
        autoRefresh: PropTypes.bool,
        /**
         * 是否开启滑动到底部自动加载
         * */
        autoLoad: PropTypes.bool,
        /**
         * 是否开启弹性滚动
         * */
        bounce: PropTypes.bool,
        /**
         * 自定义的弹性动画
         * */
        bounceEasing: PropTypes.shape({
            style: PropTypes.string.isRequired,
            fn: PropTypes.func.isRequired
        }),
        /**
         * 缓动时间
         * */
        bounceTime: PropTypes.number,
        /**
         * 阻尼系数
         * */
        deceleration: PropTypes.number,
        /**
         * 有时想要保留原生的垂直滚动，但是想要添加一个水平滚动的IScroll(例如：carousel), 可以把这个值设置为true，这样就可以响应
         * 水平方向的`swiper`，垂直滚动会滚动整个页面，同时也可以设置为`horizontal`或者`vertical`
         * */
        eventPassthrough: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.string
        ]),
        /**
         * 方向锁定阈值
         * */
        directionLockThreshold: PropTypes.number,
        /**
         * 是否开启自由滚动，当设置为`false`时，只能响应一个方向的滚动，当设置为true时，可以同时横向和纵向滚动（`scrollX`和`scrollY`
         * 必须同时为true）
         * */
        freeScroll: PropTypes.bool,
        /**
         * 当在屏幕上轻弹（flicks）时，是否开启动量
         * */
        momentum: PropTypes.bool,
        /**
         * 是否开启硬件加速
         * */
        HWCompositing: PropTypes.bool,
        /**
         * 是否阻止触发默认事件
         * */
        preventDefault: PropTypes.bool,
        /**
         * 阻止除了该类事件的默认事件
         * */
        preventDefaultException: PropTypes.shape({
            className: PropTypes.instanceOf(RegExp),
            tagName: PropTypes.instanceOf(RegExp)
        }),
        /**
         * 是否开启X轴滚动
         * */
        scrollX: PropTypes.bool,
        /**
         * 是否开启Y轴滚动
         * */
        scrollY: PropTypes.bool,
        /**
         * 是否使用transform
         * */
        useTransform: PropTypes.bool,
        /**
         * 是否使用transition
         * */
        useTransition: PropTypes.bool,
        /**
         * 开始滚动前的回调
         * */
        onBeforeScrollStart: PropTypes.func,
        /**
         * 开始滚动回调
         * */
        onScrollStart: PropTypes.func,
        /**
         * 滚动回调
         * */
        onScroll: PropTypes.func,
        /**
         * 滚动结束回调
         * */
        onScrollEnd: PropTypes.func,
        /**
         * 取消滚动回调
         * */
        onScrollCancel: PropTypes.func,
        /**
         * 刷新回调
         * */
        onRefresh: PropTypes.func,
        children: PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.element
        ]).isRequired,
        /**
         * 是否开启下拉刷新
         * */
        usePullRefresh: PropTypes.bool,
        /**
         * 是否开启上拉加载更多
         * */
        useLoadMore: PropTypes.bool,
        /**
         * 是否启用吸顶功能
         * */
        useSticky: PropTypes.bool,
        /**
         * 下拉刷新函数
         * */
        pullRefreshAction: PropTypes.func,
        /**
         * 上拉加载更多函数
         * */
        loadMoreAction: PropTypes.func,
        /**
         * 下拉刷新提示区域的渲染函数，允许用户自定义下拉刷新区域
         * */
        renderPullRefresh: PropTypes.func,
        /**
         * 上拉加载更多区域的渲染函数, 允许用户自定义上拉加载更多区域
         * */
        renderLoadMore: PropTypes.func,
        /**
         * 多语言
         * */
        lang: PropTypes.string,
        /**
         * 容器额外class 用于用户自定义容器样式
         * */
        containerClass: PropTypes.string,
        /**
         * 容器额外style 用于用户自定义容器样式
         * */
        containerStyle: PropTypes.shape({}),
        /**
         * 滑块额外class 用于用户自定义滑块的样式
         * */
        scrollerClass: PropTypes.string,
        /**
         * 滑块额外style 用于用户自定义滑块的样式
         * */
        scrollerStyle: PropTypes.shape({}),
        /**
         * 是否还有更多数据
         * */
        noMoreData: PropTypes.bool,
        click: PropTypes.bool
    };
    /*eslint-enable*/

    static defaultProps = {
        autoRefresh: true,
        autoLoad: true,
        bounce: true,
        bounceEasing: utils.ease.circular,
        bounceTime: 600,
        deceleration: 0.0024,
        directionLockThreshold: 0,
        freeScroll: false,
        momentum: true,
        HWCompositing: true,
        preventDefault: true,
        preventDefaultException: {
            tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/
        },
        scrollX: false,
        scrollY: true,
        containerStyle: {},
        scrollerStyle: {},
        containerClass: '',
        scrollerClass: '',
        useTransform: true,
        useTransition: true,
        usePullRefresh: false,
        useLoadMore: false,
        useSticky: false,
        click: false,
        lang: 'zh_CN'
    };

    static childContextTypes = {
        scroller: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.isIphone = (/iphone/gi).test(navigator.appVersion);
        // 重置属性
        this.resetProps();
        // 缓存个滑块的DOM节点
        this.loadTipElCache = this.getLoadTipElCache();
        // 初始化语言包
        this.lang = getMessage(props.lang);
    }

    getChildContext() {
        return {scroller: this};
    }

    componentDidMount() {
        // 缓存滑块的样式，提高效率
        this.scrollerStyle = this.scroller.style;

        if (this.props.usePullRefresh) {
            this.pullRefreshOffsetHeight = this.pullRefreshEl.offsetHeight;
        }

        if (this.props.useLoadMore) {
            this.loadMoreOffsetHeight = this.loadMoreEl.offsetHeight;
        }

        // 初始化事件
        this.initEvent();
        this.refresh();

        this.refreshSticky(true);
        if (this.stickyHeaders.length) this.useTransition = false;

        // 设置刷新、加载更多状态
        this.setRefreshStatus(REFRESHSTATUS.PULL);
        this.setLoadMoreStatus(this.loadMoreStatus || LOADMORESTATUS.PULL);
        // 重置加载更多
        this.refreshLoadMore();

        this.resetPosition();
    }

    componentWillReceiveProps(nextProps) {
        this.resetProps(nextProps, true);
    }

    componentDidUpdate(prevProp, prevState) {
        if (this.props.autoRefresh) this.refresh();

        this.refreshSticky();
        if (this.stickyHeaders.length) this.useTransition = false;

        // 重置 pullRefresh 和 loadMore
        if (prevState.usePullRefresh !== this.state.usePullRefresh) {
            this.setRefreshStatus(REFRESHSTATUS.PULL);
        }
        if (prevState.useLoadMore !== this.state.useLoadMore ||
            prevState.noMoreData !== this.props.noMoreData
        ) {
            this.setLoadMoreStatus(this.loadMoreStatus || LOADMORESTATUS.PULL);
            this.refreshLoadMore();
        }
    }

    componentWillUnmount() {
        this.initEvent(true);
    }

    /**
     * 设置下拉刷新的状态
     * @param status [Number] 下拉刷新的状态
     * @param callback [Function] 修改完状态后的执行的回调函数
     * */
    setRefreshStatus(status) {
        if (!this.state.usePullRefresh) return;

        // 保存之前的状态
        this.prevRefreshState = this.pullRefreshStatus;
        this.pullRefreshStatus = status;

        const iconEl = this.loadTipElCache.querySelector('i');
        const textEl = this.loadTipElCache.querySelector('div');
        let cssText = '';

        switch (status) {
            case REFRESHSTATUS.PULL:
                textEl.innerHTML = this.lang.pullDownToRefresh;
                if (this.prevRefreshState === REFRESHSTATUS.RELEASE) {
                    iconEl.innerHTML = ICONS.upArrow;
                    cssText = 'transform: rotate(-180deg); -webkit-transform: rotate(-180deg);';
                } else {
                    iconEl.innerHTML = ICONS.downArrow;
                }
                break;
            case REFRESHSTATUS.RELEASE:
                textEl.innerHTML = this.lang.releaseToLoadMore;
                if (this.prevRefreshState === REFRESHSTATUS.PULL) {
                    iconEl.innerHTML = ICONS.downArrow;
                    cssText = 'transform: rotate(180deg); -webkit-transform: rotate(180deg);';
                } else {
                    iconEl.innerHTML = ICONS.upArrow;
                }
                break;
            case REFRESHSTATUS.LOAD:
                textEl.innerHTML = this.lang.loading;
                iconEl.innerHTML = ICONS.loading;
                cssText = 'animation: rotate 1s linear infinite; -webkit-animation: rotate 1s linear infinite';
                break;
            case REFRESHSTATUS.SUCCESS:
                textEl.innerHTML = this.lang.refreshSuccess;
                iconEl.innerHTML = ICONS.success;
                break;
            case REFRESHSTATUS.FAIL:
                textEl.innerHTML = this.lang.refreshFailed;
                iconEl.innerHTML = ICONS.error;
                break;
            default:
                console.warn('Unsupported state!');
                break;
        }

        this.pullRefreshEl.replaceChild(
            this.loadTipElCache.cloneNode(true),
            this.pullRefreshEl.childNodes[0]
        );

        const icon = this.pullRefreshEl.querySelector('i');
        setTimeout(() => {
            icon.style.cssText = cssText;
        }, 0);
    }

    /**
     * 设置上拉加载更多的状态
     * @param status [Number] 上拉加载更多的状态
     * @param callback [Function] 修改完状态后的执行的回调函数
     * */
    setLoadMoreStatus(status) {
        if (!this.state.useLoadMore) return;

        // 保存之前的状态
        this.prevLoadState = this.loadMoreStatus;
        this.loadMoreStatus = status;

        const iconEl = this.loadTipElCache.querySelector('i');
        const textEl = this.loadTipElCache.querySelector('div');
        let cssText = '';

        switch (status) {
            case LOADMORESTATUS.PULL:
                textEl.innerHTML = this.lang.pullupToLoadMore;
                if (this.prevLoadState === LOADMORESTATUS.RELEASE) {
                    iconEl.innerHTML = ICONS.downArrow;
                    cssText = 'transform: rotate(180deg); -webkit-transform: rotate(180deg);';
                } else {
                    iconEl.innerHTML = ICONS.upArrow;
                }
                break;
            case LOADMORESTATUS.RELEASE:
                textEl.innerHTML = this.lang.releaseToLoadMore;
                if (this.prevLoadState === LOADMORESTATUS.PULL) {
                    iconEl.innerHTML = ICONS.upArrow;
                    cssText = 'transform: rotate(-180deg); -webkit-transform: rotate(-180deg);';
                } else {
                    iconEl.innerHTML = ICONS.downArrow;
                }
                break;
            case LOADMORESTATUS.LOAD:
                textEl.innerHTML = this.lang.loading;
                iconEl.innerHTML = ICONS.loading;
                cssText = 'animation: rotate 1s linear infinite; -webkit-animation: rotate 1s linear infinite';
                break;
            case LOADMORESTATUS.NOMORE:
                textEl.innerHTML = this.lang.noMoreData;
                iconEl.innerHTML = '';
                break;
            default:
                console.warn('Unsupported state!');
                break;
        }

        this.loadMoreEl.replaceChild(
            this.loadTipElCache.cloneNode(true),
            this.loadMoreEl.firstChild
        );

        const icon = this.loadMoreEl.querySelector('i');
        setTimeout(() => {
            icon.style.cssText = cssText;
        }, 0);
    }

    /**
     * 获取loadTip的DOM缓存
     * */
    getLoadTipElCache() {
        const dom = document.createElement('div');

        dom.className = 'silk-listcontrol-loadtip';
        dom.innerHTML = '<i class="silk-listcontrol-icon"></i><div class="silk-listcontrol-text"></div>';

        return dom;
    }

    /**
     * 获取当前的置顶块
     * */
    getCurrentSticky() {
        let ret = null;
        if (this.y < 0) {
            const absY = Math.abs(this.y);
            const wrapperTop = this.wrapperOffsetTop;
            const upperHeaders = this.stickyHeaders.filter(
                header => header.offsetTop - wrapperTop <= absY
            );

            if (upperHeaders.length) {
                const currentHeader = upperHeaders[upperHeaders.length - 1];
                const nextHeader = this.stickyHeaders[upperHeaders.length];
                const index = upperHeaders.length - 1;
                if (nextHeader) {
                    const distToNext = nextHeader.offsetTop - wrapperTop - absY;
                    const adjustOffset = distToNext > currentHeader.height ?
                        0 : -(currentHeader.height - distToNext);
                    ret = {currentHeader, adjustOffset, index};
                } else {
                    ret = {currentHeader, adjustOffset: 0, index};
                }
            } else {
                ret = null;
            }
        } else {
            ret = null;
        }
        return ret;
    }

    /**
     * 获取计算样式
     * */
    getComputedPosition() {
        let matrix = window.getComputedStyle(this.scroller, null);
        let x;
        let y;

        if (this.useTransform) {
            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = +matrix.left.replace(/[^-\d.]/g, '');
            y = +matrix.top.replace(/[^-\d.]/g, '');
        }

        return {x, y};
    }

    /**
     * 刷新置顶块
     * */
    refreshSticky(forceRefresh) {
        if (this.stickyHeaders.length) {
            const currentSticky = this.getCurrentSticky();
            const stickyNode = this.stickyNode;

            if (currentSticky) {
                const {currentHeader, adjustOffset} = currentSticky;

                if (currentSticky.index !== this.stickyIndex ||
                    currentSticky.adjustOffset !== this.stickyOffset ||
                    forceRefresh
                ) {
                    const transform = `translate(0px,${adjustOffset}px) translateZ(0px)`;
                    stickyNode.style.transform = transform;
                    stickyNode.style.WebkitTransform = transform;
                    stickyNode.style.display = 'block';
                    stickyNode.className = currentHeader.stickyExtraClass;
                    ReactDOM.render(React.cloneElement(currentHeader.onlyChild), stickyNode);

                    this.stickyIndex = currentSticky.index;
                    this.stickyOffset = currentSticky.adjustOffset;
                }
            } else {
                this.stickyIndex = null;
                this.stickyOffset = null;
                stickyNode.style.display = 'none';
            }
        }
    }

    /**
     * touchStart事件处理器
     * @param e [Event] 事件对象
     * */
    touchStart(e) {
        if (this.disabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) return;

        if (this.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.props.preventDefaultException)
        ) {
            e.preventDefault();
        }

        const point = e.touches ? e.touches[0] : e;
        let pos;

        this.initiated = utils.eventType[e.type];
        this.moved = false;
        this.distX = 0;
        this.distY = 0;
        this.directionX = 0;
        this.directionY = 0;
        this.directionLocked = 0;

        // 取得touchStart的时间
        this.startTime = utils.getTime();

        // 如果支持transition并且正在执行transition动画
        if (this.useTransition && this.isInTransition) {
            // 将动画暂停
            this.transitionTime();
            // 将IScroll的状态修改一下
            this.isInTransition = false;
            // 得到计算的位置
            pos = this.getComputedPosition();
            this.translate(Math.round(pos.x), Math.round(pos.y));
            // 停止滚动
            this.execEvent('onScrollEnd');
        } else if (!this.useTransition && this.isAnimating) {
            // 设置为false后  requestAnimationFrame不会在执行
            this.isAnimating = false;
            utils.cancelAnimationFrame.call(window, this.rAF);
            this.execEvent('onScrollEnd');
        }

        // 将当前位置设置为开始滚动的初始位置
        this.startX = this.x;
        this.startY = this.y;
        this.absStartX = this.x;
        this.absStartY = this.y;
        // 手指的位置
        this.pointX = point.pageX;
        this.pointY = point.pageY;
        // 触发钩子  beforeScrollStart
        this.execEvent('onBeforeScrollStart');
    }

    /**
     * touchMove事件处理器
     * @param e [Event] 事件对象
     * */
    touchMove(e) {
        if (this.disabled || utils.eventType[e.type] !== this.initiated) return;

        if (this.preventDefault) e.preventDefault();

        const point = e.touches ? e.touches[0] : e;
        const timestamp = utils.getTime();
        // 手指在X／Y轴上的增量
        let deltaX = point.pageX - this.pointX;
        let deltaY = point.pageY - this.pointY;
        let newX;
        let newY;

        // 更新pointX 和 pointY
        this.pointX = point.pageX;
        this.pointY = point.pageY;

        this.distX += deltaX;
        this.distY += deltaY;
        const absDistX = Math.abs(this.distX);
        const absDistY = Math.abs(this.distY);

        // 如果时间间隔相差300ms 并且 实际滚动的距离小于10像素
        if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) return;

        // 只让其在一个方向上滚动  directionLocked 初始值为0  directionLockThreshold = 5
        if (!this.directionLocked && !this.freeScroll) {
            // 如果水平方向移动的绝对值 > 垂直方向移动的绝对值 + 5 则直接锁定运动方向为水平方向
            if (absDistX > absDistY + this.directionLockThreshold) {
                this.directionLocked = 'h'; // 锁住水平方向的滚动
            } else if (absDistY >= absDistX + this.directionLockThreshold) {
                this.directionLocked = 'v'; // 锁住垂直方向的滚动
            } else {
                this.directionLocked = 'n'; // 不锁
            }
        }

        // 有些时候你想保留原生纵向的滚动条但想为横向滚动条增加iScroll功能（比如走马灯）。
        // 设置这个属性为true并且iScroll区域只将影响横向滚动，纵向滚动将滚动整个页面。
        if (this.directionLocked === 'h') {
            // 水平方向滚动时 锁住 全局垂直滚动
            if (this.eventPassthrough === 'vertical') {
                e.preventDefault();
            } else if (this.eventPassthrough === 'horizontal') {
                this.initiated = false;
                // 若为是水平方向的eventPassthrough，将启动设置为false 则永远不会执行_move函数
                return;
            }
            // 始终将Y方向的位移设置为0
            deltaY = 0;
        } else if (this.directionLocked === 'v') {
            if (this.eventPassthrough === 'horizontal') {
                e.preventDefault();
            } else if (this.eventPassthrough === 'vertical') {
                this.initiated = false;
                return;
            }
            deltaX = 0;
        }

        // 允许垂直或者水平滚动时 才会将deltaX deltaY赋值 否则为0
        deltaX = this.hasHorizontalScroll ? deltaX : 0;
        deltaY = this.hasVerticalScroll ? deltaY : 0;

        // 新的位置
        newX = this.x + deltaX;
        newY = this.y + deltaY;

        // 如果超出了边界则放慢速度
        if (newX > 0 || newX < this.maxScrollX) {
            newX = this.props.bounce ? // eslint-disable-line no-nested-ternary
            this.x + (deltaX / 3) : newX > 0 ? 0 : this.maxScrollX;
        }
        // 大于0  则说明拉到下边位置了  或者已经超出了顶端
        if (newY > 0 || newY < this.maxScrollY) {
            newY = this.props.bounce ? // eslint-disable-line no-nested-ternary
            this.y + (deltaY / 3) : newY > 0 ? 0 : this.maxScrollY;
        }

        // 设置方向 若 deltaX大于0  说明是在向下滑动  小于0 向上滑动  等于0 不动
        this.directionX = deltaX > 0 ? // eslint-disable-line no-nested-ternary
            -1 : deltaX < 0 ? 1 : 0;
        this.directionY = deltaY > 0 ? // eslint-disable-line no-nested-ternary
            -1 : deltaY < 0 ? 1 : 0;

        // 如果现在还没动 就执行钩子函数  scrollStart
        if (!this.moved) {
            this.execEvent('onScrollStart');
        }

        // 将其设置为true
        this.moved = true;

        // 运动到新的位置
        this.translate(newX, newY);

        // 如果propbeType = 1 最少大于300ms执行一次scroll事件
        if (timestamp - this.startTime > 300) {
            // 更新开始时间
            this.startTime = timestamp;
            // 更新起始位置
            this.startX = this.x;
            this.startY = this.y;
        }

        this.execEvent('onScroll');
    }

    /**
     * touchEnd事件处理器
     * @param e [Event] 事件对象
     * */
    touchEnd(e) {
        if (this.disabled || utils.eventType[e.type] !== this.initiated) return;

        if (this.preventDefault && !utils.preventDefaultException(e.target, this.props.preventDefaultException)
        ) {
            e.preventDefault();
        }

        let momentumX;
        let momentumY;
        const duration = utils.getTime() - this.startTime;
        let newX = Math.round(this.x);
        let newY = Math.round(this.y);
        let time = 0;
        let easing;

        this.isInTransition = 0;
        this.initiated = 0;
        this.endTime = utils.getTime();

        if (!this.moved) {
            if ( this.props.click ) {
                utils.click(e);
            }

            this.execEvent('onScrollCancel');
            return;
        }

        // 设置下拉刷新
        if (this.state.usePullRefresh && this.y >= this.pullRefreshOffsetHeight) {
            if (this.pullRefreshStatus === REFRESHSTATUS.LOAD) {
                this.scrollTo(this.x, this.pullRefreshOffsetHeight, 200);
            } else {
                this.setRefreshStatus(REFRESHSTATUS.LOAD)
                this.scrollTo(this.x, this.pullRefreshOffsetHeight, 300);
                this.loadData('refresh');
            }
            return;
        }

        // 设置加载更多
        if (this.state.useLoadMore && this.y < this.maxScrollY) {
            if (this.loadMoreStatus !== LOADMORESTATUS.NOMORE &&
                this.loadMoreStatus !== LOADMORESTATUS.LOAD && !this.props.noMoreData
            ) {
                this.setLoadMoreStatus(LOADMORESTATUS.LOAD);
                this.loadData('load');
            }
        }

        // 如果超出边界 需要重置
        if (this.resetPosition(this.props.bounceTime)) return;

        this.scrollTo(newX, newY);

        // 如果需要的话开始动量动画
        if (this.props.momentum && duration < 300) {
            momentumX = this.hasHorizontalScroll ?
                utils.momentum(this.x, this.startX, duration, this.maxScrollX,
                    this.props.bounce ? this.wrapperWidth : 0,
                    this.props.deceleration) :
            {destination: newX, duration: 0};
            momentumY = this.hasVerticalScroll ?
                utils.momentum(this.y, this.startY, duration, this.maxScrollY,
                    this.props.bounce ? this.wrapperHeight : 0,
                    this.props.deceleration) :
            {destination: newY, duration: 0};

            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
            this.isInTransition = 1;
        }

        if (newX !== this.x || newY !== this.y) {
            // 当超出边界时 改变缓动函数
            if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                easing = utils.ease.quadratic;
            }

            this.scrollTo(newX, newY, time, easing);
            return;
        }

        this.execEvent('onScrollEnd');
    }

    /**
     * transitionEnd事件处理器
     * @param e [Event] 事件对象
     * */
    transitionEnd(e) {
        if (e.target !== this.scroller || !this.isInTransition) return;

        this.transitionTime();

        // resetPosition 位置没变  返回false  变了返回true
        if (!this.resetPosition(this.props.bounceTime)) {
            this.isInTransition = false;
            this.execEvent('onScrollEnd');
        }
    }

    /**
     * 绑定/删除事件
     * @param flag [boolean] 标识是添加事件还是删除事件
     * */
    initEvent(flag) {
        const eventType = flag ? utils.removeEvent : utils.addEvent;

        if ( this.props.click ) {
            eventType(this.wrapper, 'click', this, true);
        }

        if (utils.hasTouch) {
            eventType(this.wrapper, 'touchstart', this);
            eventType(window, 'touchmove', this);
            eventType(window, 'touchend', this);
            eventType(window, 'touchcancel', this);
            eventType(this.scroller, utils.prefixStyle('transitionend'), this);
        } else {
            console.warn('your device did not support touch event!')
        }
    }

    /**
     * 执行绑定的事件
     * @param eventType [String] 需要执行的事件名称
     * @param param [Object] 执行事件处理函数传入的参数
     * */
    execEvent(eventType, param) {
        if (eventType === 'onScrollStart') {
            this.isScrolling = true;
        }
        if (eventType === 'onScroll') {
            this.refreshSticky();
            if (this.pullRefreshStatus === REFRESHSTATUS.PULL ||
                this.pullRefreshStatus === REFRESHSTATUS.RELEASE
            ) {
                this.hasVerticalScroll = true;
            } else if ((this.pullRefreshStatus === REFRESHSTATUS.SUCCESS ||
                this.pullRefreshStatus === REFRESHSTATUS.FAIL) &&
                this.y > 0
            ) {
                this.hasVerticalScroll = false;
            }

            if (this.isIphone && ((this.scrollY && (this.pointY < boundaryThreshold ||
                this.pointY > document.documentElement.clientHeight - boundaryThreshold)) ||
                (this.scrollX && (this.pointX < boundaryThreshold ||
                    this.pointX > document.documentElement.clientWidth - boundaryThreshold)
                ))) {
                const ev = document.createEvent('Event');
                ev.initEvent('touchend', true, true);
                document.dispatchEvent(ev);
            }
        }
        if (eventType === 'onScrollEnd') {
            this.refreshSticky();
            this.isScrolling = false;
            this.hasVerticalScroll = this.props.scrollY && this.maxScrollY < 0;
        }
        if (this.props[eventType]) {
            this.props[eventType].apply(this, [{
                contentOffset: {
                    x: this.x,
                    y: this.y
                },
                param
            }]);
        }
    }

    /**
     * 重置滑块的位置
     * @param time [Number] 重置位置所需要的时间，单位ms
     * */
    resetPosition(time = 0) {
        let x = this.x;
        let y = this.y;

        if (this.pullRefreshStatus === REFRESHSTATUS.LOAD &&
            this.y === this.pullRefreshOffsetHeight
        ) {
            return false;
        }

        if (!this.hasHorizontalScroll || this.x > 0) {
            x = 0;
        } else if (this.x < this.maxScrollX) {
            x = this.maxScrollX;
        }

        if (!this.hasVerticalScroll || this.y > 0) {
            y = 0
        } else if (this.y < this.maxScrollY) {
            y = this.maxScrollY;
        }

        // 做一层优化，如果没动，直接返回
        if (x === this.x && y === this.y) {
            return false;
        }

        this.scrollTo(x, y, time, this.props.bounceEasing);

        return true;
    }

    /**
     * 滚动到某个位置
     * @param x [Number] 沿X轴滚动的位置
     * @param y [Number] 沿Y轴滚动的位置
     * @param time [Number] 滚动到具体的位置所需要的时间
     * @param easing [Object] 滚动的缓动函数
     * */
    scrollTo(x = this.x, y = this.y, time = 0, easing = utils.ease.circular) {
        // 判断组件是不是处于transition状态
        this.isInTransition = this.useTransition && time > 0;
        const transitionType = this.useTransition && easing.style;

        if (!time || transitionType) {
            if (transitionType) {
                this.transitionTimingFunction(easing.style);
                this.transitionTime(time);
            }
            this.translate(x, y);
        } else {
            this.animate(x, y, time, easing.fn);
        }
    }

    /**
     * 滚动动画的时间函数
     * @param easing [Object] 缓动函数
     * */
    transitionTimingFunction(easing) {
        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
    }

    /**
     * 滚动到具体位置所需要的时间
     * @param time [Number] 滚动时间
     * */
    transitionTime(time = 0) {
        if (!this.useTransition) return;

        const durationProp = utils.style.transitionDuration;
        if (!durationProp) return;

        // 滑块的样式  将滑块的transitionDuration样式属性设置一下，如果时间为0 则瞬间停止
        this.scrollerStyle[durationProp] = `${time}ms`;

        // time为0 并且是不支持的安卓
        if (!time && utils.isBadAndroid) {
            // 则将transitionDuration属性设置为极短
            this.scrollerStyle[durationProp] = '0.0001ms';
            self.rAF = requestAnimationFrame.call(window, () => {
                if (this.scrollerStyle[durationProp] === '0.0001ms') {
                    this.scrollerStyle[durationProp] = '0s';
                }
            });
        }
    }

    /**
     * 位移函数
     * @param x [Number] x轴方向的位移
     * @param y [Number] y轴方向的位移
     * */
    translate(x, y) {
        x = Math.round(x); // eslint-disable-line no-param-reassign
        y = Math.round(y); // eslint-disable-line no-param-reassign

        // 如果支持transform这使用，不支持就使用left top
        if (this.useTransform) {
            this.scrollerStyle[utils.style.transform] = `translate(${x}px, ${y}px) ${this.translateZ}`;
        } else {
            this.scrollerStyle.left = `${x}px`;
            this.scrollerStyle.top = `${y}px`;
        }

        // 重置x,y的值
        this.x = x;
        this.y = y;

        if (this.state.usePullRefresh) {
            if (y >= this.pullRefreshOffsetHeight &&
                this.pullRefreshStatus === REFRESHSTATUS.PULL
            ) {
                this.setRefreshStatus(REFRESHSTATUS.RELEASE);
            } else if (y < this.pullRefreshOffsetHeight &&
                this.pullRefreshStatus === REFRESHSTATUS.RELEASE
            ) {
                this.setRefreshStatus(REFRESHSTATUS.PULL);
            }
        }

        if (this.state.useLoadMore) {
            if (y < this.maxScrollY &&
                this.loadMoreStatus === LOADMORESTATUS.PULL
            ) {
                if (this.props.autoLoad) {
                    // 取消动画,执行加载过程
                    if (this.useTransition && this.isInTransition) {
                        // 将动画暂停
                        this.transitionTime();
                        // 将IScroll的状态修改一下
                        this.isInTransition = false;
                        // 得到计算的位置
                        const pos = this.getComputedPosition();
                        this.translate(Math.round(pos.x), Math.round(pos.y));
                        // 停止滚动
                        this.execEvent('onScrollEnd');
                    } else if (!this.useTransition && this.isAnimating) {
                        // 设置为false后  requestAnimationFrame不会在执行
                        this.isAnimating = false;
                        utils.cancelAnimationFrame.call(window, this.rAF);
                        this.execEvent('onScrollEnd');
                    }
                    // 设置加载更多
                    if (this.state.useLoadMore && this.y < this.maxScrollY) {
                        if (this.loadMoreStatus !== LOADMORESTATUS.NOMORE &&
                            this.loadMoreStatus !== LOADMORESTATUS.LOAD && !this.props.noMoreData
                        ) {
                            this.setLoadMoreStatus(LOADMORESTATUS.LOAD);
                            this.loadData('load');
                        }
                    }

                    // 如果超出边界 需要重置
                    this.resetPosition(this.props.bounceTime);
                } else {
                    this.setLoadMoreStatus(LOADMORESTATUS.RELEASE);
                }
            } else if (y >= this.maxScrollY &&
                this.loadMoreStatus === LOADMORESTATUS.RELEASE
            ) {
                this.setLoadMoreStatus(LOADMORESTATUS.PULL);
            }
        }
    }

    /**
     * 模拟下拉刷新
     * @param time [Number] 滚动时间
     * */
    simulatePullRefresh(time = 300) {
        if (this.state.usePullRefresh && this.prevRefreshState !== REFRESHSTATUS.LOAD) {
            this.scrollTo(this.x, this.pullRefreshOffsetHeight, time);
            setTimeout(() => {
                this.setRefreshStatus(REFRESHSTATUS.LOAD);
                this.loadData('refresh');
            }, time);
        }
    }

    /**
     * 禁用Scroller组件
     * */
    disable() {
        this.disabled = true;
    }

    /**
     * 启用Scroller组件
     * */
    enable() {
        this.disabled = false;
    }

    /**
     * 加载数据
     * @param type [String] 是上拉还是下拉加载数据
     * */
    loadData(type) {
        const promise = new Promise((resolve, reject) => {
            if (type === 'refresh') {
                this.props.pullRefreshAction(resolve, reject);
            } else {
                this.props.loadMoreAction(resolve, reject);
            }
        });

        promise
            .then(() => {
                this.loadDataHandle(type, 3);
            })
            .catch(() => {
                this.loadDataHandle(type, 4);
            });
    }

    /**
     * 数据加载完成后执行的操作
     * @param type [String] 是上拉还是下拉加载数据
     * @param code [Number] 请求状态，标识成功还是失败
     * */
    loadDataHandle(type, code) {
        if (type === 'refresh') {
            this.setRefreshStatus(this.pullRefreshStatus = code);
            setTimeout(() => {
                this.setRefreshStatus(this.pullRefreshStatus = REFRESHSTATUS.PULL);
                this.scrollTo(0, 0, 400);
                this.refresh();
            }, 400);
        } else {
            this.loadMoreStatus = this.props.noMoreData ?
                LOADMORESTATUS.NOMORE :
                LOADMORESTATUS.PULL;
            this.setLoadMoreStatus(this.loadMoreStatus);
            this.refresh();
        }
    }

    /**
     * 刷新
     * @param refreshOption [Object]
     *     wrapperWidth: 容器的宽度
     *     wrapperHeight: 容器的高度
     *     scrollerWidth: 滑块的宽度
     * */
    refresh(refreshOption = {}) {
        // 容器的宽高
        this.wrapperWidth = refreshOption.wrapperWidth ?
            refreshOption.wrapperWidth :
            this.wrapper.clientWidth;
        this.wrapperHeight = refreshOption.wrapperHeight ?
            refreshOption.wrapperHeight :
            this.wrapper.clientHeight;
        // 容器上边缘到顶部的距离
        this.wrapperOffsetTop = -utils.offset(this.wrapper).top;

        // 滑块的宽高
        this.scrollerWidth = refreshOption.scrollerWidth ?
            refreshOption.scrollerWidth :
            this.scroller.offsetWidth;
        this.scrollerHeight = refreshOption.scrollerHeight ?
            refreshOption.scrollerHeight :
            this.scroller.offsetHeight;

        // 如果有加载更多，设置加载更多的位置，重置加载更多滑块的位置
        if (this.state.useLoadMore && this.loadMoreEl) {
            this.loadMoreEl.style.visibility = this.scrollerHeight > this.wrapperHeight ? 'visible' : 'hidden';
            this.loadMoreEl.style.top = `${this.scrollerHeight}px`;
            this.scrollerHeight += this.loadMoreOffsetHeight;
        }

        // 可滑动的最大宽高
        this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
        this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

        // 是否可以水平、垂直滚动
        this.hasHorizontalScroll = this.props.scrollX && this.maxScrollX < 0;
        this.hasVerticalScroll = this.props.scrollY && this.maxScrollY < 0;

        if (!this.hasHorizontalScroll) {
            this.maxScrollX = 0;
            this.scrollerWidth = this.wrapperWidth;
        }

        if (!this.hasVerticalScroll) {
            this.maxScrollY = 0;
            this.scrollerHeight = this.wrapperHeight;
        }

        // 初始化终止时间，当滚动的时候需要
        this.endTime = 0;
        this.directionX = 0;
        this.directionY = 0;

        // 触发用户自定义的刷新事件
        this.execEvent('onRefresh');
    }

    /**
     * 动画函数
     * @param destX [Number] 目的地X方向位置
     * @param destY [Number] 目的地Y方向位置
     * @param duration [Number] 持续时间
     * @param easingFn [Function] 缓动函数
     * */
    animate(destX, destY, duration, easingFn) {
        const self = this;
        const startX = this.x;
        const startY = this.y;
        const startTime = utils.getTime();
        const destTime = startTime + duration;

        function step() {
            let now = utils.getTime();

            // 如果当前时间大于持续时间，则结束动画
            if (now >= destTime) {
                self.isAnimating = false;
                self.translate(destX, destY);
                utils.cancelAnimationFrame.call(window, self.rAF);

                if (!self.resetPosition(self.props.bounceTime)) {
                    self.execEvent('onScrollEnd');
                }
                return;
            }

            now = (now - startTime) / duration;
            const easing = easingFn(now);
            const newX = ((destX - startX) * easing) + startX;
            const newY = ((destY - startY) * easing) + startY;

            self.translate(newX, newY);

            if (self.isAnimating) {
                self.rAF = utils.requestAnimationFrame.call(window, step);
            }

            self.execEvent('onScroll');
        }

        this.isAnimating = true;
        step();
    }

    /**
     * addEventListener() 方法是将指定的事件监听器注册到目标对象上，当该对象触发指定的事件时，指定的回调函数就会被执行。
     * 第二个参数除传入的是函数外，还可以传入对象，但是该对象中必须有 handleEvent函数，函数中的this指向该对象
     * 可以动态切换绑定事件的处理函数，而不需要remove之前的事件。
     * */
    handleEvent(e) {
        switch (e.type) {
            case 'touchstart':
                this.touchStart(e);
                break;
            case 'touchmove':
                this.touchMove(e);
                break;
            case 'touchend':
            case 'touchcancel':
                this.touchEnd(e);
                break;
            case 'transitionend':
            case 'webkitTransitionEnd':
            case 'oTransitionEnd':
            case 'MSTransitionEnd':
                this.transitionEnd(e);
                break;
            default:
                console.warn('no match event type!');
                break;
        }
    }

    refreshLoadMore() {
        if (!this.state.useLoadMore) {
            this.resetPosition();
        } else if (this.loadMoreEl) {
            this.loadMoreEl.style.top = `${this.scrollerHeight - this.loadMoreOffsetHeight}px`;
        }
    }

    /**
     * 重置属性
     * @param props [Object] 需要重置的样式的对象
     * @param isInit [Boolean] 重置样式时是组件是否已经初始化
     * */
    resetProps(props = this.props, isInit = false) {
        // 根据设备的支持情况，重置下面属性
        this.translateZ = props.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';
        this.useTransition = utils.hasTransition && props.useTransition;
        this.useTransform = utils.hasTransform && props.useTransform;

        // 是否允许垂直或者水平方向原生的滚动
        this.eventPassthrough = props.eventPassthrough === true ? 'vertical' : props.eventPassthrough;
        // 是否组织默认事件
        this.preventDefault = !this.eventPassthrough && props.preventDefault;
        // 是否允许自由滚动
        this.freeScroll = props.freeScroll && !this.eventPassthrough;
        // 方向锁阈值
        this.directionLockThreshold = this.eventPassthrough ? 0 : props.directionLockThreshold;
        // 是否允许在X轴或者Y轴方向滚动
        this.scrollX = this.eventPassthrough === 'horizontal' ? false : props.scrollX;
        this.scrollY = this.eventPassthrough === 'vertical' ? false : props.scrollY;

        this.bounceEasing = typeof bounceEasing === 'string' ?
        utils.ease[this.props.bounceEasing] || utils.ease.circular :
            this.props.bounceEasing;

        if (this.props.onScroll) {
            this.useTransition = false;
        }

        // 重置 下拉刷新 和 加载更多
        const isUsePullRefresh = this.scrollY && !this.scrollX && this.props.usePullRefresh;
        const isUseLoadMore = this.scrollY && !this.scrollX && this.props.useLoadMore;

        let loadMoreStatus;

        if (isUseLoadMore && props.noMoreData) {
            loadMoreStatus = LOADMORESTATUS.NOMORE;
        } else {
            loadMoreStatus = LOADMORESTATUS.PULL;
        }

        if (isInit) {
            this.setState({
                usePullRefresh: isUsePullRefresh,
                useLoadMore: isUseLoadMore,
            });
            this.pullRefreshStatus = isUsePullRefresh ? this.pullRefreshStatus : 0;
            this.loadMoreStatus = loadMoreStatus;
        } else {
            this.state = {
                usePullRefresh: isUsePullRefresh,
                useLoadMore: isUseLoadMore,
            };
            this.pullRefreshStatus = REFRESHSTATUS.PULL;
            this.loadMoreStatus = loadMoreStatus;
        }
    }

    /**
     * 滑块左上角顶点的坐标
     * */
    x = 0;
    y = 0;

    /**
     * 滑块滑动的方向
     * */
    directionX = 0;
    directionY = 0;

    /**
     * 滑块的样式缓存，用于提高效率
     * */
    scrollerStyle = {};

    /**
     * 放置置顶元素的数组
     * */
    stickyHeaders = [];

    /**
     * 当前显示的置顶元素的索引值
     * */
    stickyIndex = 0;

    /**
     * 置顶元素的偏移
     * */
    stickyOffset = 0;

    /**
     * 容器的偏移
     * */
    wrapperOffsetTop = 0;

    /**
     * 渲染函数
     * */
    render() {
        const {
            usePullRefresh,
            useLoadMore
        } = this.state;

        return (
            <div
                className={classNames(
                    'silk-listcontrol-wrapper',
                    {
                        'silk-listcontrol-wrapper-default': this.scrollY && !this.props.containerClass
                    },
                    this.props.containerClass
                )}
                style={this.props.containerStyle}
                ref={ref => { this.wrapper = ref }}
            >
                {
                    this.props.useSticky ?
                        <div
                            ref={ref => { this.stickyNode = ref }}
                            style={
                                { 
                                    position: 'absolute', 
                                    top: '0.5rem', 
                                    left: 0, 
                                    right: 0, 
                                    zIndex: 9999 
                                }
                            }
                            className="silk-sticky"
                        /> : null
                }
                <div
                    className={classNames(
                        'silk-listcontrol-scroller',
                        {
                            'silk-listcontrol-scroller-horizontal': this.scrollX,
                            'silk-listcontrol-scroller-vertical': this.scrollY
                        },
                        this.props.scrollerClass
                    )}
                    style={this.props.scrollerStyle}
                    ref={ref => { this.scroller = ref }}
                >
                    {
                        usePullRefresh ?
                            (<div
                                ref={ref => { this.pullRefreshEl = ref }}
                                className="silk-listcontrol-loadwrapper silk-listcontrol-loadwrapper-up"
                            >
                                <div className="silk-listcontrol-loadtip">
                                    <i className="silk-listcontrol-icon"/>
                                    <div className="silk-listcontrol-text"/>
                                </div>
                            </div>) : null
                    }
                    {this.props.children}
                    {
                        useLoadMore ?
                            (<div
                                ref={ref => { this.loadMoreEl = ref }}
                                className="silk-listcontrol-loadwrapper"
                            >
                                <div className="silk-listcontrol-loadtip">
                                    <i className="silk-listcontrol-icon"/>
                                    <div className="silk-listcontrol-text"/>
                                </div>
                            </div>) : null
                    }
                </div>
            </div>
        );
    }
}
