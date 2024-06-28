import React, { useState } from 'react';
import Cards from '../components/Dashboard/Cards';
import LeftBar from '../components/Dashboard/LeftBar';
import Navbar from '../components/Dashboard/NavBar';

function Dashboard() {
  const [isLeftBarVisible, setIsLeftBarVisible] = useState(false);

  const handleLeftBarVisibilityChange = (isVisible) => {
    setIsLeftBarVisible(isVisible);
  };

  return (
    <div className="flex h-screen bg-gradient-to-t from-blue-200 via-blue-400 to-blue-600 ">
      <LeftBar onVisibilityChange={handleLeftBarVisibilityChange} />
      <div className="flex flex-1 overflow-auto ">
        <div className={`w-full  transition-all duration-300 ${isLeftBarVisible ? 'ml-56' : ''}`}>
          <Navbar /> 
          <Cards />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
