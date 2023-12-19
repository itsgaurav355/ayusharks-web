// Community.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext'; // Adjust the path based on your file structure
import GroupChat from './Groupchat'; // Adjust the path based on your file structure

const Community = () => {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchGroups = async () => {
    try {
      const groupsCollection = collection(db, 'groups');
      const groupsSnapshot = await getDocs(groupsCollection);
      const groupsData = groupsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []); // Empty dependency array means the effect runs once on mount

  const createGroup = async () => {
    try {
      if (!newGroupName.trim()) {
        throw new Error('Group name cannot be empty.');
      }

      const groupDocRef = doc(db, 'groups', newGroupName);

      // Check if the group already exists
      const groupDoc = await getDoc(groupDocRef);
      if (groupDoc.exists()) {
        throw new Error('Group with this name already exists.');
      }

      // Create the group
      await setDoc(groupDocRef, {});

      // Create the messages subcollection for the group
      const messagesCollection = collection(groupDocRef, 'messages');
      await setDoc(messagesCollection, {});

      // Refresh the groups list
      setNewGroupName('');
      setIsJoiningGroup(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error.message);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      if (!currentUser) {
        throw new Error('No authenticated user.');
      }

      const groupDocRef = doc(db, 'groups', groupId);

      // Check if the user is already a member
      const membersCollection = collection(groupDocRef, 'members');
      const userMembershipQuery = query(membersCollection, where('userId', '==', currentUser.uid));
      const userMembershipSnapshot = await getDocs(userMembershipQuery);

      if (userMembershipSnapshot.empty) {
        // If the user is not a member, add them to the group
        const memberDocRef = doc(membersCollection, currentUser.uid);
        await setDoc(memberDocRef, {}); // Create the member document

        // Create the messages subcollection for the member
        const messagesCollection = collection(memberDocRef, 'messages');
        await setDoc(messagesCollection, {});
      } else {
        throw new Error('You are already a member of this group.');
      }

      // Refresh the groups list
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error.message);
    }
  };

  const openChatFullscreen = (groupId) => {
    setSelectedGroup(groupId);
    setIsJoiningGroup(false);
  };

  const closeChatFullscreen = () => {
    setSelectedGroup(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Community</h1>

      {/* Search bar (you can add functionality later) */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search groups..."
          className="p-2 border rounded w-full"
        />
      </div>

      {/* Groups list */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Groups</h2>
        <ul>
          {groups.map((group) => (
            <li key={group.id} className="flex items-center justify-between p-2 bg-gray-200 mb-2 rounded-md">
              <span>{group.id}</span>
              {currentUser && (
                <>
                  <button
                    onClick={() => joinGroup(group.id)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => openChatFullscreen(group.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Open Chat
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Create a new group */}
      {isJoiningGroup ? (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={createGroup}
            className="bg-green-500 text-white px-2 py-1 rounded ml-2"
          >
            Create Group
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsJoiningGroup(true)}
          className="mt-4 bg-blue-500 text-white px-2 py-1 rounded"
        >
          Create New Group
        </button>
      )}

      {/* Group Chat */}
      {selectedGroup && (
        <GroupChat groupId={selectedGroup} onClose={closeChatFullscreen} />
      )}
    </div>
  );
};

export default Community;
