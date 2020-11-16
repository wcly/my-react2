import { TEXT_ELEMENT } from "./const"

// 下一个浏览器空闲时间要执行的任务
let nextUnitOfWork = null

/**
 * 渲染函数，将vdom转为dom
 * @param {*} element react元素
 * @param {*} container dom容器
 */
function render(element, container) {
    // 创建dom结点
    const dom = element.type === TEXT_ELEMENT
        ? document.createTextNode('')
        : document.createElement(element.type)

    // 将props分配给结点
    const isProperty = key => key !== 'children'
    Object.keys(element.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = element.props[name]
        })

    // 递归遍历子元素
    element.props.children.forEach(child =>
        render(child, dom)
    )

    // 添加子元素
    container.appendChild(dom)
}

function workLoop(deadline) {
    let shouldYield = false // 是否阻塞执行任务
    while (nextUnitOfWork && !shouldYield) {
        // 执行任务
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        // 剩余空闲时间不足一毫秒的时候暂停执行
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

// 浏览器处于空闲的时候会调用
requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork){
    // TODO
}

const ReactDOM = {
    render
}

export default ReactDOM