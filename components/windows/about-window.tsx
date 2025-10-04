"use client"

export function AboutWindow() {
  const skills = [
    { name: "JavaScript/TypeScript", level: 95 },
    { name: "React/Next.js", level: 90 },
    { name: "Node.js", level: 85 },
    { name: "Python", level: 80 },
    { name: "Database Design", level: 85 },
    { name: "UI/UX Design", level: 75 },
  ]

  const timeline = [
    { year: "2019", title: "Started Career", description: "Began as Junior Developer" },
    { year: "2021", title: "Mid-Level Developer", description: "Promoted to Full Stack Developer" },
    { year: "2023", title: "Senior Developer", description: "Leading development teams" },
    { year: "2025", title: "Present", description: "Building innovative solutions" },
  ]

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        {/* Profile Section */}
        <div className="flex items-start gap-8 mb-12 pb-8 border-b border-gray-200">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
            JD
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">John Doe</h1>
            <p className="text-xl text-blue-600 mb-4">Full Stack Developer & UI/UX Enthusiast</p>
            <p className="text-gray-700 leading-relaxed">
              I'm a passionate developer who loves creating beautiful, functional web applications. With a strong
              foundation in both frontend and backend technologies, I bring ideas to life through clean code and
              thoughtful design. When I'm not coding, you'll find me exploring new technologies, contributing to open
              source, or sharing knowledge with the developer community.
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded" />
            Skills & Expertise
          </h2>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className="text-sm text-gray-600">{skill.level}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded" />
            Career Timeline
          </h2>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
