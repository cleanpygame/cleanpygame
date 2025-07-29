import React, {useContext, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {addLevelToUserLevels, getCustomLevelById} from '../firebase/firestore';
import {parseLevelText} from '../levels_compiler/parser';
import {loadCommunityLevel} from '../reducers/actionCreators';
import {getCurrentUser} from '../firebase/auth';

/**
 * Community Level Loader component
 * This component loads a community level from Firestore and updates the state
 * It doesn't render anything itself, it's just used for the side effect
 */
export function CommunityLevelLoader(): React.ReactElement | null {
    const {levelId} = useParams<{ levelId: string }>();
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('CommunityLevelLoader must be used within a GameStateContext Provider');
    }

    const {dispatch} = context;

    useEffect(() => {
        const loadLevel = async () => {
            if (!levelId) return;

            try {
                // Fetch the custom level from Firestore
                const customLevel = await getCustomLevelById(levelId);

                if (!customLevel) {
                    console.error('Community level not found:', levelId);
                    return;
                }

                // Parse the level content
                const parseResult = parseLevelText(customLevel.content);

                if (parseResult.error || !parseResult.level) {
                    console.error('Error parsing community level:', parseResult.error);
                    return;
                }

                // Get the current user
                const user = getCurrentUser();

                // If user is authenticated, add the level to userLevels
                if (user) {
                    try {
                        await addLevelToUserLevels(user.uid, levelId);
                        console.log('Level added to user levels:', levelId);
                    } catch (error) {
                        console.error('Error adding level to user levels:', error);
                        // Continue even if adding to userLevels fails
                    }
                }
                
                // Load the level using the loadCommunityLevel action
                dispatch(loadCommunityLevel(levelId, parseResult.level));
            } catch (error) {
                console.error('Error loading community level:', error);
            }
        };

        loadLevel();
    }, [levelId, dispatch]);

    // This component doesn't render anything, it just has side effects
    return null;
}