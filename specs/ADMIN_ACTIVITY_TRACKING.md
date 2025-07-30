# Admin Activity Tracking Feature Design

## Overview

This document outlines the design for implementing an admin feature that allows authorized administrators to view recent
activity from the last ~50 users who played any level in the Clean-Code Game. The activity view will reuse the same
layout and design as the existing group score table.

## Data Modeling in Firestore

### New Collections and Documents

1. **Admin Collection**
    - Collection name: `admins`
    - ID of the Document is uid of the user.
    - Purpose: Store a list of user IDs who have admin privileges
    - Document structure:
      ```typescript
      interface AdminDocument {
        uid: string;       // User ID of the admin
        email: string;     // Email of the admin (for reference)
        addedAt: Timestamp; // When admin access was granted
        addedBy?: string;  // Who added this admin (optional)
      }
      ```

2. **User Activity Tracking**
    - We will leverage the existing `playerStats` collection, which already contains:
        - `updatedAt` timestamp that indicates when a user last played
        - User information (displayName, email)
        - Game statistics (levels completed, hints used, etc.)

### Data Structure Updates

No structural changes are needed to the existing `playerStats` collection, as it already contains the necessary data:

```typescript
interface PlayerStatsDocument {
    playerId: string;
    displayName: string;
    email: string;
    summary: {
        levelsCompleted: number;
        totalLevelsPlayed: number;
        totalTimeSpent: number;
        totalHintsUsed: number;
        totalWrongClicks: number;
        // other summary stats
    };
    levels: Record<string, LevelStats>;
    createdAt: Timestamp;
    updatedAt: Timestamp; // This field is key for tracking recent activity
    teacherIds: string[]; // IDs of teachers who can view this player's stats
}
```

## Firestore Security Rules

### Admin Access Rules

Add the following rules to the existing Firestore security rules:

```
// Admin helper function
function isAdmin() {
  return isAuthenticated() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}

// Admin collection rules
match /admins/{adminId} {
  // Only admins can read the admin list
  allow read: if isAdmin();
  
  // No one can write to admin collection through the app
  // (admins will be managed directly in Firestore)
  allow write: if false;
}

// Update playerStats rules to allow admin access
match /playerStats/{userId} {
  // ... existing rules
  // Add admin read access
  allow read: if isAdmin();
}
```

### Admin Verification

1. Admin status will be verified by checking if a document with the user's UID exists in the `admins` collection.
2. This approach is simple and secure, as it leverages Firestore's security rules.
3. No UI for managing admins is needed, as specified in the requirements.

## Frontend Integration

### New Components

1. **AdminActivityPage.tsx**
    - Purpose: Display the recent user activity table
    - Reuses the same layout as the group score table
    - Path: `/web/src/components/AdminActivityPage.tsx`

2. **AdminRoute.tsx**
    - Purpose: Protected route component that only allows admins
    - Path: `/web/src/components/AdminRoute.tsx`

### UI Integration

1. **Navigation**:
    - Add an "Watch" link in the TopBar component that only appears for admin users
    - The link will navigate to `/admin/activity`

2. **Activity Table**:
    - Extract the table from GroupPage.tsx into a new component, e.g., `ActivityTable.tsx`
    - Columns will include:
        - Name (user.displayName)
        - Levels Completed (summary.levelsCompleted)
        - Total Levels Played (summary.totalLevelsPlayed)
        - Total Time (summary.totalTimeSpent)
        - Hints Used (summary.totalHintsUsed)
        - Mistakes (summary.totalWrongClicks)
        - Last Active (updatedAt)
        - First Seen (createdAt)
    - Remove the "Actions" column as it's not needed for the admin view

3. **Admin Check**:
   ```typescript
   // Function to check if current user is an admin
   export const isUserAdmin = async (userId: string): Promise<boolean> => {
     if (!userId) return false;
     
     const adminDocRef = doc(db, 'admins', userId);
     const docSnap = await getDoc(adminDocRef);
     return docSnap.exists();
   };
   ```

