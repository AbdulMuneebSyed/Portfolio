"use client"

import { useState } from "react"
import { Calendar, Info, ImageIcon, Volume2 } from "lucide-react"

export function Windows7Memories() {
  const [activeTab, setActiveTab] = useState<"timeline" | "trivia" | "wallpapers">("timeline")

  const timeline = [
    { year: "2009", event: "Windows 7 Released", description: "October 22, 2009 - A new era of computing begins" },
    { year: "2010", event: "Service Pack 1", description: "February 22, 2011 - Major update with improvements" },
    { year: "2015", event: "Peak Popularity", description: "Windows 7 becomes the most used OS worldwide" },
    { year: "2020", event: "End of Support", description: "January 14, 2020 - Official support ends" },
    { year: "2025", event: "Legacy Lives On", description: "Still remembered as one of the best Windows versions" },
  ]

  const trivia = [
    "Windows 7 was originally codenamed 'Blackcomb' and later 'Vienna'",
    "The Aero Glass interface was inspired by transparency in modern architecture",
    "Windows 7 sold over 630 million licenses in its first year",
    "The iconic startup sound was composed by Robert Fripp",
    "Windows 7 introduced the revolutionary taskbar with jump lists",
    "The default wallpaper 'Harmony' was photographed in Sonoma County, California",
  ]

  const wallpapers = [
    { name: "Harmony", color: "from-blue-400 to-blue-600" },
    { name: "Architecture", color: "from-gray-400 to-gray-600" },
    { name: "Characters", color: "from-green-400 to-green-600" },
    { name: "Landscapes", color: "from-purple-400 to-purple-600" },
    { name: "Nature", color: "from-teal-400 to-teal-600" },
    { name: "Scenes", color: "from-orange-400 to-orange-600" },
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-blue-50 to-white p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Windows 7 Memories</h1>
        <p className="text-gray-600">A nostalgic journey through the beloved operating system</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-white to-gray-50 flex">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "timeline"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("timeline")}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Timeline
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "trivia"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("trivia")}
        >
          <Info className="w-4 h-4 inline mr-2" />
          Trivia
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "wallpapers"
              ? "bg-white border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          onClick={() => setActiveTab("wallpapers")}
        >
          <ImageIcon className="w-4 h-4 inline mr-2" />
          Wallpapers
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "timeline" && (
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200" />

              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    {/* Timeline Dot */}
                    <div className="relative z-10 w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                      {item.year}
                    </div>
                    <div className="flex-1 pt-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{item.event}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "trivia" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Did You Know?</h2>
            <div className="space-y-4">
              {trivia.map((fact, index) => (
                <div key={index} className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{fact}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Startup Sound</h3>
              </div>
              <p className="text-blue-100">
                The iconic Windows 7 startup sound was designed to evoke feelings of trust, reliability, and innovation.
                It became one of the most recognizable sounds in computing history.
              </p>
            </div>
          </div>
        )}

        {activeTab === "wallpapers" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Classic Wallpaper Themes</h2>
            <div className="grid grid-cols-2 gap-6">
              {wallpapers.map((wallpaper, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`h-40 bg-gradient-to-br ${wallpaper.color}`} />
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-900">{wallpaper.name}</h3>
                    <p className="text-sm text-gray-600">Windows 7 Theme Collection</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
