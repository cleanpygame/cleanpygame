import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import CodeView from "../components/CodeView.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <CodeView
            code={["def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            regions={[{startLine: 0, firstToken: 2, endLine: 0, lastToken: 2, eventId: "f"}]}
            animate={false}
            contentId={1}
            onEvent={(id) => console.log(id)}
            onMisclick={(line, column) => console.log(line, column)}/>
        <CodeView
            code={["# comment", "def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            regions={[{startLine: 0, firstToken: 2, endLine: 0, lastToken: 2, eventId: "f"}]}
            animate={true}
            contentId={1}
            onEvent={(id) => console.log(id)}
            onMisclick={(line, column) => console.log(line, column)}/>
    </StrictMode>
)
