import React from 'react';

// This is the main component for the Pong Tournament page
// In Next.js, this would typically be a page component in your app/pages directory
export default function PongTournament() {
  // These are placeholder values that will eventually come from your backend
  // In a real app, you'd fetch this data using props or API calls
  const tournamentCode = "PONG-2024-XYZ"; // Tournament code from backend
  
  // Tournament data structure - this will come from your backend
  const tournament = {
    // Semi-final matches (first round)
    semiFinals: [
      {
        id: 1,
        player1: "Alice",
        player2: "Bob",
        winner: null // null means no winner yet, will be "player1" or "player2"
      },
      {
        id: 2,
        player1: "Charlie",
        player2: "Diana",
        winner: null
      }
    ],
    // Final match (second round)
    final: {
      id: 3,
      player1: null, // Will be filled when semi-final 1 completes
      player2: null, // Will be filled when semi-final 2 completes
      winner: null
    }
  };

  return (
    // Main container - takes full height and centers content
    // bg-gray-50 = light gray background
    // min-h-screen = minimum height of 100% viewport height
    // py-8 = padding on top and bottom (2rem)
    // px-4 = padding on left and right (1rem)
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      
      {/* Content wrapper - max width container centered on page */}
      {/* max-w-6xl = maximum width of 72rem (1152px) */}
      {/* mx-auto = margin left and right auto (centers the container) */}
      <div className="max-w-6xl mx-auto">
        
        {/* Tournament Code Section */}
        {/* mb-8 = margin bottom (2rem) - creates space below this section */}
        <div className="mb-8">
          {/* Tournament Code Card */}
          {/* bg-white = white background */}
          {/* rounded-lg = rounded corners (0.5rem radius) */}
          {/* shadow-md = medium shadow for depth */}
          {/* p-6 = padding all around (1.5rem) */}
          {/* flex = flexbox container (elements in a row) */}
          {/* items-center = vertically center items */}
          {/* justify-between = space items apart (one left, one right) */}
          <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            
            {/* Left side - Tournament Code Display */}
            <div>
              {/* Label for tournament code */}
              {/* text-sm = small text size */}
              {/* text-gray-600 = medium gray color */}
              {/* mb-1 = small margin bottom (0.25rem) */}
              <p className="text-sm text-gray-600 mb-1">Tournament Code</p>
              
              {/* The actual tournament code */}
              {/* text-2xl = large text (1.5rem) */}
              {/* font-bold = bold font weight */}
              {/* text-gray-800 = dark gray (almost black) */}
              {/* font-mono = monospace font (like code) */}
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {tournamentCode}
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-800 font-mono">Waiting For Players</p>
            {/* Right side - Invite Button */}
            {/* bg-blue-600 = blue background color */}
            {/* hover:bg-blue-700 = darker blue on mouse hover */}
            {/* text-white = white text color */}
            {/* px-6 = horizontal padding (1.5rem) */}
            {/* py-2 = vertical padding (0.5rem) */}
            {/* rounded-md = medium rounded corners */}
            {/* transition = smooth transition for hover effects */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition">
              Invite Players
            </button>
          </div>
        </div>

        {/* Tournament Title */}
        {/* text-3xl = very large text */}
        {/* font-bold = bold weight */}
        {/* text-center = center aligned text */}
        {/* text-gray-800 = dark gray color */}
        {/* mb-12 = large margin bottom (3rem) */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Tournament Bracket
        </h1>

        {/* Tournament Bracket Container */}
        {/* grid = CSS grid layout */}
        {/* grid-cols-3 = 3 columns (semi-finals, connector, final) */}
        {/* gap-8 = space between grid items (2rem) */}
        {/* items-center = vertically center all grid items */}
        <div className="grid grid-cols-3 gap-8 items-center">
          
          {/* LEFT COLUMN - Semi-Finals */}
          {/* space-y-16 = vertical space between children (4rem) */}
          <div className="space-y-16">
            
            {/* Semi-Final Match 1 */}
            {/* bg-white = white background */}
            {/* rounded-lg = rounded corners */}
            {/* shadow-md = medium shadow */}
            {/* p-6 = padding all around */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Match label */}
              {/* text-xs = extra small text */}
              {/* text-gray-500 = light gray */}
              {/* uppercase = all caps */}
              {/* mb-4 = margin bottom (1rem) */}
              {/* text-center = centered text */}
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Semi-Final 1
              </div>
              
              {/* space-y-3 = vertical space between players (0.75rem) */}
              <div className="space-y-3">
                {/* Player 1 */}
                {/* p-3 = padding (0.75rem) */}
                {/* border-2 = 2px border */}
                {/* border-gray-200 = light gray border */}
                {/* rounded = rounded corners */}
                {/* text-center = centered text */}
                <div className="p-3 border-2 border-gray-200 rounded text-center">
                  {tournament.semiFinals[0].player1}
                </div>
                
                {/* VS divider between players */}
                {/* text-center = centered */}
                {/* text-sm = small text */}
                {/* text-gray-400 = light gray */}
                {/* font-semibold = semi-bold weight */}
                <div className="text-center text-sm text-gray-400 font-semibold">
                  VS
                </div>
                
                {/* Player 2 */}
                <div className="p-3 border-2 border-gray-200 rounded text-center">
                  {tournament.semiFinals[0].player2}
                </div>
              </div>
              
              {/* Winner Display Area */}
              {/* mt-4 = margin top (1rem) */}
              {/* pt-4 = padding top (1rem) */}
              {/* border-t = border on top only */}
              {/* border-gray-200 = light gray border */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {/* text-xs = extra small */}
                {/* text-gray-500 = light gray */}
                {/* mb-2 = small margin bottom */}
                <div className="text-xs text-gray-500 mb-2">Winner:</div>
                
                {/* Winner indicator box */}
                {/* p-2 = padding (0.5rem) */}
                {/* bg-gray-100 = very light gray background */}
                {/* rounded = rounded corners */}
                {/* text-center = centered text */}
                {/* text-sm = small text */}
                {/* text-gray-400 = light gray (for "TBD" text) */}
                <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-400">
                  TBD
                </div>
              </div>
            </div>

            {/* Semi-Final Match 2 - Same structure as Match 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Semi-Final 2
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border-2 border-gray-200 rounded text-center">
                  {tournament.semiFinals[1].player1}
                </div>
                
                <div className="text-center text-sm text-gray-400 font-semibold">
                  VS
                </div>
                
                <div className="p-3 border-2 border-gray-200 rounded text-center">
                  {tournament.semiFinals[1].player2}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Winner:</div>
                <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-400">
                  TBD
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Connecting Lines */}
          {/* This creates visual lines connecting semi-finals to final */}
          {/* flex = flexbox container */}
          {/* justify-center = center horizontally */}
          {/* items-center = center vertically */}
          <div className="flex justify-center items-center">
            {/* h-full = full height */}
            {/* border-l-2 = 2px border on left */}
            {/* border-r-2 = 2px border on right */}
            {/* border-gray-300 = medium gray borders */}
            {/* w-full = full width */}
            <div className="h-full border-l-2 border-r-2 border-gray-300 w-full"></div>
          </div>

          {/* RIGHT COLUMN - Final Match */}
          {/* flex = flexbox container */}
          {/* items-center = center vertically */}
          <div className="flex items-center">
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <div className="text-xs text-gray-500 uppercase mb-4 text-center">
                Final
              </div>
              
              <div className="space-y-3">
                {/* Player 1 slot - will be filled from semi-final 1 winner */}
                {/* text-gray-400 = light gray for "TBD" placeholder */}
                <div className="p-3 border-2 border-gray-200 rounded text-center text-gray-400">
                  TBD
                </div>
                
                <div className="text-center text-sm text-gray-400 font-semibold">
                  VS
                </div>
                
                {/* Player 2 slot - will be filled from semi-final 2 winner */}
                <div className="p-3 border-2 border-gray-200 rounded text-center text-gray-400">
                  TBD
                </div>
              </div>
              
              {/* Champion Display Area */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Champion:</div>
                <div className="p-2 bg-gray-100 rounded text-center text-sm text-gray-400">
                  TBD
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}