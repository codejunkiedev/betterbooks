
function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="min-h-screen bg-background p-8">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-8">Welcome to BetterBooks <span className="text-sm text-gray-500">({import.meta.env.VITE_APP_ENV})</span></h1>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
