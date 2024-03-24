import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function InvestorLineChart({ currentUser }) {
  const [product, setProduct] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [option, setOption] = useState({
    title: { text: '' },
    xaxis: {
      title: { text: '' },
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: {
      title: { text: 'Investment' },
    },
   colors:['#ffffff','#E67E22','#F1C40F','#00FF00','#5DADE2'],}
  )
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userDocQuery = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
      const querySnapshot = await getDocs(userDocQuery);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.startupDetails && data.startupDetails['T-shirt']) {
          setProduct([
            {
              name: 'T-shirt',
              data: data.startupDetails['T-shirt'].map(Number),
            },
          ]);
        }
      });
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const processData = async () => {
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const parsedData = lines
          .slice(1) // Skip header row
          .map((line) => {
            const [time, revenue] = line.split(',').map(Number);
            return revenue;
          })
          .filter((revenue) => !isNaN(revenue)); // Filter out NaN values
        console.log("Bhejne wala data :" + parsedData);
        if (parsedData.length > 0) {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
              'startupDetails.T': parsedData,
            });
            fetchData(); // Refresh chart data after update
          } catch (error) {
            console.error('Error updating data: ', error);
          }
        }
      };
      reader.readAsText(csvFile);
    }
  };
  

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
    }
  };



  return (
    <div className="container-fluid mt-3 mb-3 flex box border border-white p-5 rounded">
      <div className=' flex-1'>
        <div className='bg-blue-900 p-5 text-white  text-xl mb-5 rounded'>
          <h2 className='mb-3 text-2xl font-bold'>Startup revenue</h2>
          <input type="file" accept=".csv" onChange={handleFileUpload} /><br />
          <button className='bg-sky-100 mt-5 text-black px-4 py-2 rounded' onClick={processData}>Upload and Update Data</button>
        </div>
        <Chart type="line" width={600} height={350} series={product} options={option} />
      </div>
    </div>
  );
};

export default   InvestorLineChart;
