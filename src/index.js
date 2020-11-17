import React from './myReact'
import ReactDOM from './myReact/ReactDOM'

function App(props) {
    return <h1>Hi {props.name}</h1>
}

const element = <App name="foo" />

const container = document.getElementById("root")

ReactDOM.render(element, container)
