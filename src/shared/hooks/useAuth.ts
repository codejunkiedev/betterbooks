import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks/useRedux';
import { initializeAuth, setupAuthListener, loadUserData } from '@/shared/services/store/userSlice';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const { isInitialized, user, isAuthenticated, isUserDataLoaded } = useAppSelector(state => state.user);
    const { isLoading: companyLoading } = useAppSelector(state => state.company);
    const authInitializedRef = useRef(false);

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

    // Load user data when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id && !isUserDataLoaded) {
            dispatch(loadUserData(user.id));
        }
    }, [isAuthenticated, user, isUserDataLoaded, dispatch]);

    return {
        isInitialized,
        isAuthenticated,
        isUserDataLoaded,
        companyLoading,
        isLoading: !isInitialized || (isAuthenticated && !isUserDataLoaded) || companyLoading
    };
};
