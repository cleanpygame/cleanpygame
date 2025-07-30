import React, {useContext} from 'react';
import {Navigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';

interface AdminRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route component that only allows admins
 * Redirects to home page if user is not an admin
 */
export function AdminRoute({children}: AdminRouteProps): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('AdminRoute must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {auth} = state;

    // If user is not authenticated or not an admin, redirect to home page
    if (!auth.isAuthenticated || !auth.isAdmin) {
        return <Navigate to="/" replace/>;
    }

    // Otherwise, render the children
    return <>{children}</>;
}