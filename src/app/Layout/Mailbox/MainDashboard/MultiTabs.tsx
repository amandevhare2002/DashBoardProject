import React, { useEffect, useState } from 'react';
import './MultiTabs.scss'

interface Props {
  closeTab: Function,
  tabs: any,
  selectedTab: number,
  setSelectedTab: Function,
  handleTabChange: Function
}

const MultiTabs = ({ tabs, closeTab, selectedTab, setSelectedTab, handleTabChange }: Props) => {
 
  return (
    <div className="multi-tabs">
      <div className="tab-buttons">
        {tabs.length > 1 && tabs.map((tab: any) => (
          <div key={tab.id} className='tab-item'>
            <button
              className={`tab-button ${tab.id === selectedTab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.name}
            </button>
            <button className={`close-button ${tab.id === selectedTab ? 'active' : ''}`} onClick={() => closeTab(tab.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="tab-content">
        {tabs[selectedTab]?.content()}
      </div>
    </div>
  );
};

export default MultiTabs;