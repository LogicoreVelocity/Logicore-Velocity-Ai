import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', background: '#ffe0e0' }}>
          <h2>⚠️ Something went wrong</h2>
          <p>Please refresh the page</p>
        </div>
      )
    }

    return this.props.children
  }
}
