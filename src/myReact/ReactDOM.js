import { EFFECT_TAG_UPDATE, TEXT_ELEMENT, EFFECT_TAG_PLACEMENT, EFFECT_TAG_DELETION } from "./const"

let nextUnitOfWork = null // 下一个浏览器空闲时间要执行的任务
let wipRoot = null // 用于记录工作过程中的根节点
let currentRoot = null // 上一个提交的fiber根节点
let deletions = null // 需要删除的fiber结点

// 是不是事件
const isEvent = key => key.startsWith('on')
// 是不是属性
const isProperty = key => key !== "children" && !isEvent(key)
// 是不是新属性
const isNew = (prev, next) => key =>
    prev[key] !== next[key]
// 是不是旧属性
const isGone = (prev, next) => key => !(key in next)

/**
 * 将fiber结点装换为真实DOM结点
 * @param {*} fiber fiber结点
 */
function createDom(fiber) {
    const dom =
        fiber.type === TEXT_ELEMENT
            ? document.createTextNode("")
            : document.createElement(fiber.type)

    updateDom(dom, {}, fiber.props);

    return dom
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

/**
 * 递归渲染dom树
 * @param {*} fiber fiber结点
 */
function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    if (
        fiber.effectTag === EFFECT_TAG_PLACEMENT &&
        fiber.dom !== null
    ) {
        // 插入DOM结点
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === EFFECT_TAG_DELETION) {
        // 删除DOM结点
        domParent.removeChild(fiber.dom)
    } else if (
        fiber.effectTag === EFFECT_TAG_UPDATE &&
        fiber.dom !== null
    ) {
        // 更新DOM节点
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

/**
 * 更新dom结点
 * @param {*} dom 需要更新的dom结点 
 * @param {*} prevProps 旧的属性
 * @param {*} nextProps 新的属性
 */
function updateDom(dom, prevProps, nextProps) {
    // 移除旧的事件监听
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLocaleLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })
    // 移除旧属性
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ''
        })
    // 设置新的属性或更新属性
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })
    // 添加新的事件
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLocaleLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

/**
 * 渲染函数，将vdom转为dom
 * @param {*} element react元素
 * @param {*} container dom容器
 */
function render(element, container) {
    // 根fiber结点
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot, // 记录上一次更新到dom的fiber结点
    }
    deletions = [] // 初始化删除结点数组
    // 从根结点开始工作
    nextUnitOfWork = wipRoot
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

    // 生成整个fiber tree之后提交给DOM
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}

// 浏览器处于空闲的时候会调用
requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    // 1. 添加dom结点
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // 2. 将每个child转换为fiber结点
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    // 3. 返回下一个要生成的fiber结点
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

/**
 * 协调算法
 * @param {*} wipFiber 当前工作中的fiber结点
 * @param {*} elements 当前fiber的子元素
 */
function reconcileChildren(wipFiber, elements) {
    let index = 0
    // 老结点
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibing = null
    while (
        index < elements.length ||
        oldFiber
    ) {
        const element = elements[index]
        let newFiber = null

        const sameType =
            oldFiber &&
            element &&
            element.type === oldFiber.type

        if (sameType) {
            // 更新结点
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: EFFECT_TAG_UPDATE
            }
        }
        if (element && !sameType) {
            // 添加节点
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: EFFECT_TAG_PLACEMENT
            }
        }
        if (oldFiber && !sameType) {
            // 删除结点
            oldFiber.effectTag = EFFECT_TAG_DELETION
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index === 0) {
            wipFiber.child = newFiber
        } else if (element) {
            prevSibing.sibling = newFiber
        }

        prevSibing = newFiber
        index++
    }
}

const ReactDOM = {
    render
}

export default ReactDOM