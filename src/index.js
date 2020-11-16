import React from 'react'

/**
 * 下面👇用
 * element 代表React元素
 * node 代表DOM元素
 */

const element = React.createElement("h1", { title: 'foo' }, 'hello world')
// console.log(element)

const container = document.getElementById("root")

const node = document.createElement(element.type)
node['title'] = element.props.title
const text = document.createTextNode('')
text['nodeValue'] = element.props.children
node.appendChild(text)
container.appendChild(node)
