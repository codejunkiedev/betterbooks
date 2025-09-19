import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import { initializeAuth, setupAuthListener, loadUserData } from '@/shared/services/store/userSlice';
import { usePageVisibility } from './usePageVisibility';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { isInitialized, user, isAuthenticated, isUserDataLoaded } = useAppSelector(state => state.user);
    const { isLoading: companyLoading } = useAppSelector(state => state.company);
    const authInitializedRef = useRef(false);
    const isPageVisible = usePageVisibility();

    // Initialize auth only once
    useEffect(() => {
        if (authInitializedRef.current) return;

        const initialize = async () => {
            try {
                await dispatch(initializeAuth());
                await dispatch(setupAuthListener());
                authInitializedRef.current = true;
            } catch (error) {
                console.error('Auth initialization failed:', error);
            }
        };

        initialize();
    }, [dispatch]);

    // Load user data when authenticated (only when page is visible)
    useEffect(() => {
        if (isAuthenticated && user?.id && !isUserDataLoaded && isPageVisible) {
            dispatch(loadUserData(user.id));
        }
    }, [isAuthenticated, user, isUserDataLoaded, dispatch, isPageVisible]);

    return {
        isInitialized,
        isAuthenticated,
        isUserDataLoaded,
        companyLoading,
        isLoading: !isInitialized || (isAuthenticated && !isUserDataLoaded) || companyLoading
    };
};
