/**
 * @file Sticky.jsx
 * @author liyang@jingoal.com
 * @desc
 *      吸顶效果
 * */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import utils from './utils';
import PropTypes from 'prop-types'

export default class Sticky extends Component {
    static propTypes = {
        stickyExtraClass: PropTypes.string,
        children: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.string])
    };

    static defaultProps = {
        stickyExtraClass: ''
    };

    static contextTypes = {
        scroller: PropTypes.object
    };

    constructor() {
        super();
        this.domNode = null;
        this.height = null;
        this.offsetTop = null;
        this.className = null;
    }

    componentDidMount() {
        this.scroller = this.context.scroller;

        if (this.scroller) {
            this.initialize();
            this.scroller.stickyHeaders.push(this);
        }
    }

    componentDidUpdate() {
        this.initialize();
    }

    componentWillUnmount() {
        if (this.scroller) {
            this.scroller.stickyHeaders =
                this.scroller.stickyHeaders.filter((header) => header !== this);
        }
    }

    initialize() {
        this.domNode = ReactDOM.findDOMNode(this); // eslint-disable-line react/no-find-dom-node
        this.height = this.domNode.offsetHeight;
        this.offsetTop = -utils.offset(this.domNode).top;
        this.className = this.domNode.className;
        this.onlyChild = React.Children.only(this.props.children);
        this.stickyExtraClass = this.props.stickyExtraClass;
    }

    render() {
        return React.Children.only(this.props.children);
    }
}
