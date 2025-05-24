import React from 'react';
import logo from './logo.svg';
import './App.css';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';

function App() {
  return (
    <ErrorBoundary>
      <LoadingState />
    </ErrorBoundary>
  );
}

export default App;
