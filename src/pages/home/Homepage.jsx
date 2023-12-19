import React, { useState, useEffect, useContext } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleSearch = async () => {
      try {
        const usersCollection = collection(db, 'users');

        // If searchTerm is empty, don't perform the query
        if (searchTerm.trim() === '') {
          setSearchResults([]);
          return;
        }

        // Use startAt and endAt for a prefix search
        const q = query(
          usersCollection,
          where('email', '>=', searchTerm),
          where('email', '<=', searchTerm + '\uf8ff')
        );

        const usersSnapshot = await getDocs(q);
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSearchResults(usersData);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    };

    // Execute the search when searchTerm changes
    handleSearch();
  }, [searchTerm]);
 
  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Welcome, {currentUser.email}!</h2>
      <div className="mb-4">
        <label htmlFor="search" className="text-lg mb-2 block">
          Search Users:
        </label>
        <input
          id="search"
          type="text"
          placeholder="Enter user email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>

      <h3 className="text-xl font-semibold mb-2">Search Results:</h3>
      <ul>
        {searchResults.map((user) => (
          <li key={user.id} className="mb-2">
            <Link
              to={`/user-details/${user.id}`}
              className="text-blue-500 hover:underline"
            >
              {user.email}
            </Link>
          </li>
        ))}
      </ul>

      {/* Added Design Section */}
      <section className="my-8">
        <div className="flex flex-col items-center justify-center bg-gray-200 p-8 rounded-md">
          <h4 className="text-xl font-semibold mb-4">Check out our latest designs!</h4>
          <p className="text-gray-700 text-center mb-4">
            Add some nice touches to your interface with our latest designs, components, and templates.
            We've crafted a beautiful user experience that your visitors will love.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DesignCard
              image="https://cdn.devdojo.com/images/december2020/dashboard-011.png"
              title="Design Made Easy"
              description="Crafting your user experience has never been easier, with our intuitive drag'n drop interface you will be creating beautiful designs in no time."
            />
            <DesignCard
              image="https://cdn.devdojo.com/images/december2020/dashboard-04.png"
              title="Optimized For Conversions"
              description="Backed by data, these templates have been crafted for ultimate optimization. Now, converting your visitors into customers is easier than ever before."
            />
            <DesignCard
              image="https://cdn.devdojo.com/images/december2020/dashboard-03.png"
              title="Make It Your Own"
              description="All templates and components are fully customizable. You can use these templates to tell your personal story and convey your message."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const DesignCard = ({ image, title, description }) => (
  <div className="bg-white p-4 rounded-md shadow-md">
    <div className="h-40 mb-4">
      <img
        className="w-full h-full object-cover rounded-md"
        src={image}
        alt={title}
      />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-700">{description}</p>
  </div>
);

export default Home;
