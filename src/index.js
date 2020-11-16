import React from './myReact'

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

const node = document.createElement(element.type)
node['title'] = element.props.title
const text = document.createTextNode('')
text['nodeValue'] = element.props.children
node.appendChild(text)
container.appendChild(node)
