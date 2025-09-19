    const deskGroups = []
    for (let i = 0; i < desks.length; i += 4) {
      deskGroups.push(desks.slice(i, i + 4))
    }

    return (
      <div className="flex flex-col gap-4 sm:gap-6">
        {deskGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="relative grid grid-cols-2 gap-0 p-0 border-2 border-gray-200 rounded-lg overflow-hidden">
            {group.map((deskNumber, deskIndex) => {
              const isPresent = attendanceData.includes(deskNumber)
              return (
                <div
                  key={deskNumber}
                  onClick={() => onDeskClick(deskNumber)}
                  className={`
                    relative w-12 h-10 sm:w-16 sm:h-12 border border-transparent cursor-pointer transition-all duration-200 hover:scale-105
                    ${isPresent 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }
                    ${deskIndex === 0 || deskIndex === 1 ? 'border-b-0' : ''}
                    ${deskIndex === 0 || deskIndex === 2 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-semibold">{deskNumber}</span>
                  </div>
                </div>
              )
            })}
            {/* 십자가 칸막이 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-full h-0.5 bg-amber-700"></div>
              <div className="absolute h-full w-0.5 bg-amber-700"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
