import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'

const CaptainSignup = () => {

  const navigate = useNavigate()
  const { setCaptain } = useContext(CaptainDataContext)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleCapacity, setVehicleCapacity] = useState('')
  const [vehicleType, setVehicleType] = useState('')

  const submitHandler = async (e) => {
    e.preventDefault()

    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email,
      password,
     vehicle: {
  color: vehicleColor,
  plate: vehiclePlate,
  capacity: vehicleCapacity,
  vehicleType: vehicleType
}
    }

    try {
      console.log("Sending:", captainData)

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        captainData
      )

      if (response.status === 201) {
        const data = response.data
        setCaptain(data.captain)
        localStorage.setItem('token', data.token)
        navigate('/captain-home')
      }

    } catch (err) {
  console.log("❌ ERROR RESPONSE:", err.response?.data)
  console.log("STATUS:", err.response?.status)
}

    // reset
    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    setVehicleColor('')
    setVehiclePlate('')
    setVehicleCapacity('')
    setVehicleType('')
  }

  return (
    <div className='py-5 px-5 h-screen flex flex-col justify-between'>
      <div>
        <img className='w-20 mb-3' src="https://tse4.mm.bing.net/th/id/OIP.6Vwu6wQagpNpFvgCvXJC3wAAAA?pid=Api&P=0&h=180" alt="" />

        <form onSubmit={submitHandler}>

          <h3 className='text-lg font-medium mb-2'>Captain Name</h3>
          <div className='flex gap-4 mb-7'>
            <input required className='bg-[#eee] w-1/2 px-4 py-2 rounded-lg'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder='First name'
            />
            <input required className='bg-[#eee] w-1/2 px-4 py-2 rounded-lg'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder='Last name'
            />
          </div>

          <h3 className='text-lg font-medium mb-2'>Email</h3>
          <input required type="email"
            className='bg-[#eee] w-full px-4 py-2 rounded-lg mb-7'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='email@example.com'
          />

          <h3 className='text-lg font-medium mb-2'>Password</h3>
          <input required type="password"
            className='bg-[#eee] w-full px-4 py-2 rounded-lg mb-7'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Min 6 characters'
          />

          <h3 className='text-lg font-medium mb-2'>Vehicle Info</h3>

          <div className='flex gap-4 mb-7'>
            <input required className='bg-[#eee] w-1/2 px-4 py-2 rounded-lg'
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              placeholder='Color'
            />
            <input required className='bg-[#eee] w-1/2 px-4 py-2 rounded-lg'
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              placeholder='Plate'
            />
          </div>

          <div className='flex gap-4 mb-7'>
            <input required type="number"
              className='bg-[#eee] w-1/2 px-4 py-2 rounded-lg'
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
              placeholder='Capacity'
            />

            <select
  required
  value={vehicleType}
  onChange={(e) => setVehicleType(e.target.value)}
>
  <option value="" disabled>Select Vehicle Type</option>
  <option value="car">Car</option>
  <option value="auto">Auto</option>
  <option value="motorcycle">Bike</option>
</select>
          </div>

          <button className='bg-black text-white w-full py-2 rounded-lg'>
            Create Captain Account
          </button>

        </form>

        <p className='text-center mt-3'>
          Already have account? <Link to='/captain-login' className='text-blue-600'>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default CaptainSignup