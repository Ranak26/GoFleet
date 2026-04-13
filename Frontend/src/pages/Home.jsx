import React, { useEffect, useRef, useState, useContext } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'

import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import LiveTracking from '../components/LiveTracking';

import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [pickup, setPickup] = useState('')
    const [destination, setDestination] = useState('')
    const [panelOpen, setPanelOpen] = useState(false)

    const [vehiclePanel, setVehiclePanel] = useState(false)
    const [confirmRidePanel, setConfirmRidePanel] = useState(false)
    const [vehicleFound, setVehicleFound] = useState(false)
    const [waitingForDriver, setWaitingForDriver] = useState(false)

    const [pickupSuggestions, setPickupSuggestions] = useState([])
    const [destinationSuggestions, setDestinationSuggestions] = useState([])
    const [activeField, setActiveField] = useState(null)

    const [fare, setFare] = useState({})
    const [vehicleType, setVehicleType] = useState(null)
    const [ride, setRide] = useState(null)

    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)

    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    // ✅ FIX 1: Safe socket join
    useEffect(() => {
        if (user?._id && socket) {
            socket.emit("join", { userType: "user", userId: user._id })
        }
    }, [user, socket])

    // ✅ FIX 2: socket listeners inside useEffect
    useEffect(() => {
        if (!socket) return;

        const handleRideConfirmed = (ride) => {
            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(ride)
        }

        const handleRideStarted = (ride) => {
            setWaitingForDriver(false)
            navigate('/riding', { state: { ride } })
        }

        socket.on('ride-confirmed', handleRideConfirmed)
        socket.on('ride-started', handleRideStarted)

        // cleanup
        return () => {
            socket.off('ride-confirmed', handleRideConfirmed)
            socket.off('ride-started', handleRideStarted)
        }
    }, [socket, navigate])

    // ------------------ API CALLS ------------------

    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setPickupSuggestions(res.data || [])
        } catch (err) {
            console.log(err)
        }
    }

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setDestinationSuggestions(res.data || [])
        } catch (err) {
            console.log(err)
        }
    }

    const submitHandler = (e) => e.preventDefault()

    // ------------------ GSAP ------------------

    useGSAP(() => {
        gsap.to(panelRef.current, {
            height: panelOpen ? '70%' : '0%',
            padding: panelOpen ? 24 : 0
        })
        gsap.to(panelCloseRef.current, {
            opacity: panelOpen ? 1 : 0
        })
    }, [panelOpen])

    useGSAP(() => {
        gsap.to(vehiclePanelRef.current, {
            transform: vehiclePanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [vehiclePanel])

    useGSAP(() => {
        gsap.to(confirmRidePanelRef.current, {
            transform: confirmRidePanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [confirmRidePanel])

    useGSAP(() => {
        gsap.to(vehicleFoundRef.current, {
            transform: vehicleFound ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [vehicleFound])

    useGSAP(() => {
        gsap.to(waitingForDriverRef.current, {
            transform: waitingForDriver ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [waitingForDriver])

    // ------------------ RIDE ------------------

    const findTrip = async () => {
        setVehiclePanel(true)
        setPanelOpen(false)

        try {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setFare(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    const createRide = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
        } catch (err) {
            console.log(err)
        }
    }

    // ------------------ UI ------------------

    return (
        <div className='h-screen relative overflow-hidden'>

            <img className='w-16 absolute left-5 top-5'
                src="https://tse4.mm.bing.net/th/id/OIP.6Vwu6wQagpNpFvgCvXJC3wAAAA?pid=Api&P=0&h=180" alt="GoFleet" />
                
            <div className='h-screen w-screen'>
                <LiveTracking />
            </div>

            <div className='flex flex-col justify-end h-screen absolute top-0 w-full'>
                <div className='h-[30%] p-6 bg-white relative'>

                    <h5 ref={panelCloseRef}
                        onClick={() => setPanelOpen(false)}
                        className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>

                    <h4 className='text-2xl font-semibold'>Find a trip</h4>

                    <form className='relative py-3' onSubmit={submitHandler}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>

                        <input
                            value={pickup}
                            onClick={() => { setPanelOpen(true); setActiveField('pickup') }}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            placeholder='Add a pick-up location'
                        />

                        <input
                            value={destination}
                            onClick={() => { setPanelOpen(true); setActiveField('destination') }}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3'
                            placeholder='Enter your destination'
                        />
                    </form>

                    <button onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>

                <div ref={panelRef} className='bg-white h-0 overflow-hidden'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>

            {/* PANELS */}
            <div ref={vehiclePanelRef} className='fixed w-full bottom-0 translate-y-full bg-white px-3 py-10'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                />
            </div>

            <div ref={confirmRidePanelRef} className='fixed w-full bottom-0 translate-y-full bg-white px-3 py-6'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            <div ref={vehicleFoundRef} className='fixed w-full bottom-0 translate-y-full bg-white px-3 py-6'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound}
                />
            </div>

            <div ref={waitingForDriverRef} className='fixed w-full bottom-0 bg-white px-3 py-6'>
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver}
                />
            </div>

        </div>
    )
}

export default Home