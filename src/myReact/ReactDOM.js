import { TEXT_ELEMENT } from "./const"

// 下一个浏览器空闲时间要执行的任务
let nextUnitOfWork = null

/**
 * 将fiber结点装换为真实DOM结点
 * @param {*} fiber fiber结点
 */
function createDom(fiber) {
    const dom =
        fiber.type === TEXT_ELEMENT
            ? document.createTextNode("")
            : document.createElement(fiber.type)

    const isProperty = key => key !== "children"
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })

    return dom
}

/**
 * 渲染函数，将vdom转为dom
 * @param {*} element react元素
 * @param {*} container dom容器
 */
function render(element, container) {
    // 设置nextUnitOfWork为根fiber结点
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        }
    }
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

function performUnitOfWork(fiber) {
    console.log('current render fiber', fiber)
    // 1. 添加dom结点
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // 2. 将每个child转换为fiber结点
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null
    while (index < elements.length) {
        const element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        }
        // 第一个child结点
        if (index === 0) {
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }

    // 3. 返回下一个要渲染的fiber结点
    // 找child结点
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        // 找兄弟结点
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        // 往父节点找
        nextFiber = nextFiber.parent
    }
}

const ReactDOM = {
    render
}

export default ReactDOM