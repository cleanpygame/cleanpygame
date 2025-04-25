import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {CodeView} from "../components/CodeView.jsx";
import {StateProvider} from "../components/StateProvider.jsx";
import {TopBar} from "../components/TopBar.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <StateProvider>
            <TopBar />
        </StateProvider>
        <CodeView
            code={["def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            animate={false}
            contentId={1}
            onClick={(line, column, token) => console.log(line, column, token)}/>
        <CodeView
            code={["# comment", "def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            animate={true}
            contentId={1}
            onClick={(line, column, token) => console.log(line, column, token)}/>
    </StrictMode>
)
