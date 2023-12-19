import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

const Explore = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    sectors: [],
    stages: [],
    industries: [],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = await Promise.all(usersSnapshot.docs.map(async (doc) => {
          const userData = { id: doc.id, ...doc.data() };
          const imageRef = ref(storage, `startupLogos/${userData.id}`);
          try {
            const imageUrl = await getDownloadURL(imageRef);
            userData.image = imageUrl;
          } catch (error) {
            console.error('Error fetching image URL:', error);
          }
          return userData;
        }));
        // Filter only startup accounts
        const startupUsers = usersData.filter(user => user.accType === 'startup');
        setUsers(startupUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []); // Fetch users on component mount

  const applyFilter = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: [...prevFilters[filterType], value.toLowerCase()],
    }));
  };

  const clearFilter = () => {
    setFilters({
      sectors: [],
      stages: [],
      industries: [],
    });
  };

  const removeFilter = (filterType, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: prevFilters[filterType].filter((item) => item !== value),
    }));
  };

  const sortFirstName = () => {
    setUsers([...users].sort((a, b) => a.email.localeCompare(b.email)));
  };

  const navigateToUserDetails = (userId) => {
    navigate(`/user-details/${userId}`);
  };

  return (
    <div className="bg-gray-800 text-white p-8 rounded-lg shadow-md w-3/4 mx-auto mt-8">
      <div className="flex items-center mb-8">
        <div className="ml-auto space-x-4">
          <input
            type="text"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            className="border p-3 rounded-l-md focus:outline-none focus:ring focus:border-blue-300 bg-gray-700 text-white"
          />
          <button onClick={() => applyFilter('sectors', 'ayurveda')} className={filters.sectors.includes('ayurveda') ? "bg-blue-500 text-white p-3 rounded-r-md" : "bg-gray-500 text-white p-3 rounded-r-md"}>
            Ayurveda
          </button>
          <button onClick={() => applyFilter('sectors', 'yoga')} className={filters.sectors.includes('yoga') ? "bg-green-500 text-white p-3 rounded-r-md" : "bg-gray-500 text-white p-3 rounded-r-md"}>
            Yoga
          </button>
          <button onClick={() => applyFilter('sectors', 'unani')} className={filters.sectors.includes('unani') ? "bg-yellow-500 text-white p-3 rounded-r-md" : "bg-gray-500 text-white p-3 rounded-r-md"}>
            Unani
          </button>
          <button onClick={() => applyFilter('sectors', 'siddha')} className={filters.sectors.includes('siddha') ? "bg-purple-500 text-white p-3 rounded-r-md" : "bg-gray-500 text-white p-3 rounded-r-md"}>
            Siddha
          </button>
          <button onClick={() => applyFilter('stages', 'ideation')} className={filters.stages.includes('ideation') ? "bg-indigo-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Ideation
          </button>
          <button onClick={() => applyFilter('stages', 'validation')} className={filters.stages.includes('validation') ? "bg-red-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Validation
          </button>
          <button onClick={() => applyFilter('stages', 'early traction')} className={filters.stages.includes('early traction') ? "bg-yellow-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Early Traction
          </button>
          <button onClick={() => applyFilter('stages', 'scaling')} className={filters.stages.includes('scaling') ? "bg-green-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Scaling
          </button>
          <button onClick={() => applyFilter('industries', 'medtech')} className={filters.industries.includes('medtech') ? "bg-pink-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Medtech
          </button>
          <button onClick={() => applyFilter('industries', 'biotech')} className={filters.industries.includes('biotech') ? "bg-blue-500 text-white p-3 rounded-md" : "bg-gray-500 text-white p-3 rounded-md"}>
            Biotech
          </button>
          <button onClick={sortFirstName} className="bg-purple-500 text-white p-3 rounded-md">
            Sort by First Name
          </button>
          <button onClick={clearFilter} className="bg-gray-500 text-white p-3 rounded-md">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users
          .filter((user) => {
            const lowerCaseSearch = search.toLowerCase();
            const sectorMatch = filters.sectors.length === 0 || filters.sectors.includes(user.startupDetails?.sector?.toLowerCase());
            const stageMatch = filters.stages.length === 0 || filters.stages.includes(user.startupDetails?.stage?.toLowerCase());
            const industryMatch = filters.industries.length === 0 || filters.industries.includes(user.startupDetails?.industry?.toLowerCase());

            return (
              (lowerCaseSearch === '' || (user.email && user.email.toLowerCase().includes(lowerCaseSearch))) &&
              sectorMatch && stageMatch && industryMatch
            );
          })
          .map((user, index) => (
            <div key={user.id} className="w-full bg-gray-700 rounded-lg p-8 flex flex-col justify-between items-center relative" style={{ height: '400px' }}>
              {user.image && (
                <div className="w-full h-2/3 mb-4">
                  <div
                    className="h-full w-full bg-cover bg-center rounded-md"
                    style={{ backgroundImage: `url(${user.image})` }}
                  ></div>
                </div>
              )}
              <div className="text-center">
                <p className="text-xl text-white font-bold mb-2">{user.email}</p>
              </div>
              {selectedUser === index && (
                <div className="mt-4">
                  <p className="text-gray-400">{user.accType}</p>
                </div>
              )}
              <button
                onClick={() => navigateToUserDetails(user.id)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 mt-4"
              >
                View Details
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Explore;
