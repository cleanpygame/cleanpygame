import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {CodeView} from "../components/CodeView.jsx";
import {StateProvider} from "../components/StateProvider.jsx";
import {TopBar} from "../components/TopBar.jsx";
import {EventRegion} from "../utils/regions.js";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <StateProvider>
            <TopBar />
        </StateProvider>
        <CodeView
            code={["def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            regions={[new EventRegion(0, 4, 0, 4, "f")]}
            animate={false}
            contentId={1}
            onEvent={(id) => console.log(id)}
            onMisclick={(line, column) => console.log(line, column)}/>
        <CodeView
            code={["# comment", "def f(x):", "  print(x)", "  print(x)", "  print(x)", "  print(x)", "  print(x)"].join('\n')}
            regions={[new EventRegion(0, 4, 0, 4, "f")]}
            animate={true}
            contentId={1}
            onEvent={(id) => console.log(id)}
            onMisclick={(line, column) => console.log(line, column)}/>
    </StrictMode>
)
