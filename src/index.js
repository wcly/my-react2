import React, { useState } from './myReact'
import ReactDOM from './myReact/ReactDOM'

function Counter() {
    const [state, setState] = useState(1)
    return (
        <h1 onClick={() => setState(c => c + 1)}>
            Count: {state}
        </h1>
    )
}

const element = <Counter />

const container = document.getElementById("root")

ReactDOM.render(element, container)
