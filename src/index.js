import React from './myReact'
import ReactDOM from './myReact/ReactDOM'

/**
 * 下面👇用
 * element 代表React元素
 * node 代表DOM元素
 */

const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
)
console.log(element)

const container = document.getElementById("root")

ReactDOM.render(element, container)
