import React, {useEffect} from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';
import {StateProvider} from './StateProvider';
import {IdeLayout} from './IdeLayout';
import {GameStateContext} from '../reducers';
import {toggleStatsPage} from '../reducers/actionCreators';

/**
 * Router component to handle URL changes
 */
function RouterHandler(): React.ReactElement {
    const location = useLocation();
    const context = React.useContext(GameStateContext);

    useEffect(() => {
        if (!context) return;

        const {state, dispatch} = context;
        const isStatsPage = location.pathname === '/stats';

        // Only toggle if the state doesn't match the URL
        if (isStatsPage !== state.statsPageVisible) {
            dispatch(toggleStatsPage());
        }
    }, [location.pathname, context]);

    return null;
}

/**
 * Root application component
 */
export function App(): React.ReactElement {
    return (
        <BrowserRouter>
            <StateProvider>
                <RouterHandler/>
                <Routes>
                    <Route path="*" element={<IdeLayout/>}/>
                </Routes>
            </StateProvider>
        </BrowserRouter>
    );
}