import { TEXT_ELEMENT } from './const'

/**
 * 创建react元素
 * @param {*} type 类型 
 * @param {*} props 属性
 * @param  {...any} children 子节点
 */
function createElement(type, props, ...children) {
    console.log('执行 createElement')
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === 'object'
                    ? child
                    : createTextElement(child)
            ),
        }
    }
}

/**
 * 创建文本元素
 * @param {*} text 文本
 */
function createTextElement(text) {
    return {
        type: TEXT_ELEMENT,
        props: {
            nodeValue: text,
            children: []
        }
    }
}

const React = {
    createElement
}

export default React