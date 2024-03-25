import React, { useState, useEffect, useContext } from 'react';
import { db, storage } from '../../firebase';
import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { AuthContext } from '../../context/AuthContext';
import { increment } from 'firebase/firestore';
import Navbar from '../home/Navbar';
import '../posts/Posts.css';
function Posts() {
  const { currentUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [expandedCaption, setExpandedCaption] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    // Fetch posts and liked posts on component mount
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('timestamp', 'desc')
        );

        onSnapshot(q, (snapshot) => {
          const fetchedPosts = [];
          snapshot.forEach((doc) => {
            fetchedPosts.push({ id: doc.id, ...doc.data() });
          });
          setPosts(fetchedPosts);
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    const fetchLikedPosts = async () => {
      try {
        if (currentUser) {
          const likedPostsRef = collection(db, 'likedPosts', currentUser.uid);
          const likedPostsSnapshot = await getDocs(likedPostsRef);
          const likedPostsList = likedPostsSnapshot.docs.map((doc) => doc.id);
          setLikedPosts(likedPostsList);
        }
      } catch (error) {
        console.error('Error fetching liked posts:', error);
      }
    };

    fetchPosts();
    fetchLikedPosts();
  }, [currentUser]);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const generatePostId = () => {
    return new Date().getTime().toString();
  };

  const handleUpload = async () => {
    try {
      if (!currentUser || !image) {
        console.error('User not authenticated or no image selected');
        return;
      }

      // Generate a unique postId
      const postId = generatePostId();

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `posts/${currentUser.uid}/${postId}`);
      await uploadBytes(storageRef, image);

      // Get the download URL of the uploaded image
      const imageURL = await getDownloadURL(storageRef);

      // Add post data to Firestore
      const postRef = await addDoc(collection(db, 'posts'), {
        userId: currentUser.uid,
        postId,
        imageURL,
        caption,
        likes: 0, // Initialize likes count
        timestamp: new Date(),
        email: currentUser.email, // Add email of the poster
      });

      console.log('Post uploaded successfully', postRef.id);

      // Clear the input fields
      setImage(null);
      setCaption('');
    } catch (error) {
      console.error('Error uploading post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      if (!currentUser) {
        console.error('User not authenticated');
        return;
      }

      // Check if the user has already liked the post
      if (!likedPosts.includes(postId)) {
        // Update the likes count in Firestore
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          likes: increment(1),
        });

        // Add the post to the user's liked posts
        await setDoc(doc(db, 'likedPosts', currentUser.uid, postId), {
          timestamp: new Date(),
        });

        console.log('Like added successfully');
        // Refresh the liked posts list
        setLikedPosts((prevLikedPosts) => [...prevLikedPosts, postId]);
      } else {
        console.log('Post already liked');
      }
    } catch (error) {
      console.error('Error adding like:', error);
    }
  };

  const handleExpandCaption = (postCaption) => {
    setExpandedCaption(postCaption);
  };

  const handleCloseModal = () => {
    setExpandedCaption('');
  };

  return (
    <>
      <Navbar />
      <div className="posts-container">
        <h1 className="posts-header">Create Post</h1>
  
        {/* Image Upload Section */}
        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <span className="text-blue-500 hover:underline">Choose a photo</span>
          </label>
          <input
            type="text"
            placeholder="Enter caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="caption-input"
          />
          <button onClick={handleUpload} className="upload-button">
            Upload
          </button>
        </div>
  
        {/* Display Posts */}
        <h1 className="posts-header">Posts</h1>
        <div className="grid-container">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <p className="post-email">{post.email}</p>
              <img
                src={post.imageURL}
                alt={`Post by ${post.userId}`}
                className="post-image"
                onClick={() => handleExpandCaption(post.caption)}
              />
              <p className="post-caption">
                {post.caption.length > 50 ? (
                  <>
                    {post.caption.substring(0, 50)}...
                    <span
                      className="read-more"
                      onClick={() => handleExpandCaption(post.caption)}
                    >
                      Read more
                    </span>
                  </>
                ) : (
                  post.caption
                )}
              </p>
              <div className="post-like-section">
                <button onClick={() => handleLike(post.id)} className="like-button">
                  Like
                </button>
                <span className="like-count">{post.likes} likes</span>
              </div>
            </div>
          ))}
        </div>
  
        {/* Expanded Caption Modal */}
        {expandedCaption && (
          <div className="modal-container">
            <div className="modal-content">
              <p className="expanded-caption">{expandedCaption}</p>
              <button onClick={handleCloseModal} className="close-button">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );  
}

export default Posts;
