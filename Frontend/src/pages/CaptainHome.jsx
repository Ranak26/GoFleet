import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ridePopupPanel, setRidePopupPanel] = useState(false)
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ride, setRide] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain, setCaptain } = useContext(CaptainDataContext)

    // ✅ FETCH CAPTAIN DATA
    useEffect(() => {
        const fetchCaptain = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/captains/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                )

                console.log("Captain Data:", res.data) // debug
                setCaptain(res.data.captain)

            } catch (err) {
                console.error("Error fetching captain:", err)
            }
        }

        fetchCaptain()
    }, [])

    // ✅ SOCKET + LOCATION UPDATE (runs AFTER captain is available)
    useEffect(() => {
        if (!captain) return

        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    socket.emit('update-location-captain', {
                        userId: captain._id,
                        location: {
                            ltd: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                })
            }
        }

        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        return () => clearInterval(locationInterval)

    }, [captain])

    // ✅ SOCKET LISTENER (best practice: inside useEffect)
    useEffect(() => {
        socket.on('new-ride', (data) => {
            setRide(data)
            setRidePopupPanel(true)
        })

        return () => {
            socket.off('new-ride')
        }
    }, [socket])

    // ✅ CONFIRM RIDE
    async function confirmRide() {
        try {
            await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
                {
                    rideId: ride._id,
                    captainId: captain._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            setRidePopupPanel(false)
            setConfirmRidePopupPanel(true)

        } catch (err) {
            console.error("Error confirming ride:", err)
        }
    }

    // ✅ ANIMATIONS
    useGSAP(() => {
        gsap.to(ridePopupPanelRef.current, {
            transform: ridePopupPanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [ridePopupPanel])

    useGSAP(() => {
        gsap.to(confirmRidePopupPanelRef.current, {
            transform: confirmRidePopupPanel ? 'translateY(0)' : 'translateY(100%)'
        })
    }, [confirmRidePopupPanel])

    return (
        <div className='h-screen'>

            {/* HEADER */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <img
                    className='w-16'
                    src="https://tse4.mm.bing.net/th/id/OIP.6Vwu6wQagpNpFvgCvXJC3wAAAA?pid=Api&P=0&h=180"
                    alt=""
                />
                <Link to='/captain-home' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* MAP / IMAGE */}
            <div className='h-3/5'>
                <img
                    className='h-full w-full object-cover'
                    src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
                    alt=""
                />
            </div>

            {/* CAPTAIN DETAILS */}
            <div className='h-2/5 p-6'>
                <CaptainDetails />
            </div>

            {/* RIDE POPUP */}
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>

            {/* CONFIRM RIDE POPUP */}
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel}
                />
            </div>

        </div>
    )
}

export default CaptainHome