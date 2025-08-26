import React, { useState, useEffect } from 'react'
import { MapPin, Settings, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const HallSettings = () => {
    const [halls, setHalls] = useState([
        { name: 'Hall 1', isAvailable: true },
        { name: 'Hall 2', isAvailable: true },
        { name: 'Hall 3', isAvailable: true },
        { name: 'Hall 4', isAvailable: true },
        { name: 'Hall 5', isAvailable: true }
    ])

    // Load from localStorage on mount
    useEffect(() => {
        const savedHalls = localStorage.getItem('cinemaHalls')
        if (savedHalls) {
            setHalls(JSON.parse(savedHalls))
        }
    }, [])

    // Save to localStorage whenever halls change
    useEffect(() => {
        localStorage.setItem('cinemaHalls', JSON.stringify(halls))
    }, [halls])

    const toggleHallAvailability = (index) => {
        const newHalls = [...halls]
        newHalls[index].isAvailable = !newHalls[index].isAvailable
        setHalls(newHalls)
        
        toast.success(`${newHalls[index].name} ${newHalls[index].isAvailable ? 'enabled' : 'disabled'}`)
    }

    const addHall = () => {
        const newHallNumber = halls.length + 1
        const newHall = {
            name: `Hall ${newHallNumber}`,
            isAvailable: true
        }
        setHalls([...halls, newHall])
        toast.success(`${newHall.name} added`)
    }

    const removeHall = (index) => {
        if (halls.length <= 1) {
            toast.error('Must have at least one hall')
            return
        }
        
        const removedHall = halls[index]
        const newHalls = halls.filter((_, i) => i !== index)
        setHalls(newHalls)
        toast.success(`${removedHall.name} removed`)
    }

    const updateHallName = (index, newName) => {
        if (!newName.trim()) return
        
        const newHalls = [...halls]
        newHalls[index].name = newName.trim()
        setHalls(newHalls)
    }

    // Export function to get available halls
    window.getAvailableHalls = () => halls.filter(hall => hall.isAvailable)

    return (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-white">Hall Settings</h3>
                </div>
                
                <button
                    onClick={addHall}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dull text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Hall
                </button>
            </div>

            <div className="space-y-3">
                {halls.map((hall, index) => (
                    <div 
                        key={index}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                            hall.isAvailable 
                                ? 'border-green-500/30 bg-green-500/5' 
                                : 'border-red-500/30 bg-red-500/5'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-4 h-4 rounded-full ${
                                    hall.isAvailable ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                
                                <input
                                    type="text"
                                    value={hall.name}
                                    onChange={(e) => updateHallName(index, e.target.value)}
                                    className="bg-transparent text-white font-semibold text-lg border-none outline-none focus:bg-gray-700/20 rounded px-2 py-1"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                {halls.length > 1 && (
                                    <button
                                        onClick={() => removeHall(index)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                
                                <button
                                    onClick={() => toggleHallAvailability(index)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                        hall.isAvailable
                                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                    }`}
                                >
                                    {hall.isAvailable ? (
                                        <>
                                            <XCircle className="w-4 h-4" />
                                            Disable
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Enable
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                    <strong>Available Halls:</strong> {halls.filter(h => h.isAvailable).map(h => h.name).join(', ') || 'None'}
                </p>
            </div>
        </div>
    )
}

export default HallSettings