4. **Route Protection**:
   ```typescript
   // AdminRoute component
   export function AdminRoute({ children }: { children: React.ReactNode }): React.ReactElement {
     const context = useContext(GameStateContext);
     const navigate = useNavigate();
     const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
     
     useEffect(() => {
       if (context?.state.auth.user) {
         isUserAdmin(context.state.auth.user.uid)
           .then(adminStatus => {
             setIsAdmin(adminStatus);
             if (!adminStatus) {
               navigate('/');
             }
           });
       } else {
         navigate('/');
       }
     }, [context?.state.auth.user, navigate]);
     
     if (isAdmin === null) {
       return <div>Checking permissions...</div>;
     }
     
     return isAdmin ? <>{children}</> : null;
   }
   ```

## Efficient Data Fetching

### Query Strategy

To efficiently fetch the last ~50 active users:

```typescript
export const fetchRecentlyActiveUsers = async (limit: number = 50): Promise<UserActivity[]> => {
    try {
        const playerStatsRef = collection(db, 'playerStats');
        const q = query(
            playerStatsRef,
            orderBy('updatedAt', 'desc'),
            limit(limit)
        );

        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                displayName: data.displayName || 'Unknown',
                email: data.email || 'No email',
                levelsCompleted: data.summary?.levelsCompleted || 0,
                totalLevelsPlayed: data.summary?.totalLevelsPlayed || 0,
                totalTimeSpent: data.summary?.totalTimeSpent || 0,
                totalHintsUsed: data.summary?.totalHintsUsed || 0,
                totalWrongClicks: data.summary?.totalWrongClicks || 0,
                lastPlayedAt: data.updatedAt?.toDate().toISOString() || null,
                createdAt: data.createdAt?.toDate().toISOString() || null
            };
        });
    } catch (error) {
        console.error('Error fetching recently active users:', error);
        throw error;
    }
};
```

### Performance Considerations

1. **Indexing**:
    - Add a Firestore index on the `playerStats` collection for the `updatedAt` field to optimize the query.
    - Update `firestore.indexes.json`:
      ```json
      {
        "indexes": [
          {
            "collectionGroup": "playerStats",
            "queryScope": "COLLECTION",
            "fields": [
              { "fieldPath": "updatedAt", "order": "DESCENDING" }
            ]
          }
        ]
      }
      ```

2. **Caching**:
    - Implement client-side caching to reduce Firestore reads:
      ```typescript
      // In AdminActivityPage.tsx
      const [cachedUsers, setCachedUsers] = useState<UserActivity[]>([]);
      const [lastFetchTime, setLastFetchTime] = useState<number>(0);
      
      useEffect(() => {
        const now = Date.now();
        // Only fetch if data is older than 5 minutes
        if (now - lastFetchTime > 5 * 60 * 1000 || cachedUsers.length === 0) {
          fetchRecentlyActiveUsers(50)
            .then(users => {
              setCachedUsers(users);
              setLastFetchTime(now);
            });
        }
      }, [lastFetchTime, cachedUsers.length]);
      ```

3. **Pagination**:
    - not required for just 50 users

## Implementation Plan

1. **Backend Changes**:
    - Create the `admins` collection in Firestore
    - Add admin security rules to `firestore.rules`
    - Create Firestore index for `updatedAt` in `playerStats`

2. **Frontend Changes**:
    - Implement admin check functionality in `firebase/firestore.ts`
    - Create `AdminRoute.tsx` component for route protection
    - Create `AdminActivityPage.tsx` component
    - Update `TopBar.tsx` to show admin link for admins
    - Update routing in `App.tsx` to include admin routes

3. **Testing**:
    - Test admin access functionality
    - Test activity table rendering and data fetching

## Conclusion

This design provides a comprehensive approach to implementing the admin activity tracking feature. It leverages existing
data structures and UI components while adding the necessary security and access controls. The implementation is minimal
and focused on the specific requirements, with no UI for managing admins as specified.